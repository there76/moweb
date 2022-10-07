import crudMixIn from '/static/apps/mixin/crudMixIn.js';

import UbTextEditor from '/static/apps/components/admin/base/common/UbTextEditor.js';
import UbSimpleFileSelector from '/static/apps/components/ui/UbSimpleFileSelector.js';

export default {
    components: {
        UbTextEditor,
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
                    <v-select v-model="search.type" label="방식" @change="fetchData(true)" item-value="cd" item-text="cdNm" :items="ubicus.base.util.concatArray(codes.popupType, [{cdNm: '전체', cd: null}], false)" outlined dense hide-details></v-select>
                </div>
                <div>
                    <v-select v-model="search.useYn" label="사용구분" @change="fetchData(true)" :items="[{text: '전체', value: null}, {text: '사용', value: 'Y'}, {text: '미사용', value: 'N'}]" outlined dense hide-details></v-select>
                </div>
                <div class="search-form-btns">
                    <ub-button color="primary" label="조회" icon="mdi-magnify" @click="fetchData(true)"></ub-button>
                    <ub-button color="info" label="새로입력" icon="mdi-plus" @click="newItem()"></ub-button>
                </div>
            </ub-search>

            <v-data-table dense
                          fixed-header
                          :height="$settings.datatable.rows10"
                          :footer-props="$settings.datatable.footer10"
                          :headers="tbl.headers"
                          :items="tbl.items"
                          :options.sync="tbl.options"
                          :server-items-length="tbl.total"
                          single-select
                          item-key="popupKey"
                          @click:row="selectItem">
                <template #item.type="{item}">
                    <v-chip small v-text="getCodeName(codes.popupType, item.type)"></v-chip>
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
                            <v-col cols="6">
                                <v-radio-group row v-model="form.data.type">
                                    <v-subheader>방식</v-subheader>
                                    <v-radio v-for="popupType in codes.popupType" :label="popupType.cdNm" :value="popupType.cd" :key="popupType.cd"></v-radio>
                                </v-radio-group>
                            </v-col>
                            <v-col cols="6" class="d-flex">
                                <v-subheader>사용여부</v-subheader>
                                <v-switch inset dense hide-details
                                          :label="form.data.useYn === 'Y' ? '사용' : '미사용'"
                                          true-value="Y" false-value="N"
                                          v-model="form.data.useYn"
                                ></v-switch>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="12">
                                <v-text-field label="제목" outlined dense hide-details v-model="form.data.title"></v-text-field>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="12">
                                <v-text-field label="링크" outlined dense hide-details v-model="form.data.link"></v-text-field>
                            </v-col>
                        </v-row>
                        <v-row v-if="form.data.type === constant.POPUP_TYPE_POPUP_LAYER">
                            <v-col cols="3">
                                <v-text-field label="Width" type="number" outlined dense hide-details suffix="px" v-model="form.data.width"></v-text-field>
                            </v-col>
                            <v-col cols="3">
                                <v-text-field label="Height" type="number" outlined dense hide-details suffix="px" v-model="form.data.height"></v-text-field>
                            </v-col>
                            <v-col cols="3">
                                <v-text-field label="Top" type="number" outlined dense hide-details suffix="px" v-model="form.data.offsetTop"></v-text-field>
                            </v-col>
                            <v-col cols="3">
                                <v-text-field label="Left" type="number" outlined dense hide-details suffix="px" v-model="form.data.offsetLeft"></v-text-field>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="6">
                                <ub-date-range-picker label="기간" :start.sync="form.data.startDt" :end.sync="form.data.endDt" format="datetime"></ub-date-range-picker>
                            </v-col>
                            <v-col cols="6">
                                <v-text-field label="쿠키설정기간" type="number" outlined dense hide-details suffix="일" v-model="form.data.cookieDay"></v-text-field>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="12">
                                <v-radio-group row v-model="form.data.contentType">
                                    <v-subheader>내용구분</v-subheader>
                                    <v-radio v-for="popupContentType in codes.popupContentType" :label="popupContentType.cdNm" :value="popupContentType.cd" :key="popupContentType.cd"></v-radio>
                                </v-radio-group>
                            </v-col>
                        </v-row>
                        <v-row v-if="form.data.contentType === constant.POPUP_CONTENT_TYPE_HTML">
                            <ub-text-editor ref="textEditor" v-model="form.data.content" :value="form.data.content"></ub-text-editor>
                        </v-row>
                        <v-row v-if="form.data.contentType === constant.POPUP_CONTENT_TYPE_IMAGE">
                            <v-col cols="12">
                                <ub-simple-file-selector
                                    v-model="form.data.popupImageFiles"
                                    @fileSelection="fileSelection"
                                    :multiple="false"
                                    accept="image/*"
                                    attachDivCd="POPUP"
                                >
                                    <template #activator="{on}">
                                        <ub-button
                                            mode="text"
                                            color="success"
                                            label="이미지 추가"
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
                                                            @click="deleteImage(file, index)"
                                                        >
                                                            <v-icon x-small left>
                                                                mdi-minus
                                                            </v-icon>
                                                            취소
                                                        </v-btn>
                                                    </td>
                                                </tr>

                                                <tr
                                                    v-for="(file, index) in form.data.popupSavedImageFiles"
                                                    :key="file.fileKey"
                                                >
                                                    <td
                                                        class="text-center pa-5"
                                                        @click="showImageSlider(form.data.popupImageFiles.length + index)"
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
                                                            @click="deleteImage(file, index)"
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
        url: '/admin/popup',
        pk: 'popupNo',
        constant: {
            POPUP_TYPE_TOP_BANNER: 'TOP_BANNER',
            POPUP_TYPE_POPUP_LAYER: 'POPUP_LAYER',
            POPUP_CONTENT_TYPE_HTML: 'HTML',
            POPUP_CONTENT_TYPE_IMAGE: 'IMAGE'
        },
        search: {
            startDate: null,
            endDate: null,
            type: null,
            useYn: null
        },
        tbl: {
            headers: [
                {text: 'No', value: 'popupNo', width: 60, align: 'right'},
                {text: '방식', value: 'type', width: 80},
                {text: '제목', value: 'title', width: 80},
                {text: '시작일', value: 'startDt', width: 140},
                {text: '종료일', value: 'endDt', width: 140},
                {text: '등록자', value: 'regMngrNm', width: 120, align: 'center'},
                {text: '등록일', value: 'regDt', width: 160, align: 'center'},
                {text: '사용여부', value: 'useYn', width: 160, align: 'center'}
            ]
        },
        codes: {
            popupType: ubicus.base.company.code.getCode('PopupType'),
            popupContentType: ubicus.base.company.code.getCode('PopupContentType')
        },
        view: {
            outlined: true
        },
        form: {
            init: {
                popupNo: '',
                type: null,
                useYn: 'Y',
                title: '',
                link: '',
                width: null,
                height: null,
                offsetTop: null,
                offsetLeft: null,
                startDt: moment().format('YYYY-MM-DD'),
                endDt: moment().add(1, 'month').format('YYYY-MM-DD'),
                cookieDay: null,
                contentType: null,
                content: '',
                popupImageFiles: [],
                popupSavedImageFiles: []
            }
        }
    }),
    created() {
        this.form.init.type = this.constant.POPUP_TYPE_TOP_BANNER;
        this.form.init.contentType = this.constant.POPUP_CONTENT_TYPE_HTML;
    },
    methods: {
        onCrudMixInActions(actionName, data, options) {
            if (actionName === 'selectItem') {
                if (Array.isArray(data.attachFiles)) {
                    this.form.data.popupSavedImageFiles = data.attachFiles.map(e => {
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
                }
            }
        },
        getCodeName(codes, cd) {
            const filteredCodes = codes.filter(code => code.cd === cd);

            if (filteredCodes.length > 0) {
                return filteredCodes[0].cdNm;
            }

            return '';
        },
        async saveItem(method) {
            if (this.$refs['textEditor']) {
                await this.$refs['textEditor'].uploadImages();
            }

            const data = this._.cloneDeep(this.form.data);
            this.loading.show = true;

            this.xAjaxMultipart({
                url: this.url,
                method: method,
                fileParts: {
                    // 신규 업로드 이미지
                    popupImageFiles: this.form.data.popupImageFiles.map(e => e.file)
                },
                parts: {
                    popup: {
                        popupNo: data.popupNo,
                        type: data.type,
                        useYn: data.useYn,
                        title: data.title,
                        link: data.link,
                        width: data.width,
                        height: data.height,
                        offsetTop: data.offsetTop,
                        offsetLeft: data.offsetLeft,
                        startDt: data.startDt,
                        endDt: data.endDt,
                        cookieDay: data.cookieDay,
                        contentType: data.contentType,
                        content: data.content
                    },
                    // 삭제 이미지
                    popupDeleteImageFiles: this.form.data.popupSavedImageFiles.filter(e => e.workType === 'DELETE'),
                    // 삭제 안되고 유지 되는 이미지
                    popupUpdateImageFiles: this.form.data.popupSavedImageFiles.filter(e => e.workType !== 'DELETE')
                }
            }).then(resp => {
                this.ubicus.base.lib.notify(resp);
                this.fetchData(method === 'POST');
            }).finally(() => {
                this.loading.show = false;
            });
        },
        fileSelection(files) {
            console.log('fileSelection', files, this.form.data.popupImageFiles);
        },
        downloadImage(file) {
            location.href = `${this.$settings.requestMapping}/base/files/${file.fileKey}/download`;
        },
        deleteImage(file, index) {
            if (file.workType === 'INSERT') {
                this.form.data.popupImageFiles.splice(index, 1);
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
