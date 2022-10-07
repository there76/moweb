import crudMixIn from '/static/apps/mixin/crudMixIn.js';
import UbSimpleFileSelector from '/static/apps/components/ui/UbSimpleFileSelector.js';

export default {
    name: 'CertificationManager',
    components: {
        UbSimpleFileSelector
    },
    template: `
        <div>
        <v-sheet>
            <ub-search>
                <div class="w-190px">
                    <ub-date-range-picker label="기간" :start.sync="search.startDate" :end.sync="search.endDate" format="datetime"></ub-date-range-picker>
                </div>
                <div>
                    <v-select
                        v-model="search.useYn"
                        label="표시여부"
                        @change="fetchData(true)"
                        item-value="value"
                        item-text="text"
                        :items="[{text: '전체', value: null}, {text: '사용', value: 'Y'}, {text: '미사용', value: 'N'}]"
                        outlined
                        dense
                        hide-details
                    ></v-select>
                </div>
                <div class="search-form-btns">
                    <ub-button
                        color="primary"
                        label="조회"
                        icon="mdi-magnify"
                        @click="fetchData(true)"
                    ></ub-button>
                    <ub-button
                        color="info"
                        label="새로입력"
                        icon="mdi-plus"
                        @click="newItem()"
                    ></ub-button>
                </div>
            </ub-search>

            <v-data-table
                dense
                fixed-header
                :height="$settings.datatable.rows20"
                :footer-props="$settings.datatable.footer10"
                :headers="tbl.headers"
                :items="tbl.items"
                :options.sync="tbl.options"
                :server-items-length="tbl.total"
                single-select item-key="certKey"
                @click:row="selectItem"
            >
                <template #item.image="{item}">
                    <v-img :src="item.thumbnailImageUrl"></v-img>
                </template>
                <template #item.useYn="{item}">
                    <v-chip v-if="item.useYn === 'Y'" small color="red" text-color="white">사용</v-chip>
                    <v-chip v-else small>미사용</v-chip>
                </template>
            </v-data-table>
        </v-sheet>
        <ub-view :view.sync="view" class="position-relative">
            <template #body="{edit}">
                <v-sheet>
                    <v-form>
                        <v-row>
                            <v-col cols="12" sm="12" md="6" lg="6" xl="6">
                                <v-text-field
                                    label="인증서명"
                                    v-model="form.data.title"
                                    :rules="ubicus.base.rule.required"
                                ></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="12" md="6" lg="6" xl="6">
                                <v-text-field
                                    label="인증서 번호"
                                    v-model="form.data.number"
                                ></v-text-field>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="12">
                                <v-textarea
                                    label="인증서 설명"
                                    v-model="form.data.description"
                                ></v-textarea>
                            </v-col>
                        </v-row>
                        <v-row class="">
                            <v-col cols="12">
                                <ub-simple-file-selector
                                    v-model="form.data.certificateThumbnailFiles"
                                    @fileSelection="fileSelection"
                                    :multiple="false"
                                    accept="image/*"
                                    attachDivCd="CATALOGUE_THUMBNAIL"
                                >
                                    <template #activator="{on}">
                                        <ub-button
                                            mode="text"
                                            color="success"
                                            label="인증서 썸네일 이미지 추가"
                                            icon="mdi-plus"
                                            v-on="on"
                                        ></ub-button>
                                        <small class="ml-1">* 버튼 클릭 또는 이미지 파일을 끌어다 놓으세요.</small>
                                    </template>
                                    <template #list="{files}">
                                        <v-simple-table class="ml-0">
                                            <template v-slot:default>
                                                <colgroup>
                                                    <col width="310"/>
                                                    <col/>
                                                    <col width="200"/>
                                                    <col width="250"/>
                                                </colgroup>
                                                <thead>
                                                <tr>
                                                    <th class="text-center">이미지</th>
                                                    <th class="text-left">파일명</th>
                                                    <th class="text-center">크기</th>
                                                    <th class="text-center">다운/삭제</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                <tr v-for="(file, index) in files" :key="index">
                                                    <td
                                                        class="text-center pa-5"
                                                        @click="showImageSlider(index)"
                                                        style="cursor: pointer"
                                                    >
                                                        <img
                                                            :src="file.dataURL"
                                                            style="
                                                                max-width: 270px;
                                                                max-height: 200px;
                                                                box-shadow: 0px 0px 5px #000;
                                                            "
                                                        />
                                                    </td>
                                                    <td>
                                                        <span>{{ file.name }}</span>
                                                    </td>
                                                    <td class="text-center">
                                                        <p class="mb-0">
                                                            {{ file.dimensions.width }} *
                                                            {{ file.dimensions.height }}
                                                        </p>
                                                        <small>[{{ file.sizeText }}]</small>
                                                    </td>
                                                    <td class="text-center">
                                                        <v-btn
                                                            small
                                                            tile
                                                            color="danger"
                                                            @click="deleteImage(file, 'CERTIFICATE_THUMBNAIL', index)"
                                                        >
                                                            <v-icon x-small left>
                                                                mdi-minus
                                                            </v-icon>
                                                            취소
                                                        </v-btn>
                                                    </td>
                                                </tr>

                                                <tr
                                                    v-for="(file, index) in form.data.certificateSavedThumbnailFiles"
                                                    :key="file.fileKey"
                                                >
                                                    <td
                                                        class="text-center pa-5"
                                                        @click="showImageSlider(form.data.certificateThumbnailFiles.length + index)"
                                                        style="cursor: pointer"
                                                    >
                                                        <img
                                                            :src="file.dataURL"
                                                            :style="{'max-width':'270px', 'max-height': '200px', 'box-shadow': '0px 0px 5px #000', 'filter' : (file.workType === 'DELETE' ? 'grayscale(100%)' : 'none')}"
                                                        />
                                                    </td>
                                                    <td
                                                        :class="file.workType === 'DELETE' ? 'text-decoration-line-through' : ''"
                                                    >
                                                        <span>{{ file.name }}</span>
                                                    </td>
                                                    <td
                                                        class="text-center"
                                                        :class="file.workType === 'DELETE' ? 'text-decoration-line-through' : ''"
                                                    >
                                                        <p class="mb-0">
                                                            {{ file.dimensions.width }} *
                                                            {{ file.dimensions.height }}
                                                        </p>
                                                        <small>[{{ file.sizeText }}]</small>
                                                    </td>
                                                    <td class="text-center">
                                                        <v-btn
                                                            small
                                                            tile
                                                            color="success"
                                                            @click="downloadImage(file)"
                                                        >
                                                            <v-icon x-small left>
                                                                mdi-download
                                                            </v-icon>
                                                            다운로드
                                                        </v-btn>
                                                        <v-btn
                                                            small
                                                            tile
                                                            color="danger"
                                                            @click="deleteImage(file, 'CERTIFICATE_THUMBNAIL', index)"
                                                        >
                                                            <v-icon x-small left>
                                                                {{
                                                                    file.workType === 'DELETE' ?
                                                                        'mdi-backup-restore' : 'mdi-minus'
                                                                }}
                                                            </v-icon>
                                                            {{
                                                                file.workType === 'DELETE' ? '복원' :
                                                                    '삭제'
                                                            }}
                                                        </v-btn>
                                                    </td>
                                                </tr>
                                                </tbody>
                                            </template>
                                        </v-simple-table>
                                    </template>
                                </ub-simple-file-selector>
                            </v-col>
                        </v-row>
                        <v-row class="">
                            <v-col cols="12">
                                <ub-simple-file-selector
                                    v-model="form.data.certificateFiles"
                                    @fileSelection="fileSelection"
                                    :multiple="false"
                                    accept="image/*,application/pdf"
                                    attachDivCd="CERTIFICATE"
                                >
                                    <template #activator="{on}">
                                        <ub-button
                                            mode="text"
                                            color="success"
                                            label="인증서 파일 추가"
                                            icon="mdi-plus"
                                            v-on="on"
                                        ></ub-button>
                                        <small class="ml-1">* 버튼 클릭 또는 파일을 끌어다 놓으세요.</small>
                                    </template>
                                    <template #list="{files}">
                                        <v-simple-table class="ml-0">
                                            <template v-slot:default>
                                                <colgroup>
                                                    <col/>
                                                    <col width="200"/>
                                                    <col width="250"/>
                                                </colgroup>
                                                <thead>
                                                <tr>
                                                    <th class="text-left">파일명</th>
                                                    <th class="text-center">크기</th>
                                                    <th class="text-center">다운/삭제</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                <tr v-for="(file, index) in files" :key="index">
                                                    <td>
                                                        <span>{{ file.name }}</span>
                                                    </td>
                                                    <td class="text-center">
                                                        <p class="mb-0">{{ file.sizeText }}</p>
                                                    </td>
                                                    <td class="text-center">
                                                        <v-btn
                                                            small
                                                            tile
                                                            color="danger"
                                                            @click="deleteImage(file, 'CERTIFICATE', index)"
                                                        >
                                                            <v-icon x-small left>
                                                                mdi-minus
                                                            </v-icon>
                                                            취소
                                                        </v-btn>
                                                    </td>
                                                </tr>

                                                <tr
                                                    v-for="(file, index) in form.data.certificateSavedFiles"
                                                    :key="file.fileKey"
                                                >
                                                    <td
                                                        :class="file.workType === 'DELETE' ? 'text-decoration-line-through' : ''"
                                                    >
                                                        <span>{{ file.name }}</span>
                                                    </td>
                                                    <td
                                                        class="text-center"
                                                        :class="file.workType === 'DELETE' ? 'text-decoration-line-through' : ''"
                                                    >
                                                        <p class="mb-0">{{ file.sizeText }}</p>
                                                    </td>
                                                    <td class="text-center">
                                                        <v-btn
                                                            small
                                                            tile
                                                            color="success"
                                                            @click="downloadImage(file)"
                                                        >
                                                            <v-icon x-small left>
                                                                mdi-download
                                                            </v-icon>
                                                            다운로드
                                                        </v-btn>
                                                        <v-btn
                                                            small
                                                            tile
                                                            color="danger"
                                                            @click="deleteImage(file, 'CERTIFICATE', index)"
                                                        >
                                                            <v-icon x-small left>
                                                                {{
                                                                    file.workType === 'DELETE' ?
                                                                        'mdi-backup-restore' : 'mdi-minus'
                                                                }}
                                                            </v-icon>
                                                            {{
                                                                file.workType === 'DELETE' ? '복원' :
                                                                    '삭제'
                                                            }}
                                                        </v-btn>
                                                    </td>
                                                </tr>
                                                </tbody>
                                            </template>
                                        </v-simple-table>
                                    </template>
                                </ub-simple-file-selector>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="12">
                                <v-switch
                                    v-model="form.data.useYn"
                                    inset
                                    label="사용여부"
                                    true-value="Y"
                                    false-value="N"
                                ></v-switch>
                            </v-col>
                        </v-row>
                    </v-form>
                </v-sheet>
                <v-overlay absolute :opacity="0.2" :value="loading.show">
                  <v-progress-circular
                    indeterminate
                    size="64"
                    color="red"
                  ></v-progress-circular>
                </v-overlay>
            </template>
            <template #control="{edit}">
                <template v-if="edit">
                    <ub-button
                        mode="text"
                        color="warning"
                        label="수정"
                        icon="mdi-text-box-check"
                        @click="saveItem('PATCH')"
                    ></ub-button>
                    <ub-button mode="text" color="danger" label="삭제" icon="mdi-delete" @click="deleteItem(form.data, form.data.title)"></ub-button>
                </template>
                <template v-else>
                    <ub-button
                        mode="text"
                        color="warning"
                        label="저장"
                        icon="mdi-text-box-plus"
                        @click="saveItem('POST')"
                    ></ub-button>
                </template>
            </template>
        </ub-view>
        </div>
    `,
    mixins: [crudMixIn],
    data: () => ({
        url: '/admin/certificate',
        pk: 'certNo',
        search: {
            startDate: null,
            endDate: null,
            useYn: null
        },
        tbl: {
            headers: [
                {text: 'No', value: 'certNo', width: 60, align: 'center'},
                {text: '썸네일 이미지', value: 'image', width: 140, align: 'center'},
                {text: '인증서명', value: 'title'},
                {text: '인증서번호', value: 'number', width: 140, align: 'center'},
                {text: '등록일', value: 'regDt', width: 140, align: 'center'},
                {text: '등록자', value: 'regMngrNm', width: 140, align: 'center'},
                {text: '사용여부', value: 'useYn', width: 160, align: 'center'}
            ]
        },
        view: {
            outlined: true
        },
        form: {
            init: {
                certNo: '',
                title: '',
                description: '',
                useYn: 'Y',
                certificateThumbnailFiles: [],
                certificateSavedThumbnailFiles: [],
                certificateFiles: [],
                certificateSavedFiles: [],
            }
        }
    }),
    methods: {
        onCrudMixInActions(actionName, data, options) {
            if (actionName === 'selectItem') {
                if (Array.isArray(data.attachFiles)) {

                    this.form.data.certificateSavedThumbnailFiles = data.attachFiles.filter(file => file.attachDivCd === 'CERTIFICATE_THUMBNAIL').map(e => {
                        const meta = e.meta ? JSON.parse(e.meta) : {};
                        return {
                            name: e.userFileNm,
                            fileNm: e.fileNm,
                            fileKey: e.fileKey,
                            sizeText: this.ubicus.base.util.fileSize(e.fileSize),
                            dataURL: e.url,
                            attachDivCd: e.attachDivCd,
                            filePath: e.filePath,
                            workType: 'SELECTED',
                            dimensions: {
                                width: meta.width,
                                height: meta.height
                            }
                        };
                    });

                    this.form.data.certificateSavedFiles = data.attachFiles.filter(file => file.attachDivCd === 'CERTIFICATE').map(e => {
                        return {
                            name: e.userFileNm,
                            fileNm: e.fileNm,
                            fileKey: e.fileKey,
                            sizeText: this.ubicus.base.util.fileSize(e.fileSize),
                            dataURL: e.url,
                            attachDivCd: e.attachDivCd,
                            filePath: e.filePath,
                            workType: 'SELECTED',
                        };
                    });
                }
            }
        },
        saveItem(method) {
            this.loading.show = true;

            this.xAjaxMultipart({
                url: '/admin/certificate',
                method: method,
                fileParts: {
                    // 신규 업로드 이미지
                    certificateThumbnailFiles: this.form.data.certificateThumbnailFiles.map(e => e.file),
                    certificateFiles: this.form.data.certificateFiles.map(e => e.file)
                },
                parts: {
                    certificate: {
                        certNo: this.form.data.certNo,
                        title: this.form.data.title,
                        number: this.form.data.number,
                        description: this.form.data.description,
                        useYn: this.form.data.useYn
                    },
                    // 삭제 이미지
                    certificateDeleteThumbnailFiles: this.form.data.certificateSavedThumbnailFiles.filter(e => e.workType === 'DELETE'),
                    // 삭제 안되고 유지 되는 이미지
                    certificateUpdateThumbnailFiles: this.form.data.certificateSavedThumbnailFiles.filter(e => e.workType !== 'DELETE'),
                    // 삭제 이미지
                    certificateDeleteFiles: this.form.data.certificateSavedFiles.filter(e => e.workType === 'DELETE'),
                    // 삭제 안되고 유지 되는 이미지
                    certificateUpdateFiles: this.form.data.certificateSavedFiles.filter(e => e.workType !== 'DELETE')
                }
            }).then(resp => {
                this.ubicus.base.lib.notify(resp);
                this.fetchData(method === 'POST');
            }).finally(() => {
                this.loading.show = false;
            });
        },
        fileSelection(files) {
            console.log('fileSelection', files, this.form.data.certificateFiles);
        },
        downloadImage(file) {
            location.href = `${this.$settings.requestMapping}/base/files/${file.fileKey}/download`;
        },
        deleteImage(file, attachDivCd, index) {
            if (file.workType === 'INSERT') {
                if (attachDivCd === 'CERTIFICATE_THUMBNAIL') {
                    this.form.data.certificateThumbnailFiles.splice(index, 1);
                } else {
                    this.form.data.certificateFiles.splice(index, 1);
                }
            } else {
                if (file.workType === 'DELETE') {
                    file.workType = 'SELECTED';
                } else if (file.workType === 'SELECTED') {
                    file.workType = 'DELETE';
                }
            }
        }
    }
};
