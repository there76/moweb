import crudMixIn from '/static/apps/mixin/crudMixIn.js';

export default {
    template: `
        <div>
            <v-sheet>
                <ub-search>
                    <div class="w-190px">
                        <ub-date-range-picker label="기간" :start.sync="search.startDate" :end.sync="search.endDate" format="datetime"></ub-date-range-picker>
                    </div>
                    <!--<div>
                        <v-text-field v-model="search.cmpnyNm" label="이름" @keyup.enter="fetchData(true)" outlined dense hide-details></v-text-field>
                    </div>-->
                    <div>
                        <v-select v-model="search.reqStat" label="상태" @change="fetchData(true)" item-value="cd" item-text="cdNm" :items="ubicus.base.util.concatArray(codes.productSampleRequestStatus,[{cdNm:'전체',cd:''}], false)" outlined dense hide-details></v-select>
                    </div>
                    <div class="search-form-btns">
                        <ub-button color="primary" label="조회" icon="mdi-magnify" @click="fetchData(true)"></ub-button>
                        <!--<ub-button color="info" label="새로입력" icon="mdi-plus" @click="newItem()"></ub-button>-->
                    </div>
                </ub-search>
        
                <v-data-table dense fixed-header :height="$settings.datatable.rows10" 
                    :footer-props="$settings.datatable.footer10" :headers="tbl.headers" 
                    @click:row="selectItem"
                    single-select item-key="reqKey"
                    :items="tbl.items" :options.sync="tbl.options" :server-items-length="tbl.total" >
                    
                    <template v-slot:item.reqStat="{ item }">{{codes.productSampleRequestStatus.find(e => e.cd == item.reqStat).cdNm}}</template>
                    
                </v-data-table>
            </v-sheet>
            <ub-view :view.sync="view">
                <template v-slot:body="{edit}">
                    <v-form class="input-form" ref="form" v-model="form.valid">
                        <v-row>
                             <v-col cols="12" md="3">
                                <v-text-field label="회사명" :rules="ubicus.base.rule.required"  v-model="form.data.cmpnyNm" :readonly="form.data.reqStat != 'REQUEST'"></v-text-field>
                             </v-col>
                             <v-col cols="12" md="2">
                                <v-text-field label="담당자명" :rules="ubicus.base.rule.required"  v-model="form.data.reqUserNm" :readonly="form.data.reqStat != 'REQUEST'"></v-text-field>
                             </v-col>
                             <v-col cols="12" md="3">
                                <v-text-field label="이메일" :rules="ubicus.base.rule.required"  v-model="form.data.email" :readonly="form.data.reqStat != 'REQUEST'"></v-text-field>
                             </v-col>
                             <v-col cols="12" md="2">
                                <v-text-field label="연락처" :rules="ubicus.base.rule.required"  v-model="form.data.telNo" :readonly="form.data.reqStat != 'REQUEST'"></v-text-field>
                             </v-col>
                             <v-col cols="12" md="2">
                                <v-select label="상태" v-model="form.data.reqStat" :items="codes.productSampleRequestStatus" item-text="cdNm" item-value="cd" outlined dense hide-details></v-select>
                                <!--<v-text-field label="상태" :value="codes.productSampleRequestStatus.find(e => e.cd == form.data.reqStat).cdNm" readonly></v-text-field>-->
                             </v-col>
                             <v-col cols="12" md="3">
                                <v-text-field label="우편번호" :rules="ubicus.base.rule.required"  v-model="form.data.zipCd" :readonly="form.data.reqStat != 'REQUEST'"></v-text-field>
                             </v-col>
                             <v-col cols="12" md="9">
                                <v-text-field label="주소" :rules="ubicus.base.rule.required"  v-model="form.data.addr" :readonly="form.data.reqStat != 'REQUEST'"></v-text-field>
                             </v-col>
                        </v-row>
                    </v-form>
                    
                    <v-simple-table>
                        <template v-slot:default>
                            <colgroup>
                                <col width="200px"/>
                                <col/>
                                <col width="400px"/>
                                <col width="80px"/>
                            </colgroup>
                            <thead>
                                <tr>
                                    <th class="text-center">사진</th>
                                    <th>제품명</th>
                                    <th>신청파트</th>
                                    <th>신청수량</th>
                                </tr>
                            </thead>
                            <tbody>
                                 <template v-for="(item, key) in form.data.productSampleDetails">
                                     <tr v-for="(detail, index) in item[0].product.productDetails" :key="detail.prdtDtNo">
                                        <td :rowspan="item[0].product.productDetails.length" v-if="index == 0" class="text-center">
                                            <img :src="item[0].product.thumbnailImageUrl" width="100"/>
                                        </td>
                                        <td :rowspan="item[0].product.productDetails.length" v-if="index == 0">
                                            {{item[0].product.prdtNm}}
                                        </td>
                                        <td>
                                            <v-checkbox  :input-value="detail.checked" readonly
                                                           class="mt-0 mr-2"
                                                           hide-details
                                                          :label="detail.prdtDtNm + '  (' + detail.prdtDtPt+ ')'"
                                                    ></v-checkbox>
                                            <!--{{detail.prdtDtNm}} || {{detail.prdtDtPt}} || {{detail.prdtDtQntyPerBox}} || {{detail.prdtDtSize}}-->
                                        </td>
                                        <td :rowspan="item[0].product.productDetails.length" v-if="index == 0" class="text-center">
                                            {{item[0].reqQuantity}} 개
                                        </td>
                                     </tr>
                                 </template>
                            </tbody>
                        </template>
                    </v-simple-table>
                    
                    
                </template>
                
                <template v-slot:control="{edit}">
                    <ub-button mode="text" color="warning" label="저장" icon="mdi-text-box-check" @click="saveItem()"></ub-button>
                </template>
                
            </ub-view>
        </div>
    `,
    mixins: [crudMixIn],
    data: () => ({
        url: '/admin/productSample',
        pk: 'reqNo',
        search: {
            reqStat: '',
            startDate: null,
            endDate: null
        },
        tbl: {
            headers: [
                {text: '등록일', value: 'regDt', width: 180},
                {text: '회사명', value: 'cmpnyNm', width: 200},
                {text: '담당자', value: 'reqUserNm', width: 80},
                {text: '이메일', value: 'email', width: 200},
                {text: '주소', value: 'addr'},
                {text: '상태', value: 'reqStat', width: 100, align: 'center'}
            ]
        },
        view: {
            outlined: true
        },
        codes: {
            productSampleRequestStatus: ubicus.base.company.code.getCode('ProductSampleRequestStatus')
        }
    }),
    methods: {
        onCrudMixInActions(actionName) {
            if (actionName == 'fetchData') {
                this.tbl.items.forEach(item => {

                    const checkedDtNo = item.productSampleDetails.map(e => e.prdtDtNo);

                    item.productSampleDetails = _.groupBy(item.productSampleDetails, 'prdtKey');


                    Object.keys(item.productSampleDetails).forEach(function (prdtKey) {
                        item.productSampleDetails[prdtKey][0].product.productDetails.forEach(e => {
                            console.log(checkedDtNo, e.prdtDtNo)
                            e.checked = checkedDtNo.includes(e.prdtDtNo);
                        })
                    })

                });
            }
        },
        async saveItem() {
            if (!this.form.valid) {
                return this.$refs.form.validate();
            }
            if (!(await this.ubicus.base.lib.confirm(`샘플신청 정보를 변경하시겠습니까?`)).isConfirmed) {
                return;
            }

            await this.xAjaxJson({
                url: '/admin/productSample',
                method: 'PATCH',
                data: this.form.data
            });

            this.ubicus.base.lib.notify(`샘플신청 정보가 수정되었습니다.`);

            this.fetchData(true);
        }
    }
};
