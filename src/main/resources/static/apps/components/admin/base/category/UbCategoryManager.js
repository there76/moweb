'use strict';

import {xAjax, xAjaxJson} from '/static/apps/ajax/index.js';

const UbCategoryManager = {
    name: 'ub-category-manager',
    template: `
        <v-card outlined>
            <!--<v-card-title class="indigo white&#45;&#45;text headline">
                        {{title}} 카테고리 관리
                   </v-card-title>-->
        
            <v-row justify="space-between">
                <v-col cols="12" md="3">
                    <div class="d-flex">
                        <v-checkbox dense label="미사용 포함" v-model="containsNotUse"></v-checkbox>
                        <v-spacer></v-spacer>
                        <div>
                            <v-btn icon @click.prevent.stop="moveup">
                                <v-icon>mdi-chevron-up</v-icon>
                            </v-btn>
                            <v-btn icon @click.prevent.stop="movedown">
                                <v-icon>mdi-chevron-down</v-icon>
                            </v-btn>
                        </div>
                    </div>
                    <v-divider></v-divider>
                    <v-treeview @update:active="onActive" open-all item-text="cateNm" item-key="cateId" :active.sync="active" :items="items" :load-children="fetchData" :open.sync="open" activatable color="warning" :return-object="true" transition>
                        <template v-slot:prepend="{ item }" v-if="!!this.$scopedSlots['item-prepend'] || !!this.$slots['item-prepend']">
                            <slot v-bind:item="item" name="item-prepend"></slot>
                        </template>
                        <template v-slot:label="{item}">
                            <div style="cursor: pointer;">{{item.cateNm}}</div>
                        </template>
                    </v-treeview>
                </v-col>
        
                <v-divider vertical></v-divider>
                <v-col>
                    <v-scroll-y-transition mode="out-in">
                        <div>
                            <v-card-title>
                                <span v-html="selectedPath"></span>
                                <span v-if="!form.edit && selected"><i>&nbsp;&gt; {{form.data.cateNm}} </i></span>
                                <span class="position-right">
                                    <v-tooltip bottom v-if="active[0] && addable(active[0])">
                                        <template v-slot:activator="{ on, attrs }">
                                            <v-btn color="warning" small v-bind="attrs" v-on="on" @click="newItem()">
                                                <v-icon>mdi-pencil</v-icon>
                                            </v-btn>
                                        </template><span>카테고리 추가</span>
                                    </v-tooltip>
                                </span>
                            </v-card-title>
                            <v-card-text v-if="selected !== null">
                                <v-form v-model="form.valid" ref="form">
                                    <v-row v-if="!form.edit && selected.cateId > -1">
                                        <v-col cols="12" md="8">
                                            <v-text-field label="상위 카테고리명" v-model="selected.cateNm" :readonly="true"></v-text-field>
                                        </v-col>
                                    </v-row>
                                    <v-row v-if="!form.edit || selected.cateId > -1">
                                        <v-col cols="12" md="8">
                                            <v-text-field label="카테고리명*" v-model="form.data.cateNm" :rules="ubicus.base.rule.required"></v-text-field>
                                        </v-col>
                                        <v-col cols="12" md="4">
                                            <v-switch true-value="Y" false-value="N" v-model="form.data.useYn" label="사용"></v-switch>
                                        </v-col>
                                        <v-col cols="12" md="12" class="text-right">
                                            <ub-button mode="text" color="warning" :label="form.edit ? '저장' : '생성'" icon="mdi-text-box-check" @click="saveItem()"></ub-button>
                                        </v-col>
                                    </v-row>
                                </v-form>
                            </v-card-text>
                        </div>
                    </v-scroll-y-transition>
                </v-col>
            </v-row>
        
        </v-card>
    `,
    props: {
        categoryType: {
            type: String,
            required: true
        },
        categoryName: {
            type: String,
            required: false
        },
        addable: {
            type: Function,
            default: item => {
                return true;
            }
        }
    },
    data: () => ({
        active: [],
        avatar: null,
        open: [],
        categories: [],
        siblings: [],
        selectedPath: '',
        containsNotUse: false,
        form: {
            valid: false,
            edit: true,
            data: {
                cateNm: '',
                cateId: -1,
                catePid: '',
                useYn: 'Y'
            }
        }
    }),
    mounted(){
    },
    computed: {
        title() {
            return this.categoryName || this.categoryType;
        },
        items() {
            return [{
                cateNm: `${this.title} 카테고리`,
                cateId: -1,
                depth: -1,
                path: [`${this.title} 카테고리`],
                children: this.categories
            }];
        },
        selected() {
            if (this.active.length) {
                return this.active[0];
            }
            return null;
        }
    },
    watch: {
        active: {
            deep: true,
            handler() {
                if (this.active.length && this.active[0].cateId != '-1') {
                    this.selectedPath = `<i>${this.active[0].path.slice(1).join(' > ')}</i>`;
                    this.siblings = this.active[0].parent.children;
                } else {
                    this.selectedPath = '';
                    this.siblings = [];
                }
            }
        },
        containsNotUse: {
            async handler() {
                this.categories = [];
                await this.fetchData(this.items[0]);
            }
        }
    },
    methods: {
        moveup() {
            if (!this.selected || this.active[0].cateId == '-1') {
                return this.ubicus.base.lib.notify('카테고리를 선택하세요.', {title: "경고"}, {type: 'error'});
            }
            const currentIndex = this.siblings.findIndex(e => e.cateId == this.form.data.cateId);
            if (currentIndex == 0) {
                this.siblings.splice(this.siblings.length - 1, 0, this.siblings.splice(currentIndex, 1)[0]);
            } else {
                this.siblings.splice(currentIndex - 1, 0, this.siblings.splice(currentIndex, 1)[0]);
            }

            this.xAjax({
                url: '/base/category/reOrder',
                method: 'PATCH',
                data: {
                    cateIds: this.siblings.map(e => e.cateId),
                    catePid: this.active[0].catePid
                }
            })
        },
        movedown() {
            if (!this.selected || this.active[0].cateId == '-1') {
                return this.ubicus.base.lib.notify('카테고리를 선택하세요.', {title: "경고"}, {type: 'error'});
            }
            const currentIndex = this.siblings.findIndex(e => e.cateId == this.form.data.cateId);
            if (currentIndex >= this.siblings.length-1) {
                this.siblings.splice(0, 0, this.siblings.splice(currentIndex, 1)[0]);
            } else {
                this.siblings.splice(currentIndex + 1, 0, this.siblings.splice(currentIndex, 1)[0]);
            }

            this.xAjax({
                url: '/base/category/reOrder',
                method: 'PATCH',
                data: {
                    cateIds: this.siblings.map(e => e.cateId),
                    catePid: this.active[0].catePid
                }
            })

        },
        onActive(items) {
            const item = items[0];
            if (item) {
                this.form.edit = true;
                this.form.data.cateId = item.cateId;
                this.form.data.cateNm = item.cateNm;
                this.form.data.catePid = item.catePid;
                this.form.data.useYn = item.useYn;
            } else {
                this.form.edit = false;
                this.form.data.cateId = -1;
                this.form.data.cateNm = '';
                this.form.data.catePid = '';
                this.form.data.useYn = 'Y';
            }
        },
        async saveItem() {
            if (!this.form.valid) {
                return this.$refs.form.validate();
            }
            await xAjaxJson({
                url: '/base/category/save',
                method: this.form.edit ? 'PATCH' : 'POST',
                data: Object.assign({
                    cateTp: this.categoryType
                }, this.form.data)
            });
            const activeItem = this.active[0];
            if (this.form.edit) {
                const path = activeItem.path;
                Object.assign(activeItem, this.form.data);
                activeItem.path[path.length - 1] = activeItem.cateNm;
            } else {
                await this.fetchData(activeItem);
                this.form.data.cateNm = '';
            }
            this.ubicus.base.lib.notify(`${this.form.edit ? '수정' : '생성'} 완료`);
        },
        newItem() {
            this.onActive([]);
            this.form.data.catePid = this.selected ? this.selected.cateId : -1;
        },
        getPath() {
            if (this.active.length) {
                return `<i>${this.active[0].path.slice(1).join(' > ')}</i>`;
            }
            return '';
        },
        fetchData(item) {
            item.children.splice(0, item.children.length);
            return xAjax({
                url: `/base/category/list?categoryType=${this.categoryType}&parent=${item.cateId}&useYn=${this.containsNotUse ? 'ALL' : 'Y'}`
            }).then(children => {
                children.forEach(child => {
                    if (!item.path) {
                        item.path = [item.cateNm];
                    }
                    child.children = [];
                    child.depth = item.depth + 1;
                    child.parent = item;
                    child.path = item.path.concat(child.cateNm);
                    item.children.push(child);
                });
            });
        }
    }
};
export default UbCategoryManager;