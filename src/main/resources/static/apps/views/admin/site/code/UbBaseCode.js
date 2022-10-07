
import UbBaseTree from "/static/apps/components/ui/UbBaseTree.js"

const UbBaseCode = {
    name: 'ub-base-code',
    components: {
        UbBaseTree: UbBaseTree
    },
    template: `
        <div>
            <v-sheet>
                <v-row>
                    <v-col cols="12" md="5">
                        <v-card outlined>
                            <v-card-title>
                                <v-row>
                                    <v-col cols="5">
                                        <v-select label="검색구분" v-model="search.target" :items="[{text: '코드명', value: 'name'},{text: '코드', value: 'code'}]" outlined dense hide-details> </v-select>
                                    </v-col>
                                    <v-col cols="5">
                                        <v-text-field label="검색" v-model="search.keyword" @keyup.enter="searchItem" outlined dense hide-details></v-text-field>
                                    </v-col>
                                    <v-col cols="2">
                                        <v-menu bottom left>
                                            <template v-slot:activator="{ on, attrs }">
                                                <v-btn icon small color="grey" v-bind="attrs" v-on="on">
                                                    <v-icon>mdi-dots-vertical</v-icon>
                                                </v-btn>
                                            </template>
                                            <v-list>
                                                <v-list-item link @click="expandAll">
                                                    <v-list-item-title>
                                                        <v-icon>mdi-arrow-expand-all</v-icon> Expand
                                                    </v-list-item-title>
                                                </v-list-item>
                                                <v-list-item link @click="collapseAll">
                                                    <v-list-item-title>
                                                        <v-icon>mdi-arrow-collapse-all</v-icon> Collapse
                                                    </v-list-item-title>
                                                </v-list-item>
                                            </v-list>
                                        </v-menu>
                                    </v-col>
                                </v-row>
                            </v-card-title>
                            <v-card-text class="div-scroll-y">
                                <ub-base-tree url="/base/codes/tree" ref="codeTree" @changed="treeChanged" state></ub-base-tree>
                            </v-card-text>
                        </v-card>
                    </v-col>
                    <v-col cols="12" md="7">
                        <v-card outlined>
                            <v-card-title>
                                <span v-html="paths"></span>
                                <span class="position-right">
                                    <v-tooltip bottom>
                                        <template v-slot:activator="{ on, attrs }">
                                            <v-btn color="warning" small v-bind="attrs" v-on="on" @click="newCodeDiv()">
                                                <v-icon>mdi-folder</v-icon>
                                            </v-btn>
                                        </template>
                                        <span>코드 분류 추가</span>
                                    </v-tooltip>
                                    <v-tooltip bottom>
                                        <template v-slot:activator="{ on, attrs }">
                                            <v-btn color="warning" small v-bind="attrs" v-on="on" @click="newCode()" v-show="paths !== ''">
                                                <v-icon>mdi-code-braces</v-icon>
                                            </v-btn>
                                        </template>
                                        <span>하위 코드 추가</span>
                                    </v-tooltip>
                                </span>
                            </v-card-title>
            
                            <template v-if="form.type === 'codeDiv'">
                                <v-card-text>
                                    <v-form v-model="form.valid" ref="form">
                                        <v-row>
                                            <v-col cols="12" md="6">
                                                <v-text-field label="분류코드*" v-model="form.data.divCd" :readonly="!form.updatable || form.edit" :rules="[v => (v && v.length > 0) || 'Required field']"></v-text-field>
                                            </v-col>
                                            <v-col cols="12" md="6">
                                                <v-text-field label="분류코드명*" v-model="form.data.divNm" :readonly="!form.updatable" :rules="[v => (v && v.length > 0) || 'Required field']"></v-text-field>
                                            </v-col>
                                            <v-col cols="12" md="6">
                                                <v-select label="서비스" v-model="form.data.divService" :readonly="!form.updatable" :items="[{text:'공통',value:'common'},{text:'콜',value:'call'},{text:'VOC',value:'voc'}]"></v-select>
                                            </v-col>
                                            <v-col cols="12" md="6">
                                                <v-select label="수정가능여부" v-model="form.data.updEnableYn" :items="[{text:'가능',value:'Y'},{text:'불가능',value:'N'}]"></v-select>
                                            </v-col>
                                            <v-col cols="12" md="12" class="text-right">
                                                <ub-button v-show="form.updatable && form.edit" mode="text" color="danger" label="삭제" icon="mdi-delete" @click="deleteItem()" :disabled="!form.updatable"></ub-button>
                                                <ub-button v-show="form.updatable && !form.edit" mode="text" color="secondary" label="초기화" icon="mdi-refresh" @click="resetItem()"></ub-button>
                                                <ub-button mode="text" color="warning" label="저장" icon="mdi-text-box-check" @click="saveItem()" :disabled="!form.updatable">
                                                    {{form.updatable ? (form.edit?'저장':'등록') : '수정불가'}}
                                                </ub-button>
                                            </v-col>
                                        </v-row>
                                    </v-form>
                                </v-card-text>
                            </template>
            
                            <template v-else-if="form.type === 'code'">
                                <v-card-text>
                                    <v-form v-model="form.valid" ref="form">
                                        <v-row>
                                            <v-col cols="12" sm="6">
                                                <v-text-field label="분류코드" v-model="form.data.divCd" readonly></v-text-field>
                                            </v-col>
                                            <v-col cols="12" md="6">
                                                <v-text-field label="상위코드" v-model="form.data.prntCd" readonly></v-text-field>
                                            </v-col>
                                            <v-col cols="12" md="6">
                                                <v-text-field label="코드*" v-model="form.data.cd" :readonly="!form.updatable || form.edit" :rules="form.rules.cd"></v-text-field>
                                            </v-col>
                                            <v-col cols="12" md="6">
                                                <v-text-field label="코드명*" v-model="form.data.cdNm" :readonly="!form.updatable" :rules="[v => (v && v.length > 0) || 'Required field']"></v-text-field>
                                            </v-col>
                                            <v-col cols="12" md="6">
                                                <v-text-field label="정렬순서*" v-model="form.data.sortNo" :readonly="!form.updatable" type="number" min="0" :rules="[v => (v !== '' && !isNaN(v)) || 'Required field']"></v-text-field>
                                            </v-col>
                                            <v-col cols="12" md="6">
                                                <v-select label="사용여부*" v-model="form.data.useYn" :readonly="!form.updatable" :items="[{text:'사용',value:'Y'},{text:'미사용',value:'N'}]"></v-select>
                                            </v-col>
                                            <v-col cols="12" md="6">
                                                <v-text-field label="기타1" v-model="form.data.etc1" :readonly="!form.updatable"></v-text-field>
                                            </v-col>
                                            <v-col cols="12" md="6">
                                                <v-text-field label="기타2" v-model="form.data.etc2" :readonly="!form.updatable"></v-text-field>
                                            </v-col>
                                            <v-col cols="12" md="6">
                                                <v-text-field label="기타3" v-model="form.data.etc3" :readonly="!form.updatable"></v-text-field>
                                            </v-col>
                                            <v-col cols="12" md="6">
                                                <v-text-field label="기타4" v-model="form.data.etc4" :readonly="!form.updatable"></v-text-field>
                                            </v-col>
                                            <v-col cols="12" md="12">
                                                <v-text-field label="코드설명" v-model="form.data.dtl" :readonly="!form.updatable"></v-text-field>
                                            </v-col>
            
                                            <v-col cols="12" md="12" class="text-right">
                                                <ub-button v-show="form.updatable && form.edit" mode="text" color="danger" label="삭제" icon="mdi-delete" @click="deleteItem()" :disabled="!form.updatable"></ub-button>
                                                <ub-button v-show="form.updatable && !form.edit" mode="text" color="secondary" label="초기화" icon="mdi-refresh" @click="resetItem()"></ub-button>
                                                <ub-button mode="text" color="warning" label="저장" icon="mdi-text-box-check" @click="saveItem()" :disabled="!form.updatable">
                                                    {{form.updatable ? (form.edit?'저장':'등록') : '수정불가'}}
                                                </ub-button>
                                            </v-col>
                                        </v-row>
                                    </v-form>
                                </v-card-text>
                            </template>
            
                            <template v-else>
                                <v-card-text>
                                    <p>코드를 선택하시거나 코드 신규 입력 버튼을 클릭하세요.</p>
                                </v-card-text>
                            </template>
                        </v-card>
                    </v-col>
                </v-row>
            </v-sheet>
        </div>
    `,

    data: function () {
        return {
            paths: '',
            search: {
                target: 'name',
                keyword: ''
            },
            form: {
                init: {
                    code: {
                        cd: undefined,
                        divCd: undefined,
                        prntCd: undefined,
                        cdNm: undefined,
                        sortNo: 0,
                        dtl: undefined,
                        useYn: 'Y',
                        etc1: undefined,
                        etc2: undefined,
                        etc3: undefined,
                        etc4: undefined,
                        lvl: undefined
                    },
                    codeDiv: {
                        divCd: undefined,
                        divNm: undefined,
                        divService: 'common',
                        updEnableYn: 'Y',
                        userDefineCol: undefined
                    }
                },
                type: undefined,
                data: {},
                edit: false,
                updatable: false,
                valid: false,
                rules: {
                    required: [v => v && v.length > 0 || 'Required field'],
                    cd: [v => v && v.length > 0 || 'Required field', v => v !== this.form.data.prntCd || 'Duplicated value']
                }
            }
        };
    },
    methods: {
        newCodeDiv() {
            this.form.edit = false;
            this.form.updatable = true;
            this.form.type = 'codeDiv';
            this.resetItem();
            this.$refs['codeTree'].deselectAll();
            this.paths = '';
        },
        newCode() {
            this.form.edit = false;
            this.form.updatable = true;
            this.form.type = 'code';
            this.resetItem();
        },
        treeChanged(e, data, instance) {
            if (data.action === 'deselect_all') {
                //refresh 시에도 발생한다.
                return;
            }
            const node = data.node;
            const item = Object.assign(Object.assign({}, node.original), Object.assign({}, node.data));
            const codeTree = this.$refs['codeTree'];
            this.paths = codeTree.getPath(node);
            this.form.edit = true;
            this.form.data = item;
            if (item.parent === '#') {
                this.form.type = 'codeDiv';
                this.form.updatable = (node.data.updEnableYn === 'Y' && node.data.cmpnyNo !== -1);
            } else {
                const topNode = codeTree.getTopNode(node);
                this.form.type = 'code';
                this.form.updatable = (topNode.data.updEnableYn === 'Y' && node.data.cmpnyNo !== -1);
            }
        },
        fetchData() {
            this.$refs['codeTree'].refresh();
        },
        saveItem() {
            if (!this.form.valid) {
                return this.$refs.form.validate();
            }
            const dataType = this.form.type;

            const codeAll = this.$refs['codeTree'].instance.element.jstree(true).get_json('#', {flat: true});
            const existCode = codeAll.find(e => e.id === `${this.form.data.divCd}_${this.form.data.cd}`);
            if(existCode) {
                this.ubicus.base.lib.alert(`중복된 코드입니다. [${this.form.data.cd}]`);
                return;
            }

            this.xAjaxJson({
                url: dataType === 'code' ? '/base/codes' : '/base/codeDivs',
                method: this.form.edit ? 'PATCH' : 'POST',
                data: this.form.data
            }).then(resp => {
                this.ubicus.base.lib.notify(resp['message']);
                this.fetchData();
            });
        },
        deleteItem() {
            const dataType = this.form.type;
            const data = this.form.data;
            let confirmMsg = '코드[' + data['cdNm'] + '] 및 모든 하위 코드를 삭제 하시겠습니까?';
            if (dataType === 'codeDiv') {
                confirmMsg = '코드분류[' + data['divNm'] + '] 및 모든 하위 코드를 삭제 하시겠습니까?';
            }
            this.ubicus.base.lib.confirm(confirmMsg).then(result => {
                if (result.isConfirmed) {
                    this.xAjax({
                        url: dataType === 'code' ? '/base/codes' : '/base/codeDivs',
                        method: 'DELETE',
                        data: data
                    }).then(resp => {
                        this.ubicus.base.lib.notify(resp['message']);
                        this.fetchData();
                    });
                }
            });
        },
        resetItem() {
            const dataType = this.form.type;
            if (dataType === 'code') {
                const selectedNode = this.$refs['codeTree'].getSelectedNode(true)[0];
                const initData = Object.assign({}, this.form.init.code);
                const prntCd = selectedNode.data.cd || 'ROOT'; //divCd인 경우 값이 없음
                //divCd인 경우 값이 없음
                const divCd = selectedNode.data.divCd;
                initData['cd'] = prntCd !== 'ROOT' ? prntCd : '';
                initData['divCd'] = divCd;
                initData['prntCd'] = prntCd;
                this.form.data = initData;
            } else {
                this.form.data = Object.assign({}, this.form.init.codeDiv);
            }
            if (this.$refs.form !== undefined) {
                this.$refs.form.resetValidation();
            }
        },
        searchItem() {
            this.$refs['codeTree'].search(this.search.target, this.search.keyword);
        },
        expandAll() {
            this.$refs['codeTree'].expandAll();
        },
        collapseAll() {
            this.$refs['codeTree'].collapseAll();
        }
    }
};

export default UbBaseCode;
