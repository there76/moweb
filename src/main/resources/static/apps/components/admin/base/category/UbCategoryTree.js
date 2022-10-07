'use strict';
import {xAjax} from '/static/apps/ajax/index.js';

const UbCategoryTree = {
    name: 'ub-category-tree',
    template: `
        <v-treeview @update:active="onActive" open-all item-text="cateNm" item-key="cateId" :active.sync="active" :items="items" :open.sync="open" activatable color="warning" :return-object="true" transition>
            <template v-slot:label="{item}">
                <div style="cursor: pointer;">{{item.cateNm}}</div>
            </template>
        </v-treeview>
    `,
    model: {
        event: 'change'
    },
    props: {
        categoryType: {
            type: String,
            required: true
        },
        onlyEnabled: {
            type: Boolean,
            default: true
        }
    },
    data: () => ({
        active: [],
        avatar: null,
        open: [],
        items: []
    }),
    computed: {},
    async mounted() {
        this.items = await xAjax({
            url: '/base/category/tree',
            data: {
                categoryType: this.categoryType,
                useYn: this.onlyEnabled ? 'Y' : ''
            }
        });
        this.items.forEach(item => this.open.push(item));
    },
    methods: {
        onActive(items) {
            this.$emit('change', items[0]);
        }
    }
};
export default UbCategoryTree;