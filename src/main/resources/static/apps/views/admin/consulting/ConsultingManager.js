import crudMixIn from '/static/apps/mixin/crudMixIn.js';

export default {
    template: `
        <div>
            <v-sheet>
                <ub-search>
                    <div class="w-190px">
                        <ub-date-range-picker label="기간" :start.sync="search.startDate" :end.sync="search.endDate" format="datetime"></ub-date-range-picker>
                    </div>
                    <div>
                        <v-select v-model="search.state" label="상담여부" @change="fetchData(true)" item-value="cd" item-text="cdNm" :items="ubicus.base.util.concatArray(codes.consultingState, [{cdNm: '전체',cd: null}], false)" outlined dense hide-details></v-select>
                    </div>
                    <div>
                        <v-select v-model="search.categories" label="상담제품군" @change="fetchData(true)" item-value="cd" item-text="cdNm" :items="codes.consultingCategory" outlined dense hide-details multiple chips small-chips></v-select>
                    </div>
                    <div class="search-form-btns">
                        <ub-button color="primary" label="조회" icon="mdi-magnify" @click="fetchData(true)"></ub-button>
                        <ub-button color="info" label="엑셀다운로드" icon="mdi-download" @click="excelData"></ub-button>
                    </div>
                </ub-search>
        
                <v-data-table 
                    dense 
                    fixed-header 
                    :height="$settings.datatable.rows10" 
                    :footer-props="$settings.datatable.footer10" 
                    :headers="tbl.headers" 
                    :items="tbl.items" 
                    :options.sync="tbl.options" 
                    :server-items-length="tbl.total"
                    single-select
                    item-key="cnsltKey"
                    disable-sort
                    @click:row="viewItem">
                    <template #item.categories="{item}">
                        <v-chip v-for="category in item.categories" :key="category.cateCd" small>{{ category.cateNm }}</v-chip>
                    </template>
                    <template #item.regDt="{item}">
                        {{ item.regDt | formattedDate }}
                    </template>
                    <template #item.cnsltRegDt="{item}">
                        {{ item.cnsltRegDt | formattedDate }}
                    </template>
                    <template #item.stateNm="{item}">
                        <v-chip v-if="item.state === 'INCOMPLETE'" small color="red" text-color="white">{{ item.stateNm }}</v-chip>
                        <v-chip v-else small>{{ item.stateNm }}</v-chip>
                    </template>
                </v-data-table>
            </v-sheet>
            
            <ub-view :view.sync="view">
                <template #body="{edit}" v-if="view.item !== null">
                    <v-sheet class="pa-5">
                        <v-card class="mb-2" outlined>
                            <v-card-text>
                                <v-row>
                                    <v-col cols="6">
                                        <span>회사명 : </span>
                                        <span class="black--text" v-text="view.item.cmpnyNm"></span>
                                    </v-col>
                                    <v-col cols="6">
                                        <span>담당자 : </span>
                                        <span class="black--text" v-text="view.item.respNm"></span>
                                    </v-col>
                                    <v-col cols="6">
                                        <span>연락처 : </span>
                                        <span class="black--text" v-text="view.item.contactNo"></span>
                                    </v-col>
                                    <v-col cols="6">
                                        <span>이메일 : </span>
                                        <span class="black--text" v-text="view.item.email"></span>
                                    </v-col>
                                    <v-col cols="6">
                                        <span>상담 제품군 : </span>
                                        <v-chip class="mr-1" v-for="category in view.item.categories" :key="category.cateCd" small>{{ category.cateNm }}</v-chip>
                                    </v-col>
                                    <v-col cols="6">
                                        <span>접수일 : </span>
                                        <span class="black--text" v-text="view.item.regDt"></span>
                                    </v-col>
                                    <v-col cols="12">
                                        <span>상담내용 : </span>
                                        <div class="black--text" v-html="view.item.cntnt"></div>
                                    </v-col>
                                </v-row>
                            </v-card-text>
                        </v-card>
                        <v-card outlined>
                            <v-card-text>
                                <v-form>
                                    <v-row>
                                        <v-col cols="3">답변자</v-col>
                                        <v-col cols="9">{{ form.data.regMngrId }}({{ form.data.regMngrNm }})</v-col>
                                        <v-col cols="3">상태</v-col>
                                        <v-col cols="9">
                                            <v-select v-model="form.data.state" label="상태" item-value="cd" item-text="cdNm" :items="codes.consultingState" outlined dense hide-details></v-select>
                                        </v-col>
                                        <v-col cols="3">메모</v-col>
                                        <v-col cols="9">
                                            <v-textarea v-model="form.data.memo"></v-textarea>
                                        </v-col>
                                    </v-row>
                                </v-form>
                            </v-card-text>
                        </v-card>
                    </v-sheet>
                </template>
                <template #control="{edit}">
                    <template v-if="edit">
                        <ub-button mode="text" color="warning" label="수정" icon="mdi-text-box-check" @click="saveItem('PATCH')"></ub-button>
                    </template>
                    <template v-else>
                        <ub-button mode="text" color="warning" label="저장" icon="mdi-text-box-plus" @click="saveItem('POST')"></ub-button>
                    </template>
                </template>
            </ub-view>
        </div>
    `,
    mixins: [crudMixIn],
    data: () => ({
        url: '/admin/consulting',
        pk: 'cnsltNo',
        search: {
            state: null,
            categories: null,
            startDate: null,
            endDate: null
        },
        tbl: {
            headers: [
                {text: 'No', value: 'cnsltNo', width: 50, align: 'center'},
                {text: '회사명', value: 'cmpnyNm', width: 200},
                {text: '담당자', value: 'respNm', width: 80},
                {text: '연락처', value: 'contactNo', width: 120, align: 'center'},
                {text: '이메일', value: 'email', width: 120, align: 'center'},
                {text: '상담 제품군', value: 'categories', width: 160},
                {text: '아이디', value: 'regCustId', width: 80, align: 'center'},
                {text: '등록일', value: 'regDt', width: 120, align: 'center'},
                {text: '상담자', value: 'regMngrNm', width: 80, align: 'center'},
                {text: '상담일', value: 'cnsltRegDt', width: 120, align: 'center'},
                {text: '상태', value: 'stateNm', width: 80, align: 'center'}
            ]
        },
        codes: {
            consultingState: ubicus.base.company.code.getCode('ConsultingState'),
            consultingCategory: ubicus.base.company.code.getCode('ConsultingCategoryCd')
        },
        view: {
            item: null,
            outlined: true
        }
    }),
    methods: {
        viewItem(item, row) {
            this.view.item = item;
            this.form.data = this._.extend(
                    {cnsltNo: item.cnsltNo, regMngrId: item.userId, regMngrNm: item.userNm, regMngrNo: item.regMngrNo, state: item.state, memo: item.memo},
                    {regMngrId: this.getUser.userId, regMngrNm: this.getUser.userNm}
            );
            this.view.edit = item.regMngrNo !== null;
            this.view.show = true;
            row.select(true);
        },
        saveItem(method) {
            this.xAjax({
                url: '/admin/consulting',
                method: method,
                data: this._.cloneDeep(this.form.data)
            }).then(resp => {
                this.ubicus.base.lib.notify(resp);
                this.fetchData(false);
            })
        }
    },
    filters: {
        formattedDate(date) {
            if (!date) {
                return '';
            }

            return moment(date).format('YYYY-MM-DD');
        }
    }
};
