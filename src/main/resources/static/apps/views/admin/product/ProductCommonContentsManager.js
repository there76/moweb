import UbDateTimePicker from '/static/apps/components/ui/UbDateTimePicker.js';
import UbTextEditor from '/static/apps/components/admin/base/common/UbTextEditor.js';

const baseHelper = Vuex.createNamespacedHelpers('base');


const ProductCommonContentsManager = {
    name: 'product-common-contents-manager',
    components: {
        UbDateTimePicker,
        UbTextEditor
    },
    template: `
        <v-form v-if="fetched">
            <v-row>
                <v-col cols="12">
                    <div class="d-inline-block" style="width: 160px;">
                        <ub-date-time-picker time-format="HH:mm:ss" label="게시 시작" v-model="form.data.startDt"></ub-date-time-picker>
                    </div>
                    <div class="d-inline-block" style="width: 160px;">
                        <ub-date-time-picker time-format="HH:mm:ss" label="게시 종료" v-model="form.data.endDt"></ub-date-time-picker>
                    </div>
                    <div class="d-inline-block ml-4" style="width: 160px;">
                        <v-switch inset dense hide-details class="mt-0"
                                  :label="form.data.applyYn === 'Y' ? '적용' : '미적용'"
                                  true-value="Y" false-value="N"
                                  v-model="form.data.applyYn"
                        ></v-switch>
                    </div>
                    <div class="d-inline-block ml-4" style="width: 300px;" v-if="exists">
                        마지막 수정: <span>{{form.data.regDt}}</span> (<span>{{form.data.regUserNm}}</span>)
                    </div>
                </v-col>
            </v-row>
            
            <v-row>
                <v-col cols="12" md="12">
                    <ub-text-editor ref="textEditor" v-model="form.data.cntnt" :height="500" :value="form.data.cntnt"></ub-text-editor>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12" md="12" class="text-right">
                    <ub-button
                            mode="text"
                            color="warning"
                            label="저장"
                            icon="mdi-text-box-check"
                            @click="saveData"
                        ></ub-button>
                </v-col>
            
            </v-row>
        </v-form>
    `,
    data: () => ({
        form: {
            data: {
                startDt: moment().add(1, 'day').set('hour', 7).set('minute', 0).set('second', 0),
                endDt: moment().add(7, 'day').set('hour', 7).set('minute', 0).set('second', 0),
                applyYn: 'N',
                cntnt: ''
            },
        },
        exists: false,
        fetched: false

    }),
    created() {
        this.fetchData();
    },
    methods: {
        ...baseHelper.mapActions({
            $setOverlay: 'setOverlay'
        }),
        async fetchData() {
            this.$setOverlay(true);
            const resp = await xAjax({
                url: '/admin/getProductCommonContents',
                method: 'GET'
            });

            this.fetched = true;
            this.exists = !!resp;
            console.log('resp', resp);

            if (this.exists) {
                this.form.data = {
                    ...resp,
                    startDt: moment(resp.startDt, 'YYYY-MM-DD HH:mm:ss'),
                    endDt: moment(resp.endDt, 'YYYY-MM-DD HH:mm:ss')
                };
            }

            this.$setOverlay(false);
        },
        async saveData() {

            this.ubicus.base.lib.confirm('해당 내용으로 저장하시겠습니까?').then(async result => {
                if (result.isConfirmed) {

                    this.$setOverlay(true);

                    try {
                        await this.$refs['textEditor'].uploadImages();

                        const resp = await this.xAjaxJson({
                            url: '/admin/postProductCommonContents',
                            method: 'POST',
                            data: {
                                ...this.form.data,
                                startDt: this.form.data.startDt.format('YYYY-MM-DD HH:mm:ss'),
                                endDt: this.form.data.endDt.format('YYYY-MM-DD HH:mm:ss')
                            }
                        });

                        await this.fetchData();


                    } catch (e) {
                        this.ubicus.base.lib.notify(e, {title: '에러발생'}, {type: 'error'});
                        this.$setOverlay(false);
                    }

                }
            })

        }
    }
}

export default ProductCommonContentsManager