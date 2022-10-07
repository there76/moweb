import UbCategoryManager from '/static/apps/components/admin/base/category/UbCategoryManager.js';

const ProductCategoryManager = {
    name: 'product-category-manager',
    components: {
        UbCategoryManager
    },
    template: `
        <div>
            <v-sheet>
                <ub-category-manager category-type="PRODUCT" :addable="(item)=>item.depth < 2">
                     <!--<template v-slot:item-prepend="{item}">
                        <template>
                            <v-btn icon x-small @click.prevent.stop="moveup" style="width:12px;">
                                <v-icon small>mdi-chevron-up</v-icon>
                            </v-btn>
                            <v-btn icon x-small @click.prevent.stop="movedown" style="width:12px;">
                                <v-icon small>mdi-chevron-down</v-icon>
                            </v-btn>
                        </template>
                    </template>-->
                </ub-category-manager>
            </v-sheet>
        </div>
    `,
    data: () => ({}),
    created() {
        console.log('ProductCategoryManager created');
    },
    methods: {
        moveup(){
        },
        movedown(){
        }
    }
}
export default ProductCategoryManager;
