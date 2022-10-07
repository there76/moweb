import crudMixIn from '/static/apps/mixin/crudMixIn.js';

const CustomerManager = {
    name: 'ub-admin-customer',
    template: `
        <div>
            <v-sheet>
                <ub-search>
                    <div class="w-190px">
                        <ub-date-range-picker label="기간" :start.sync="search.startDate" :end.sync="search.endDate" format="datetime"></ub-date-range-picker>
                    </div>
                    <div>
                        <v-text-field v-model="search.cmpnyNm" label="이름" @keyup.enter="fetchData(true)" outlined dense hide-details></v-text-field>
                    </div>
                    <div>
                        <v-select v-model="search.custStat" label="사용구분" @change="fetchData(true)" item-value="cd" item-text="cdNm" :items="ubicus.base.util.concatArray(codes.custStat,[{cdNm:'전체',cd:''}], false)" outlined dense hide-details></v-select>
                    </div>
                    <div class="search-form-btns">
                        <ub-button color="primary" label="조회" icon="mdi-magnify" @click="fetchData(true)"></ub-button>
                        <ub-button color="info" label="새로입력" icon="mdi-plus" @click="newItem()"></ub-button>
                    </div>
                </ub-search>
                
                <v-data-table dense fixed-header :height="$settings.datatable.rows10" 
                :footer-props="$settings.datatable.footer10" :headers="tbl.headers" 
                single-select item-key="custId"
                :items="tbl.items" :options.sync="tbl.options" :server-items-length="tbl.total" >
                    <template v-slot:item.cmpnyNm="{ item }">
                        <div class="ellipsis"><a href="#" @click.stop.prevent="selectItem(item)" class="ellipsis">{{item.cmpnyNm}} 으로 가입</a></div>
                    </template>
                    <template v-slot:item.custStat="{ item }">{{item.custStatName}}</template>
                    
                </v-data-table>
            </v-sheet>
            
            <ub-view :view.sync="view">
                <template v-slot:body="{edit}">
                <v-form class="input-form" ref="form" v-model="form.valid">
                    <v-row>
                        <v-col cols="12" md="4">
                            <v-text-field label="아이디" v-model="form.data.custId" :rules="ubicus.base.rule.required"></v-text-field>
                        </v-col>
                        <v-col cols="12" md="4">
                            <v-text-field label="유저 키" v-model="form.data.custKey" :rules="ubicus.base.rule.required"></v-text-field>
                        </v-col>
                        <v-col cols="12" md="4">
                            <v-text-field label="회사명" v-model="form.data.cmpnyNm" :rules="ubicus.base.rule.required"></v-text-field>
                        </v-col>
                        <v-col cols="12" md="4">
                            <v-text-field label="담당자명" v-model="form.data.respNm" :rules="ubicus.base.rule.required"></v-text-field>
                        </v-col>
                        <v-col cols="12" md="4">
                            <v-text-field label="연락처" v-model="form.data.contactNo" :rules="ubicus.base.rule.required"></v-text-field>
                        </v-col>
                        <v-col cols="12" md="4">
                            <v-text-field label="이메일" v-model="form.data.email" :rules="ubicus.base.rule.required"></v-text-field>
                        </v-col>
                        <v-col cols="12" md="4">
                            <v-text-field label="회사주소1" v-model="form.data.cmpnyAddr" :rules="ubicus.base.rule.required"></v-text-field>
                        </v-col>
                        <v-col cols="12" md="4">
                            <v-text-field label="회사주소2" v-model="form.data.cmpnyAddr2" :rules="ubicus.base.rule.required"></v-text-field>
                        </v-col>
                        <v-col cols="12" md="4">
                            <v-text-field label="우편번호" v-model="form.data.cmpnyZipCd" :rules="ubicus.base.rule.required"></v-text-field>
                        </v-col>
                        <v-col cols="12" md="4">
                            <v-select v-model="form.data.custStat" label="사용구분" item-value="cd" item-text="cdNm" :items="codes.custStat"></v-select>
                        </v-col>
                        
                    </v-row>
                </v-form>
                </template>
                <template v-slot:control="{edit}">
                    <template v-if="edit">
                        <ub-button mode="text" color="warning" label="저장" icon="mdi-file-document-edit" @click="saveItem('PATCH')"></ub-button>
                        <ub-button mode="text" color="danger" label="삭제" icon="mdi-delete" @click="deleteItem(form.data)"></ub-button>
                    </template>
                    <template v-else>
                        <ub-button mode="text" color="warning" label="저장" icon="mdi-text-box-plus" @click="saveItem('POST')"></ub-button>
                        <ub-button mode="text" color="secondary" label="초기화" icon="mdi-refresh" @click="resetItem()"></ub-button>
                    </template>
                </template>
            </ub-view>
        </div>
    `,
    mixins: [crudMixIn],
    data: () => ({
        url: '/admin/customer',
        pk: 'custNo',           //delete 위한 PK 필드 이름
        search: {
            cmpnyNm: '',
            custStat: '',
            startDate: null,
            endDate: null
        },
        view: {
            title: '회원관리',
            outlined: true
        },
        tbl: {
            headers: [
                {text: 'No', value: 'custNo', width: 60, align: 'right'},
                {text: '아이디', value: 'custId', width: 140},
                {text: '회사명', value: 'cmpnyNm', width: 140},
                {text: '담당자', value: 'respNm', width: 80},
                {text: '연락처', value: 'contactNo', width: 80},
                {text: '이메일', value: 'email', width: 120, align: 'center'},
                {text: '회사주소(지역)', value: 'cmpnyAddr', width: 160, align: 'center'},
                {text: '상태', value: 'custStat', width: 160, align: 'center'},
                {text: '가입일', value: 'regDt', width: 160, align: 'center'}
            ]
        },
        form: {
            init: {
                custNo: undefined,
                custId: undefined,
                custKey: undefined,
                cmpnyNm: undefined,
                respNm: undefined,
                contactNo: undefined,
                email: undefined,
                cmpnyAddr: undefined,
                cmpnyAddr2: undefined,
                cmpnyZipCd: undefined,
                custStat: undefined
            }
        },
        codes: {
            custStat: ubicus.base.company.code.getCode('CustomerStatus')
        }
    }),
    methods: {}
};

export default CustomerManager;
