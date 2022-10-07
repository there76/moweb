

const UbBaseTree = {
    name: 'ub-base-tree',
    template: `
        <div :ref="refName" class="js-tree-wrapper"></div>
    `,
    props: {
        url: String,
        refName: {
            type: String,
            default: 'js-tree'
        },
        changed: Function,
        created: Function,
        renamed: Function,
        deleted: Function,
        moved: Function,
        multiple: {
            type: Boolean,
            default: false
        },
        dnd: {
            type: Boolean,
            default: false
        },
        state: {
            type: Boolean,
            default: false
        }
    },
    data: function () {
        return {
            instance: undefined
        };
    },
    created() {

    },
    async mounted() {
        await this.fetchData();
    },
    computed: {},
    watch: {},
    methods: {
        async fetchData() {
            const options = {
                multiple: this.multiple,
                dnd: this.dnd,
                state: this.state
            };

            const plugins = ['themes', 'json_data', 'ui', 'crrm', 'types', 'search'/*, "wholerow"*//*, "contextmenu"*/];
            if (options['dnd']) {
                plugins.push('dnd');
            }
            if (options['state']) {
                plugins.push('state');
            }


            const _this = this;

            const treeData = await this.xAjax({
                url: this.url
            });

            const jsTreeOptions = {
                'plugins': plugins,
                'themes': {
                    'responsive': false
                },
                core: {
                    multiple: options.multiple,
                    data: treeData,
                    check_callback: true
                },
                'state': {
                    'key': 'ubicus-base-tree-' + this.refName
                },
                'types': {
                    'default': {
                        'icon': 'mdi mdi-folder text-primary'
                    },
                    'folder': {
                        'icon': 'mdi mdi-folder text-primary'
                    },
                    'code': {
                        'icon': 'mdi mdi-folder text-primary'
                    },
                    'file': {
                        'icon': 'mdi mdi-file  text-primary'
                    }
                },
                search: {
                    case_insensitive: true,
                    show_only_matches: true,
                    search_callback: function (str, node) {

                        if (str === '') {
                            return true;
                        }

                        const pos = str.indexOf('^');
                        let target = 'name';
                        let keyword = str.trim();

                        if (pos > 0) {
                            target = str.substring(0, pos).trim();
                            keyword = str.substring(pos + 1).trim();
                        }


                        if (keyword === '') {
                            return true;
                        }

                        keyword = keyword.toLowerCase();

                        if (target === 'code') {
                            return (node.data.cd || node.data.divCd).toLowerCase().includes(keyword);
                        } else {
                            if (keyword.indexOf('/') === 0) {//경로 검색
                                const path = node.data.path + node.data.paths;
                                return path.toLowerCase().includes(keyword);
                            }

                            return node.text.toLowerCase().includes(keyword);
                        }

                    }
                }
            };

            const $refTree = $(this.$refs[this.refName]);
            $refTree.jstree(jsTreeOptions).on('changed.jstree', function (e, data) {
                _this.$emit('changed', e, data, _this.instance);
            }).on('create_node.jstree', function (e, data) {
                _this.$emit('created', e, data, _this.instance);
            }).on('rename_node.jstree', function (e, data) {
                _this.$emit('renamed', e, data, _this.instance);
            }).on('delete_node.jstree', function (e, data) {
                _this.$emit('deleted', e, data, _this.instance);
            }).on('move_node.jstree', function (e, data) {
                _this.$emit('moved', e, data, _this.instance);
            });

            this.instance = $refTree.jstree(true);
        },
        async refresh(nodeId) {
            if (nodeId !== undefined) {
                this.instance.refresh_node(nodeId);
            } else {
                this.instance.settings.core.data = await this.xAjax({
                    url: this.url
                });
                this.instance.refresh();
            }
        },
        search(target, searchText) {
            this.instance.search(`${target}^${searchText}`);
        },
        showAll() {
            this.instance.show_all();
        },
        rename_node(node, text) {
            this.instance.rename_node(node, text);
        },
        getInstance() {
            return this.instance;
        },
        getPath(node) {
            const nodePath = '<i class="text-primary">' + node.text + '</i>';
            if (node.parent === '#') {
                return nodePath;
            } else {
                const prePath = this.instance.get_path(node.parent, ' > ');
                return '<i>' + prePath + '</i>' + '<i class="text-danger"> > </i>' + nodePath;
            }
        },
        deselectAll() {
            this.instance.deselect_all();
        },
        getSelectedNode(isFull) {//boolean
            return this.instance.get_selected(isFull);
        },
        getNode(nodeId) {
            return this.instance.get_node(nodeId);
        },
        getTopNode(node) {
            if (typeof node === 'string') {//id
                node = this.instance.get_node(node);
            }

            let parent = node;
            let i = 0;
            while (parent.parent !== '#') {
                parent = this.instance.get_node(parent.parent);
                i++;

                if (i > 10) {
                    console.log('loop count over ' + i);
                    break;
                }
            }
            return parent;
        },
        expandAll() {
            this.instance.open_all();
        },
        collapseAll() {
            this.instance.close_all();
        }
    }
};

export default UbBaseTree;