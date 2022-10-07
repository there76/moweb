import UbCategorySelect from '/static/apps/components/admin/base/category/UbCategorySelect.js';

const baseHelper = Vuex.createNamespacedHelpers('base');

const ProductList = {
    name: 'product-list',
    components: {
        UbCategorySelect
    },
    template: `
        <div>
            <ub-search :classes="['pb-0']">
                <div class="w-190px">
                    <ub-date-range-picker label="등록일" :start.sync="search.startDate" :end.sync="search.endDate" format="datetime"></ub-date-range-picker>
                </div>
                <div class="w-190px">
                    <ub-category-select label="대분류" :parent="'-1'" :search-mode="true" :selected.sync="search.category1" category-type="PRODUCT"></ub-category-select>                
                </div>
                <div class="w-190px">
                    <v-select v-model="search.searchTarget" label="검색구분" @change="fetchData(true)" item-value="value" item-text="text" :items="searchOptions.searchTargets" outlined dense hide-details></v-select>
                </div>
                <div class="w-290px">
                    <v-text-field label="검색어" v-model="search.keyword" @keyup.enter="fetchData(true)" outlined dense hide-details></v-text-field>
                </div>
                <div style="width: 100%;" v-if="category2Options && category2Options.length > 0">
                    <v-simple-table dense class="ml-0">
                        <template v-slot:default>
                            <colgroup>
                                <col width="100px"/>
                                <col/>
                            </colgroup>
                            <thead>
                                <tr>
                                    <th>중분류</th>
                                    <th>소분류</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(cate2, index) in category2Options" :key="index">
                                    <th>{{cate2.cateNm}}</th>
                                    <td>
                                        <div class="d-flex">
                                            <v-checkbox v-for="cate3 in cate2.children" v-model="search.category3s"
                                               class="mt-0 mr-2" 
                                               hide-details
                                              :label="cate3.cateNm"
                                              :value="search.category1 + ':' + cate2.cateId + ':' + cate3.cateId"
                                        ></v-checkbox>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </template>
                    </v-simple-table>
                </div>
            </ub-search>
            <ub-search>
                <div>
                    <v-select v-model="search.display" label="진열상태" @change="fetchData(true)" item-value="value" item-text="text" :items="searchOptions.display" outlined dense hide-details></v-select>
                </div>
                <div>
                    <v-select v-model="search.assign" label="할당여부" @change="fetchData(true)" item-value="value" item-text="text" :items="searchOptions.assign" outlined dense hide-details></v-select>
                </div>
                <div>
                    <v-select v-model="search.delYn" label="삭제여부" @change="fetchData(true)" item-value="value" item-text="text" :items="searchOptions.delete" outlined dense hide-details></v-select>
                </div>
                <div>
                    <v-select v-model="search.eolYn" label="단종여부" @change="fetchData(true)" item-value="value" item-text="text" :items="searchOptions.eol" outlined dense hide-details></v-select>
                </div>
                <div>
                    <v-select v-model="search.spcYn" label="특가여부" @change="fetchData(true)" item-value="value" item-text="text" :items="searchOptions.special" outlined dense hide-details></v-select>
                </div>
                <div class="search-form-btns">
                    <ub-button color="primary" label="검색" icon="mdi-magnify" @click="fetchData(true)"></ub-button>
                    <slot name="searchFormButtons"></slot>
                </div>
            </ub-search>
            
            <v-data-table dense fixed-header 
                    :loading="isLoading"
                    no-data-text="조회된 상품이 존재하지 않습니다."
                    loading-text="상품을 조회중입니다.."
                    :height="$settings.datatable.rows10" 
                    :footer-props="$settings.datatable.footer10" 
                    :headers="headers" :items="tbl.items" 
                    :options.sync="tbl.options" 
                    item-key="prdtKey"
                    single-select
                     @click:row="selectItem"
                    :server-items-length="tbl.total" >
                    
                    <template v-slot:[slotItem.slotName]="{ item }" v-for="slotItem in slotNames">
                        <slot :name="slotItem.slotName" v-bind:item="item">{{item[slotItem.key]}}</slot>
                    </template>
                 
             </v-data-table>
            
        </div>
    `,
    props: {
        headers: Array,
        fetchUrl: String,
    },
    data: () => ({
        isLoading: false,
        searchOptions: {
            searchTargets: [
                {value: '', text: '전체'},
                {value: 'prdt_nm', text: '제품명'},
                {value: 'prdt_dsc', text: '간단설명'},
                {value: 'prdt_dt_dsc', text: '제품설명'},
                {value: 'tag', text: 'TAG'},
            ],
            display: [
                {value: '', text: '전체'},
                {value: 'Y', text: '진열'},
                {value: 'N', text: '진열안함'},
            ],
            assign: [
                {value: '', text: '전체'},
                {value: 'Y', text: '할당'},
                {value: 'N', text: '할당안함'},
            ],
            delete: [
                {value: 'N', text: '정상'},
                {value: 'Y', text: '삭제'},
            ],
            eol: [
                {value: '', text: '전체'},
                {value: 'N', text: '판매중'},
                {value: 'Y', text: '단종'},
            ],
            special: [
                {value: '', text: '전체'},
                {value: 'N', text: '일반'},
                {value: 'Y', text: '특가'},
            ],
        },
        search: {
            searchTarget: '',
            keyword: '',
            category1: '',
            //category2: undefined,
            category3s: [],
            display: '',
            assign: '',
            delYn: 'N',
            eolYn: '',
            spcYn: '',
            startDate: null,
            endDate: null
        },
        tbl: {
            headers: [],
            items: [],
            total: 10,
            options: null
        },
    }),
    computed: {
        ...baseHelper.mapGetters(['getProductCategories']),
        slotNames() {
            return this.headers.map(e => ({
                slotName: `item.${e.value}`,
                key: e.value
            }));
        },
        category2Options() {
            if (!this.search.category1) {
                return [];
            }
            const category1 = this.getProductCategories.find(e => e.cateId == this.search.category1);
            if (!category1) {
                return [];
            }
            return category1.children;
        },

    },
    created() {
        this.url = this.fetchUrl;
    },
    methods: {
        fetchData(isSearchFirst, isAuto = false) {

            if (this.tbl.paging !== 'client' && isSearchFirst === true) {//1페이지 조회
                this.ubicus.base.util.dataTablesReset(this.tbl.options);
                return Promise.resolve({})
            }

            this.tbl.items = [];

            this.$emit('preFetch', isAuto);

            this.isLoading = true;

            /*if(this.tbl.options.sortBy.length == 0) {
                this.tbl.options.sortBy = ['regDt'];
                this.tbl.options.sortDesc = [true];
            }*/

            return this.xAjax({
                url: '/admin/product',
                method: 'GET',
                data: this.ubicus.base.util.dataTablesParam({
                    ...this.tbl.options,
                    sortBy: this.tbl.options.sortBy.length == 0 ? ['regDt'] : this.tbl.options.sortBy,
                    sortDesc: this.tbl.options.sortBy.length == 0 ? [true] : this.tbl.options.sortDesc,
                }, this.search, [])
            }).then(resp => {
                this.tbl.items = resp.data;
                this.tbl.total = resp.recordsTotal;

                this.$emit('fetched', resp, isAuto);

                this.isLoading = false;
            });
        },
        selectItem(item, row) {
            row.select(true);
            this.$emit('select', item, false)
        }
    },
    watch: {
        'tbl.options': {
            handler() {
                this.fetchData();
            },
            deep: true
        },
        'search.category1'(newValue, oldValue) {
            this.search.category3s = [];
            this.fetchData(true);
        },
        'search.category3s': {
            handler(newValue, oldValue) {
                if (newValue.length != oldValue.length) {
                    console.log(newValue, oldValue)
                    this.fetchData(true);
                }
            },
            deep: true
        }
    }
}

export default ProductList;
