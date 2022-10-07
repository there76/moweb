const UbTextEditor = {
    name: 'ub-text-editor',
    template: `
        <textarea :id="computedId" :value="value" :dialog="dialog" :height="height"></textarea>
    `,
    props: {
        id: {
            type: String,
            default: 'editor'
        },
        value: {
            default: ''
        },
        toolbar1: {
            default: 'undo redo | bold italic strikethrough | forecolor backcolor | template link | bullist numlist | ltr rtl | removeformat'
        },
        toolbar2: {
            default: ''
        },
        plugins: {
            default: function() {
                const plugins = ['code', 'image', 'table', 'fullscreen', 'advlist', 'autolink', 'lists', 'link']; // 'advlist autolink lists link image charmap print preview anchor textcolor',
                // 'searchreplace visualblocks code fullscreen',
                // 'insertdatetime media table contextmenu paste code directionality template colorpicker textpattern'
                return plugins;
            },
            type: Array
        },
        extendsPlugins: {
            type: Array,
            default: () => []
        },
        extendsOptions: {
            type: Object,
            default: () => {}
        },
        other: {
            default: function() {
                const other = {
                    height: 200,
                    templates: [],
                    // skin:'dark',
                    // content_css: '/static/lib/vue/vue-easy-tinymce-1.0.2/css/dark/content.css',
                    skin: 'lightgray',
                    content_css: '/static/lib/vue/vue-easy-tinymce-1.0.2/css/tinymce-content.css',
                    content_style: 'body { font-family: Roboto Light; font-size: 16px; }' + '.left { text-align: left; }' + 'img.left { float: left; }' + 'table.left { float: left; }' + '.right { text-align: right; }' + 'img.right { float: right; }' + 'table.right { float: right; }' + '.center { text-align: center; }' + 'img.center { display: block; margin: 0 auto; }' + 'table.center { display: block; margin: 0 auto; }' + '.full { text-align: justify; }' + 'img.full { display: block; margin: 0 auto; }' + 'table.full { display: block; margin: 0 auto; }' + '.bold { font-weight: bold; }' + '.italic { font-style: italic; }' + '.underline { text-decoration: underline; }' + '.title { font-family: Raleway Bold; font-size: 26px; }' + '.subtitle { font-family: Roboto Medium; font-size: 20px; }',
                    branding: false,
                    elementpath: false
                };
                return other;
            },
            type: Object
        },
        dialog: {
            type: Boolean,
            default: false
        },
        // dialog 시점 차이가 있어서 dialog 에서 쓸꺼면 true false 필요...
        height: {
            type: Number,
            default: 200
        }
    },
    data: function() {
        return {};
    },
    computed: {
        //for multi instance support
        computedId: function() {
            if (this.id === 'editor' || this.id === '' || this.id === null) {
                return 'editor-' + this.guidGenerator(); //put default value on computedId
            } else {
                return this.id;
            }
        }
    },
    watch: {
        value: function(newValue, oldValue) {
            // if v-model content change programmability
            if (this.objTinymce && this.value !== this.objTinymce.getContent()) this.objTinymce.setContent(this.value);
        } // "dialog":{
        //     handler:function() {
        //         tinymce.remove('#'+this.$el.id);
        //         this.$nextTick(()=>{
        //             this.initEditor();
        //         });
        //     }
        // },
    },
    mounted() {
        if (this.dialog === true) {
            tinymce.remove('#' + this.$el.id);
        } // dialog 형태로 보여줄때 vue DOM Update 처리가 완료되기전에 tinymce 초기화가 되는 현상이 있어서 $nextTick 처리
        this.$nextTick(() => {
            this.initEditor();
        });
    },
    destroyed() {
        tinymce.get(this.computedId).remove();
    },
    methods: {
        guidGenerator: function() {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
            }
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
        },
        uploadImages: function() {
            const vm = this;
            return new Promise((resolve, reject) => {
                const rawText = `<div class="temp-wrapper">${vm.objTinymce.getContent({
          format: 'raw'
        })}</div>`;
                const $rawText = $(rawText);
                const $images = $rawText.find('IMG');
                const deferredArray = [];
                $images.each(function() {
                    const img = this;
                    const src = img.src;
                    if (!src.startsWith('blob:')) {
                        return true;
                    }
                    const blobInfo = vm.objTinymce.editorUpload.blobCache.getByUri(src);
                    if (!blobInfo) {
                        return true;
                    }
                    const deferred = $.Deferred();
                    deferredArray.push(deferred);
                    const fileBaseUrl = '/api/v1/base/files';
                    const xhr = new XMLHttpRequest();
                    xhr.withCredentials = false;
                    xhr.open('POST', fileBaseUrl);
                    xhr.onload = function() {
                        if (xhr.status != 200) {
                            deferred.reject('HTTP Error: ' + xhr.status);
                            return;
                        }
                        const response = JSON.parse(xhr.responseText);
                        let url = null;
                        if (response && response.length > 0) {
                            url = response[0].url;
                        }
                        if (typeof url != 'string') {
                            deferred.reject('Invalid JSON: ' + xhr.responseText);
                            return;
                        }
                        img.src = url;
                        deferred.resolve(url);
                    };
                    const formData = new FormData();
                    const file = blobInfo.blob();
                    formData.append('file', file, blobInfo.filename());
                    formData.append("attachDivCd", "EDITOR");
                    const reader = new FileReader(); //Read the contents of Image File.
                    reader.readAsDataURL(file);
                    reader.onload = function(e) {
                        //Initiate the JavaScript Image object.
                        const image = new Image(); //Set the Base64 string return from FileReader as source.
                        image.src = e.target.result; //Validate the File Height and Width.
                        image.onload = function() {
                            const height = this.height;
                            const width = this.width;
                            formData.append('meta', JSON.stringify({
                                type: file.type,
                                width: width,
                                height: height
                            }));
                            xhr.send(formData);
                        };
                    };
                });
                if (deferredArray.length > 0) {
                    $.when.apply($, deferredArray).then(response => {
                        vm.objTinymce.editorUpload.blobCache.destroy();
                        const contents = $rawText.html();
                        vm.updateValue(contents);
                        resolve(contents);
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    resolve(vm.objTinymce.getContent());
                }
            });
        },
        updateValue: function(value) {
            this.$emit('input', value);
        },
        initEditor: function() {
            let theme = ubicus.base.util.getCookie('theme') || 'lightgray';
            if (theme !== 'black' && theme !== 'lightgray') {
                theme = 'lightgray';
            }
            this.other['skin'] = ubicus.base.ui.tinymce.skinInfo[theme]['skin'];
            this.other['content_css'] = ubicus.base.ui.tinymce.getSkinPath(theme === 'black') + '?' + new Date().getTime();
            this.other['height'] = this.height;
            const component = this;
            const initialOptions = {
                //target: this.$el.children[0], //(when textarea template is inside a element like a div)
                target: this.$el,
                toolbar1: this.toolbar1,
                toolbar2: this.toolbar2,
                plugins: [...this.plugins, ...this.extendsPlugins],
                init_instance_callback: function(editor) {
                    editor.on('Change KeyUp Undo Redo', function(e) {
                        component.updateValue(editor.getContent());
                    }); //editor.setContent(component.value); //use instead :value="value"
                    component.objTinymce = editor;
                    if (component.value) {
                        component.objTinymce.setContent(component.value);
                    }
                },
                paste_data_images: true,
                image_title: false,
                automatic_uploads: true,
                /*images_upload_handler: function (blobInfo, success, failure) {
                    const fileBaseUrl = '/api/v2/base/files';
                    const xhr = new XMLHttpRequest();
                    xhr.withCredentials = false;
                    xhr.open('POST', fileBaseUrl);
                     xhr.onload = function () {
                        if (xhr.status != 200) {
                            failure('HTTP Error: ' + xhr.status);
                            return;
                        }
                         const response = JSON.parse(xhr.responseText);
                        let url = null;
                        if (response && response.length > 0) {
                            url = response[0].url;
                        }
                         if (typeof url != 'string') {
                            failure('Invalid JSON: ' + xhr.responseText);
                            return;
                        }
                        success(url);
                    };
                     const formData = new FormData();
                    const file = blobInfo.blob();
                    formData.append('file', file, blobInfo.filename());
                    formData.append("attachDivCd", "ISMAAT34");
                      const reader = new FileReader();
                    //Read the contents of Image File.
                    reader.readAsDataURL(file);
                    reader.onload = function (e) {
                         //Initiate the JavaScript Image object.
                        const image = new Image();
                         //Set the Base64 string return from FileReader as source.
                        image.src = e.target.result;
                         //Validate the File Height and Width.
                        image.onload = function () {
                            const height = this.height;
                            const width = this.width;
                            formData.append('meta', JSON.stringify({
                                type: file.type,
                                width: width,
                                height: height
                            }));
                            xhr.send(formData);
                        };
                    };
                },*/
                file_picker_types: 'image',
                /* and here's our custom image picker*/
                file_picker_callback: function(cb, value, meta) {
                    const input = document.createElement('input');
                    input.setAttribute('type', 'file');
                    input.setAttribute('accept', 'image/*');
                    input.onchange = function() {
                        const file = this.files[0];
                        const reader = new FileReader();
                        reader.onload = function() {
                            const id = 'blobid' + new Date().getTime();
                            const blobCache = tinymce.activeEditor.editorUpload.blobCache;
                            const base64 = reader.result.split(',')[1];
                            const blobInfo = blobCache.create(id, file, base64);
                            blobCache.add(blobInfo);
                            /* call the callback and populate the Title field with the file name */
                            cb(blobInfo.blobUri(), {
                                title: file.name
                            });
                        };
                        reader.readAsDataURL(file);
                    };
                    input.click();
                }
            };
            const options = Object.assign({}, initialOptions, this.other);
            tinymce.init({
                ...options,
                ...this.extendsOptions
            });
        },
        setValueAtCursorPosition: function(value) {
            this.objTinymce.execCommand('mceInsertContent', false, value);
            this.$emit('input', this.objTinymce.getContent());
        }
    }
};
export default UbTextEditor;
