'use strict';

import {xAjax} from '/static/apps/ajax/index.js';

const UbCategorySelect = {
    name: 'ub-category-select',
    template: `
        <div :class="classes.join(' ')">
            <v-select class="custom-select" outlined dense hide-details :label="label" :multiple="multiple"
            :rules="rules" :value="selected" @change="onChange" 
            item-text="cateNm" item-value="cateId" :items="items">
            </v-select>
        </div>
    `,
    model: {
        event: 'change'
    },
    props: {
        multiple: {
            type: Boolean,
            default: false
        },
        classes: {
            type: Array,
            default: () => []
        },
        rules: {
            type: Array,
            default: () => []
        },
        categoryType: {
            type: String,
            required: true
        },
        searchMode: {
            type: Boolean,
            default: true
        },
        label: String,
        parent: {
            type: String,
            default: '-1'
        },
        selected: {
            default: ''
        }
    },
    data() {
        return {
            originItems: [],
        };
    },
    computed: {
        items() {
            if (this.searchMode) {
                return [{
                    cateNm: '전체',
                    cateId: ''
                }].concat(this.originItems);
            }
            return this.originItems;
        },
        defaultValue() {
            return this.multiple ? [] : '';
        }
    },
    watch: {
        'parent': async function (newValue, oldValue) {
            if (!newValue) {
                await this.setItems(true);
            } else if (newValue !== oldValue) {
                await this.setItems();
            }
        }
    },
    async mounted() {
        await this.setItems();
    },
    destroyed() {
        this.$emit('change', '');
    },
    methods: {
        onChange(value) {
            this.$emit('change', value);
            this.$emit('update:selected', value);
        },
        async fetchItems() {
            if (!this.parent) {
                return [];
            }
            return await xAjax({
                url: '/base/category/list',
                data: {
                    parent: this.parent,
                    categoryType: this.categoryType,
                    useYn: 'Y'
                }
            });
        },
        async setItems(empty = false) {
            if (empty) {
                this.originItems = [];
            } else {
                this.originItems = await this.fetchItems();
            }

            if (this.originItems.length && this.selected) {
                const itemIdList = this.originItems.map(e => String(e.cateId));
                if (this.multiple) {
                    this.onChange(_.intersectionBy(itemIdList, this.selected))
                } else {
                    const target = itemIdList.find(e => e == this.selected);
                    this.onChange(target ? target : '');
                }
                return;
            }

            this.onChange(this.defaultValue)
        }
    }
};
export default UbCategorySelect;