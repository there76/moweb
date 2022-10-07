const setImageDimensions = item => new Promise(resolve => {
    const img = new Image();
    const dataURL = window.URL.createObjectURL(item.file);
    img.onload = () => {
        item.dimensions = {
            height: img.height,
            width: img.width,
        };
        item.dataURL = dataURL;
        resolve();
    }
    img.src = dataURL
})


const UbSimpleFileSelector = {
    name: 'ub-simple-file-selector',
    template: `
        <div class="simple-file-upload" style="position:relative;">
            <div ref="dropzone" v-show="dragover" class="dropzone" 
            style="box-sizing: border-box;
                position: absolute;
                width: 100%;
                height: 100%;
                left: 0;
                top: 0;
                z-index: 99999;
                background: rgba(96, 167, 220, 0.8);
                border: 5px dashed #60a7dc;"></div>
            
            <input type="file" :multiple="multiple" v-show="false" ref="fileSelector" @change="onFileSelection" :accept="accept"/>
            <slot name="activator" :on="{ click: openFileSelector}">
                <ub-button mode="text" :color="color" :label="label" icon="mdi-plus" @click="openFileSelector"></ub-button>
            </slot>
            <slot name="list" v-bind:files="value">
                <ul class="files">
                  <li v-for="(file, index) in files">
                    <button @click="removeFile(index)">
                      x
                    </button>
                    {{ file.name }}
                  </li>
                </ul>
            </slot>
      </div>
    `,
    props: {
        multiple: {
            type: Boolean,
            default: true
        },
        dnd: {
            type: Boolean,
            default: true
        },
        label: {
            type: String,
            default: '파일선택'
        },
        color: {
            type: String,
            default: 'success'
        },
        attachDivCd: String,
        value: Array,
        accept: String,
    },
    data: () => ({
        files: [],
        input: null,
        dragover: false,
        maxFileSize: null,
        allowedUploadExtensions: null
    }),
    created() {
        this.maxFileSize = this.upload.maxFileSize || '100MB';
        this.allowedUploadExtensions = this.upload.allowedUploadExtensions || 'jpg,jpeg,png,gif,mp4,pdf';
    },
    mounted() {
        this.input = this.$refs['fileSelector'];
        if (this.value) {
            this.files = this.value
        } else {
            this.$emit('input', [])
        }

        const $el = this.$el;
        const $dropzone = this.$refs['dropzone'];


        $el.addEventListener('dragenter', e => {
            if(this.dnd) {
                e.preventDefault();
                this.dragover = true
            }
        });

        $dropzone.addEventListener("dragenter", e => {
            if(this.dnd) {
                e.preventDefault();
                this.dragover = true
            }
        });
        $dropzone.addEventListener("dragover", e => {
            if(this.dnd) {
                e.preventDefault();
                this.dragover = true
            }
        })

        $dropzone.addEventListener("dragleave", e => {
            if(this.dnd) {
                e.preventDefault()
                this.dragover = false
            }
        })

        $dropzone.addEventListener("drop", async (e) => {
            if(this.dnd) {
                e.preventDefault()
                this.dragover = false;
                if (e.dataTransfer) {
                    await this.addFiles(e.dataTransfer.files);
                }
            }
        });
    },
    methods: {
        clear() {
            this.input.value = '';
            this.files = [];
            this.$emit('input', []);
        },
        checkFileType(fileType) {
            const typeList = this.accept.split(',');
            for (let i = 0; i < typeList.length; i++) {
                if (fileType.match(typeList[i])) {
                    return true;
                }
            }

            return false;
        },
        checkFileExt(fileExt) {
            const allowedExtList = this.allowedUploadExtensions.split(',');
            for (let i = 0; i < allowedExtList.length; i++) {
                if (fileExt.match(allowedExtList[i])) {
                    return true;
                }
            }

            return false;
        },
        checkFileSize(fileSize) {
            return fileSize < this.getMaxFileSize();
        },
        getMaxFileSize() {
            const units = ['BYTES', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
            const unit = this.maxFileSize.replace(/[0-9]/g, '').toUpperCase();
            const size = Number(this.maxFileSize.replace(/[^0-9]/g, ''));

            return size * Math.pow(1024, units.indexOf(unit));
        },
        removeFile(index) {
            this.files.splice(index, 1)
        },
        async addFiles(files) {

            const inputFiles = [];
            for (let file of files) {

                if(!this.checkFileType(file.type)) {
                    console.warn('file type invalid.', file);
                    this.ubicus.base.lib.notify(`[${file.name}] 파일타입이 올바르지 않습니다.${this.accept} 타입의 파일만 허용됩니다.`, {title: "파일추가 경고"}, {type: 'error'});
                    continue;
                }

                if(!this.checkFileExt(file.name.split('.').pop())) {
                    console.warn('file ext invalid.', file);
                    this.ubicus.base.lib.notify(`[${file.name}] 파일확장자가 올바르지 않습니다.${this.allowedUploadExtensions} 타입의 파일만 허용됩니다.`, {title: "파일추가 경고"}, {type: 'error'});
                    continue;
                }

                if (!this.checkFileSize(file.size)) {
                    console.warn('file size invalid.', file);
                    this.ubicus.base.lib.notify(`[${file.name}] 파일크기가 초과하였습니다.${this.maxFileSize} 이하 파일만 허용됩니다.`, {title: "파일추가 경고"}, {type: 'error'});
                    continue;
                }

                const item = {file: file};
                if (file.type.includes('image/')) {
                    await setImageDimensions(item);
                }

                item.name = file.name;
                item.size = file.size;
                item.sizeText = this.ubicus.base.util.fileSize(file.size);
                item.workType = 'INSERT';
                item.attachDivCd = this.attachDivCd;

                inputFiles.push(item);
            }

            this.files.push(...inputFiles);

            if (inputFiles.length > 0) {
                this.$emit('fileSelection', inputFiles);
            }

        },
        async onFileSelection() {
            await this.addFiles(this.input.files)
            // reset file input
            this.input.value = null;
        },
        openFileSelector() {
            const event = new MouseEvent('click', {
                'view': window,
                'bubbles': true,
                'cancelable': true
            });
            this.input.dispatchEvent(event)
        }
    },
    watch: {
        files(files) {
            this.$emit('input', files)
        }
    }
}

export default UbSimpleFileSelector;
