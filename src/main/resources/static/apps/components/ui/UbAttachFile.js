const UbAttachFile = {
    name: 'ub-attach-file',
    template: `
        <vue-file-agent
                ref="vueFileAgent"
                :upload-url="uploadUrl"
                :theme="'list'"
                :auto="false"
                :multiple="true"
                :meta="true"
                :linkable="true"
                :deletable="innerDeletable"
                :readonly="innerReadonly"
                :accept="innerAccept"
                :max-size="innerMaxSize"
                :max-files="innerMaxFiles"
                :help-text="innerHelpText"
                :error-text="innerErrorText"

                @select="filesSelected($event)"
                @beforedelete="onBeforeDelete($event)"
                @delete="fileDeleted($event)"
                v-model="innerFileRecords"
        >
          <template v-slot:file-preview="slotProps">
            <div :key="slotProps.index" class="grid-box-item file-row">
              <button type="button" class="close remove" aria-label="Remove" @click="removeFileRecord(slotProps.fileRecord)">
                <span aria-hidden="true">&times;</span>
              </button>
              <div class="progress" :class="{'completed': slotProps.fileRecord.progress() == 100}">
                <div class="progress-bar" role="progressbar" :style="{width: slotProps.fileRecord.progress() + '%'}"></div>
              </div>
              <strong>{{ slotProps.fileRecord.name() }}</strong> <span class="text-muted">({{ slotProps.fileRecord.size() }})</span>
            </div>
          </template >

        </vue-file-agent>
    `,
    components: {
        VueFileAgent: VueFileAgent.VueFileAgent
    },
    props: {
        fileRecords: {
            type: Array,
            required: false,
            default: function () {
                return [];
            }
        },
        readonly: {
            type: Boolean,
            required: false,
            default: false
        },
        deletable: {
            type: Boolean,
            required: false,
            default: true
        },
        accept: {
            type: String,
            required: false,
            default: ''
        },
        maxSize: {
            type: String,
            required: false,
            default: '100MB'
        },
        maxFiles: {
            type: Number,
            required: false,
            default: 10
        },

        attachDivCd: {
            type: String,
            required: false
        },
        dataNo: {
            type: [String, Number],
            required: false
        },
        attachFileList: Array
    },
    data: function () {
        return {
            model: {
                empNo: '',
                cntnt: ''
            },
            innerFileRecords: this.fileRecords,
            innerAttachFileList: this.attachFileList,
            innerReadonly: this.readonly,
            innerDeletable: this.deletable,
            innerHelpText: 'Choose images or zip files',
            innerAccept: this.accept,
            innerMaxSize: this.maxSize,
            innerMaxFiles: this.maxFiles,
            innerErrorText: {
                type: 'Invalid file type. Only (' + this.accept + ') Allowed',
                size: 'Files should not exceed ' + this.maxSize + ' in size'
            },


            fileRecordsForUpload: [],
            uploadUrl: this.$settings.requestMapping + '/base/files',
            uploadHeader: {}
        };
    },
    created() {
        this.fetchData();
        if (this.accept === '') {
            this.innerHelpText = 'Choose any files';
        } else {
            this.innerHelpText = 'Choose ' + this.innerAccept + ' files';
        }

        if (this.innerReadonly) {
            this.innerDeletable = false;
            this.innerHelpText = 'There is no file.';
        }
    },
    computed: {},
    methods: {
        download(prop) {
            console.log(prop);
            const fileNo = prop.raw.upload.fileNo;
            download({url: '/base/files/' + fileNo + '/download'}).catch((html, url) => {
                notify('해당 파일은 존재하지 않습니다.', {}, {'type': 'danger'});
            });
        },
        removeFileRecord(prop) {
            console.log('removeFileRecord', prop);
        },
        fetchData() {
            if (this.attachDivCd !== undefined && this.dataNo !== undefined) {
                this.xAjax({
                    url: '/base/files',
                    method: 'GET',
                    data: {
                        attachDivCd: this.attachDivCd,
                        dataNo: this.dataNo
                    }
                }).then(response => {
                    this.$emit('fetch', response)
                    const innerFileRecords = [];
                    response.forEach(item => {
                        const file = {
                            name: item['userFileNm'],
                            size: item['fileSize'],
                            type: '',
                            ext: item['extNm'],
                            // url: `javascript:download({url: '/base/files/${item['fileNo']}/download'});`,
                            url: `${this.uploadUrl}/${item['fileNo']}/download`,
                            urlResized: item['filePath'] + '/' + item['fileNm'],
                            src: item['filePath'] + '/' + item['fileNm'],
                            progress: 100,
                            data: item
                        };
                        innerFileRecords.push(file);

                        if (Array.isArray(this.innerAttachFileList)) {
                            this.innerAttachFileList.push(Object.assign({}, item));
                        }
                    });

                    this.innerFileRecords = innerFileRecords;
                    this.$nextTick(() => {
                        //console.log('innerFileRecords', this.innerFileRecords);
                    });
                });
            }
        },
        uploadFiles: function () {
            // Using the default uploader. You may use another uploader instead.
            this.$refs.vueFileAgent.upload(this.uploadUrl, this.uploadHeader, this.fileRecordsForUpload, (fileRecord) => {
                const formData = new FormData();
                formData.append('file', fileRecord.file);
                formData.append('filename', fileRecord.name());
                formData.append('ext', fileRecord.raw.ext);
                console.log('@@@@@', fileRecord.raw);

                return formData;
            }).then((res) => {
                res.forEach(item => {
                    console.log(item);
                    const serverData = item.data[0];
                    const fileRecord = item.fileRecord;
                    const meta = JSON.stringify({
                        type: fileRecord.type,
                        width: fileRecord.dimensions.width,
                        height: fileRecord.dimensions.height
                    });

                    this.innerAttachFileList.push(Object.assign(serverData, {
                        ext: fileRecord.ext,
                        meta: meta,
                        attachDivCd: this.attachDivCd,
                        dataNo: this.dataNo
                    }));

                    fileRecord.data = serverData;
                });

                this.$emit('update:attachFileList', this.innerAttachFileList);

                console.log('complete', res);
            });

            this.fileRecordsForUpload = [];
        },
        filesSelected: function (fileRecordsNewlySelected) {
            const validFileRecords = fileRecordsNewlySelected.filter((fileRecord) => !fileRecord.error);
            this.fileRecordsForUpload = this.fileRecordsForUpload.concat(validFileRecords);
            this.$emit('update:fileRecords', this.innerFileRecords);
            this.uploadFiles();
        },
        clear: function () {
            this.innerFileRecords = [];
            this.$emit('update:fileRecords', this.innerFileRecords);
            this.innerAttachFileList = [];
            this.$emit('update:attachFileList', this.innerAttachFileList);
        },
        onBeforeDelete: function (fileRecord) {
            const i = this.fileRecordsForUpload.indexOf(fileRecord);
            if (i !== -1) {
                this.fileRecordsForUpload.splice(i, 1);
            } else {
                if (confirm('Are you sure you want to delete?')) {
                    this.$refs.vueFileAgent.deleteFileRecord(fileRecord); // will trigger 'delete' event
                }
            }
        },
        fileDeleted: function (fileRecord) {
            this.innerAttachFileList = this.innerAttachFileList.filter(attachFile => {
                if (attachFile.fileRecord === fileRecord.data) {
                    return false;
                }

                if (attachFile.fileNo && (attachFile.fileNo === fileRecord.data.fileNo)) {
                    attachFile.workType = 'DELETE';
                }

                return true;
            });

            this.$emit('update:attachFileList', this.innerAttachFileList);
            this.$emit('update:fileRecords', this.innerFileRecords);
        }
    },
    watch: {
        'dataNo': {
            handler: function (dataNo) {
                if (dataNo) {
                    this.fetchData();
                }
            }
        }
    }
};

export default UbAttachFile;