import ProductList from '/static/apps/components/admin/product/ProductList.js';

const ProductSelectorDialog = {
    name: 'product-selector-dialog',
    components: {
        ProductList
    },
    template: `
        <v-dialog v-model="dialog" scrollable overlay-color="#fff" >
            <template v-slot:activator="{ on, attrs }">
                <slot name="activator" v-bind:on="on" v-bind:attrs="attrs">
                    <v-btn class="align-self-center" tile color="success" v-bind="attrs" v-on="on">
                       상품선택
                    </v-btn>
                </slot>
            </template>
            <v-card>
                <v-card-title>{{title}}</v-card-title>
                <v-card-text>
                    <product-list :headers="tbl.headers" ref="productList">
                        <template v-slot:item.thumbnail="{ item }">
                            <template v-if="item.thumbnailImage">
                                <img :src="item.thumbnailImage" style="max-width: 50px;"/>
                            </template>
                         </template>
                            
                         <template v-slot:item.category="{ item }">
                            {{item.productCategories[0].cate1Nm}}
                         </template>
                         <template v-slot:item.actions="{ item }">
                            <v-btn x-small color="green" @click.stop="applyItem(item)" v-if="!selectedProductKeys.includes(item.prdtKey)">
                                  적용
                            </v-btn>
                            <v-btn v-else x-small color="green" disabled>적용됨</v-btn>
                         </template>
                    </product-list>
                </v-card-text>
            </v-card>
        </v-dialog>
    `,
    props: {
        title: {
            type: String,
            default: '상품검색'
        },
        selectedProducts: {
            type: Array,
            default: () => []
        }
    },
    data: () => ({
        dialog: false,
        tbl: {
            headers: [
                {text: 'No', value: 'prdtNo', width: 60, sortable: false},
                {text: '이미지', value: 'thumbnail', width: 140, sortable: false, align: 'center'},
                {text: '카테고리', value: 'category', width: 140, sortable: false},
                {text: '상품명', value: 'prdtNm', sortable: false},
                {text: '진열여부', value: 'dplyYn', width: 100, align: 'center', sortable: false},
                {text: '단종여부', value: 'eolYn', width: 100, align: 'center', sortable: false},
                {text: '등록일', value: 'regDt', width: 160, align: 'center', sortable: false},
                {text: '적용', value: 'actions', width: 200, align: 'center', sortable: false},
            ]
        }
    }),
    computed: {
        selectedProductKeys() {
            return this.selectedProducts.map(e => e.prdtKey);
        }
    },
    methods: {
        applyItem(item) {
            this.selectedProducts.push(item);
        }
    }
}

export default ProductSelectorDialog;