'use strict';

import {xAjax} from '/static/apps/ajax/index.js';

const UbCategoryListGroup = {
    name: 'ub-category-list-group',
    template: `
        <v-list dense nav>
            <template v-for='node in items'>
                <v-list-group @click='onClick(node)' v-if='node.children && node.children.length' v-model='node.active'>
                    <template v-slot:activator>
                        <v-list-item-title>{{node.cateNm}}</v-list-item-title>
                    </template>
                    <category-list-group @click="onClick" class='py-0 pl-3' :nodes='node.children' />
                </v-list-group>
                <v-list-item @click='onClick(node)' v-else>
                    <v-list-item-title>{{node.cateNm}}</v-list-item-title>
                </v-list-item>
            </template>
        </v-list>
    `,
    props: {
        categoryType: {
            type: String,
            required: false
        },
        onlyEnabled: {
            type: Boolean,
            default: false
        },
        nodes: {
            type: Array,
            required: false
        }
    },
    data: () => ({
        items: []
    }),
    async mounted() {
        if (this.nodes) {
            this.items = this.nodes;
            return;
        }
        if (!this.categoryType) {
            console.error('[categoryType] is not defined');
            return;
        }
        if (!this.onlyEnabled) {
            console.error('[onlyEnabled] is not defined');
            return;
        }
        this.items = await xAjax({
            url: '/base/category/tree',
            data: {
                categoryType: this.categoryType,
                useYn: this.onlyEnabled ? 'Y' : ''
            }
        });
    },
    methods: {
        onClick(item) {
            this.$emit('click', item);
        }
    }
};
export default UbCategoryListGroup;