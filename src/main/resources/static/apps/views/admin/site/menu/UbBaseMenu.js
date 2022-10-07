const UbBaseMenu = {
    name: 'ub-base-menu',
    template: `
        <div>
            <v-sheet>
                <v-row>
                    <v-col cols="12" md="5">
                        <v-card outlined>
                            <v-card-title>
                                <v-row>
                                    <v-col cols="5">
                                        <v-select slot="prepend" id="application" label="구분" v-if="applicationMenuList.length > 0" v-model="activeApplicationMenuId" :items="applicationMenuList" item-text="name" item-value="id" outlined dense hide-details></v-select>
                                    </v-col>
                                    <v-col cols="5">
                                        <v-text-field slot="default" label="검색" v-model="searchKeyword" @keyup.enter="searchTree" outlined dense hide-details></v-text-field>
                                    </v-col>
                                    <v-col cols="2">
                                        <v-menu slot="append" bottom left>
                                            <template v-slot:activator="{ on, attrs }">
                                                <v-btn icon small color="grey" v-bind="attrs" v-on="on">
                                                    <v-icon>mdi-dots-vertical</v-icon>
                                                </v-btn>
                                            </template>
                                            <v-list>
                                                <v-list-item link @click="reloadMenuManageInfo">
                                                    <v-list-item-title>
                                                        <v-icon>mdi-sync</v-icon> Sync
                                                    </v-list-item-title>
                                                </v-list-item>
                                                <v-list-item link @click="openAllTree">
                                                    <v-list-item-title>
                                                        <v-icon>mdi-arrow-expand-all</v-icon> Expand
                                                    </v-list-item-title>
                                                </v-list-item>
                                                <v-list-item link @click="closeAllTree">
                                                    <v-list-item-title>
                                                        <v-icon>mdi-arrow-collapse-all</v-icon> Collapse
                                                    </v-list-item-title>
                                                </v-list-item>
                                                <v-list-item link @click="exportXml">
                                                    <v-list-item-title>
                                                        <v-icon>mdi-download</v-icon> Export
                                                    </v-list-item-title>
                                                </v-list-item>
                                                <v-list-item link @click="importXml">
                                                    <v-list-item-title>
                                                        <v-icon>mdi-upload</v-icon> Import
                                                    </v-list-item-title>
                                                </v-list-item>
                                                <v-dialog v-model="dialog" max-width="600px">
                                                    <template v-slot:activator="{ on, attrs }">
                                                        <v-list-item link @click="dialog = true" v-bind="attrs" v-on="on">
                                                            <v-list-item-title>
                                                                <v-icon>mdi-plus</v-icon>
                                                                Application
                                                            </v-list-item-title>
                                                        </v-list-item>
                                                    </template>
                                                    <v-card>
                                                        <v-card-title>
                                                            <span class="headline">Add Application</span>
                                                        </v-card-title>
                                                        <v-card-text>
                                                            <v-container>
                                                                <v-row>
                                                                    <v-col cols="12">
                                                                        <v-text-field v-model="application.id" label="ID" required></v-text-field>
                                                                    </v-col>
                                                                </v-row>
                                                                <v-row>
                                                                    <v-col cols="12">
                                                                        <v-text-field v-model="application.name" label="NAME" required></v-text-field>
                                                                    </v-col>
                                                                </v-row>
                                                            </v-container>
                                                        </v-card-text>
                                                        <v-card-actions>
                                                            <v-spacer></v-spacer>
                                                            <v-btn color="blue darken-1" text @click="dialog = false">
                                                                닫기
                                                            </v-btn>
                                                            <v-btn color="blue darken-1" text @click="addApplication">
                                                                추가
                                                            </v-btn>
                                                        </v-card-actions>
                                                    </v-card>
                                                </v-dialog>
                                            </v-list>
                                        </v-menu>
                                    </v-col>
                                </v-row>
                            </v-card-title>
                            <v-card-text class="div-scroll-y">
                                <div id="jstree"></div>
                            </v-card-text>
                        </v-card>
        
                        <form id="upload-form" action="importSiteMenu" class="form-horizontal" method="post" enctype="multipart/form-data" style="display:none">
                            <input type="hidden" name="" value=""/>
                            <input type="file" name="files" @change="uploadXml($event)" ref="fileUploadField"/>
                        </form>
                    </v-col>
                    
                    <v-col cols="12" md="7" v-if="menu.id">
                        <v-card outlined>
                            <v-card-title>
                                <span v-html="paths"></span>
                                <span class="position-right">
                                <v-tooltip bottom>
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-btn color="warning" small v-bind="attrs" v-on="on" @click="saveSitemenu()">
                                            <v-icon>mdi-content-save</v-icon>
                                        </v-btn>
                                    </template>
                                    <span>일괄 적용</span>
                                </v-tooltip>
                            </span>
                            </v-card-title>
                            <v-card-text class="div-scroll-y">
                                <form id="f" class="form-horizontal" method="post">
                                    <v-row>
                                        <v-col cols="12" sm="6">
                                            <v-text-field label="부모아이디" name="pid" v-model="menu.parent" readonly outlined dense hide-details></v-text-field>
                                        </v-col>
                                        <v-col cols="12" md="6">
                                            <v-text-field label="아이디" placeholder="자동생성" name="id" v-model="menu.id" readonly outlined dense hide-details></v-text-field>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col cols="12" sm="6">
                                            <v-text-field label="이름" name="name" v-model="menu.name" required outlined dense hide-details></v-text-field>
                                        </v-col>
                                        <v-col cols="12" sm="6">
                                            <v-text-field label="정렬순서" name="sort" v-model="menu.sort" required outlined dense hide-details></v-text-field>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col cols="12" md="4">
                                            <v-select label="노출여부" v-model="menu.display" :items="[{text:'보임',value:'Y'},{text:'숨김',value:'N'}]" outlined dense hide-details></v-select>
                                        </v-col>
                                        <v-col cols="12" sm="4">
                                            <v-select label="템플릿" v-model="menu.template" :items="templatesGroupArray" outlined dense hide-details></v-select>
                                        </v-col>
                                        <v-col cols="12" md="4">
                                            <v-select label="권한체커" v-model="menu.authorizer" :items="orderedAuthorizerArray" outlined dense hide-details></v-select>
                                        </v-col>
                                    </v-row>
        
                                    <v-row>
                                        <v-col cols="2">
                                            <span>path</span>
                                        </v-col>
                                        <v-col cols="10">
                                            <v-row>
                                                <v-col cols="12" class="d-flex">
                                                    <v-select class="mr-1 maw-120px" label="method" v-model="menu.method" :items="methodsSet" hide-details="auto" dense outlined></v-select>
                                                    <v-text-field label="path" v-model="menu.path" hide-details="auto" dense outlined></v-text-field>
                                                </v-col>
                                            </v-row>
        
                                            <v-row>
                                                <v-col cols="12" class="d-flex">
                                                    <v-select label="roles" v-model="menuRoles" :items="sitemenuRoles"
                                                        item-value="code" item-text="name" multiple chips return-object
                                                        outlined dense hide-details
                                                    >
                                                        <template #selection="{ item }">
                                                            <v-chip color="green" small @click:close="deleteRole(menuRoles, item)">{{item.name}}</v-chip>
                                                        </template>
                                                    </v-select>
                                                    
                                                    <v-btn icon @click="copyRoles(menuRoles)" title="COPY ROLES">
                                                        <v-icon>mdi-content-copy</v-icon>
                                                    </v-btn>
                                                    <v-btn icon @click="pasteRoles('pathRoles')" title="PASTE ROLES">
                                                        <v-icon>mdi-content-paste</v-icon>
                                                    </v-btn>
                                                </v-col>
                                            </v-row>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col cols="2">
                                            <span>paths</span>
                                        </v-col>
                                        <v-col cols="10">
                                            <div v-for="(menuPath, index) in menuPaths" :key="index">
                                                <v-row>
                                                    <v-col cols="12" class="d-flex">
                                                        <v-select class="mr-1 maw-120px" label="method" v-model="menuPath.method" :items="methodsSet" hide-details="auto" dense outlined></v-select>
                                                        <v-text-field label="path" v-model="menuPath.path" hide-details="auto" dense outlined></v-text-field>
                                                        <v-btn icon :color="index === menuPaths.length - 1 ? 'blue' : 'red'" @click="addMenuPaths(index)">
                                                            <v-icon v-if="index === menuPaths.length - 1">mdi-plus</v-icon>
                                                            <v-icon v-else>mdi-minus</v-icon>
                                                        </v-btn>
                                                    </v-col>
                                                </v-row>
                                                <v-row>
                                                    <v-col cols="12" class="d-flex">
                                                        <v-select label="roles" v-model="menuPath.roles" :items="sitemenuRoles"
                                                          item-value="code" item-text="name" multiple chips return-object
                                                          outlined dense hide-details
                                                        >
                                                            <template #selection="{ item }">
                                                                <v-chip color="green" small @click:close="deleteRole(menuPath.roles, item)">{{item.name}}</v-chip>
                                                            </template>
                                                        </v-select>
                                                        
                                                        <v-btn icon @click="copyRoles(menuPath.roles)" title="COPY ROLES">
                                                            <v-icon>mdi-content-copy</v-icon>
                                                        </v-btn>
                                                        <v-btn icon @click="pasteRoles('pathsRoles', menuPath)" title="PASTE ROLES">
                                                            <v-icon>mdi-content-paste</v-icon>
                                                        </v-btn>
                                                    </v-col>
                                                </v-row>
                                            </div>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col cols="2">
                                            <span>params</span>
                                        </v-col>
                                        <v-col cols="10">
                                            <v-row v-for="(item, index) in menuParams" :key="index">
                                                <v-col cols="12" class="d-flex">
                                                    <v-text-field class="mr-1 maw-120px" label="key" v-model="item.key" hide-details="auto" dense outlined></v-text-field>
                                                    <v-text-field label="value" v-model="item.value" hide-details="auto" dense outlined></v-text-field>
                                                    <v-btn icon :color="index === menuParams.length - 1 ? 'blue' : 'red'" @click="addMenuParams(index)">
                                                        <v-icon v-if="index === menuParams.length - 1">mdi-plus</v-icon>
                                                        <v-icon v-else>mdi-minus</v-icon>
                                                    </v-btn>
                                                </v-col>
                                            </v-row>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col cols="2">
                                            <span>attributes</span>
                                        </v-col>
                                        <v-col cols="10">
                                            <v-row>
                                                <v-col cols="12">
                                                    <v-textarea outlined placeholder="type attributes by json" v-model="menuAttributes"></v-textarea>
                                                </v-col>
                                            </v-row>
                                        </v-col>
                                    </v-row>
                                </form>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
                <textarea id="output" style="display: none"></textarea>
            </v-sheet>
        </div>
    `,
    data: function () {
        return {
            controllerPrefix: '/base/menu',
            defaultMenuInfo: {
                indexKey: '',
                parent: '',
                id: '',
                name: '',
                method: 'GET',
                path: '',
                sort: 0,
                display: 'Y',
                template: 'NONE',
                authorizer: 'NONE',
                paths: '',
                roles: {},
                attributes: '',
                leaf: ''
            },
            paths: '',
            applicationMenuList: [],
            activeApplicationMenuId: undefined,
            jsTree: {},
            jsTreeData: [],
            methodsSet: [],
            sitemenuRoles: [],
            templatesGroupArray: [],
            orderedAuthorizerArray: [],
            rootMenuId: '',
            searchKeyword: '',
            breadcrumb: [],
            menu: {},
            menuPaths: [],
            menuParams: [],
            application: {
                rid: '',
                id: '',
                name: ''
            },
            notify: {
                show: false,
                type: 'success',
                message: ''
            },
            dialog: false
        };
    },
    computed: {
        menuRoles: {
            get() {
                return !_.isEmpty(this.menu.roles) ? _.map(this.menu.roles, roleCode => this.getRoleByCode(roleCode)) : [];
            },
            set(roles) {
                this.menu.roles = _.map(roles, role => role.code);
            }
        },
        menuAttributes: {
            get() {
                return !_.isEmpty(this.menu.attributes) ? JSON.stringify(this.menu.attributes, 0, 4) : '';
            },
            set(attributes) {
                let parsedAttributes = undefined;

                try {
                    parsedAttributes = JSON.parse(attributes);
                } catch (e) {
                    console.log(e);
                }

                if (parsedAttributes) {
                    this.menu.attributes = parsedAttributes;
                }
            }
        }
    },
    created() {
        this.menu = _.cloneDeep(this.defaultMenuInfo);
        this.innerAjax({
            url: `/getMenuManageInfo`,
            async: false,
            usePrefixUrl: false,
            success: (resp) => {
                if (resp) {
                    this.jsTreeData = resp.jsTreeData;
                    this.applicationMenuList = resp.applicationMenuList;
                    this.methodsSet = resp.methodsSet;
                    this.sitemenuRoles = resp.sitemenuRoles || [];
                    this.rootMenuId = resp.rootMenuId;


                    const templatesGroupArray = [{text: '적용안함', value: 'NONE', path: ''}];
                    const templatesGroupMap = resp.templatesGroupMap;
                    for (let i in templatesGroupMap) {
                        if (Object.prototype.hasOwnProperty.call(templatesGroupMap, i)) {
                            templatesGroupArray.push({
                                text: templatesGroupMap[i].name,
                                value: i,
                                path: templatesGroupMap[i].path
                            });
                        }
                    }
                    this.templatesGroupArray = templatesGroupArray;

                    const orderedAuthorizerArray = [{text: '적용안함', value: 'NONE'}];
                    const orderedAuthorizerMap = resp.orderedAuthorizerMap;
                    for (let i in orderedAuthorizerMap) {
                        if (Object.prototype.hasOwnProperty.call(orderedAuthorizerMap, i)) {
                            orderedAuthorizerArray.push({
                                text: orderedAuthorizerMap[i],
                                value: i
                            });
                        }
                    }
                    this.orderedAuthorizerArray = orderedAuthorizerArray;
                }
            }
        });
    },
    mounted() {
        this.activeApplicationMenuId = this.applicationMenuList[0].id;
    },
    methods: {
        innerAjax(options) {
            options['url'] = this.controllerPrefix + options['url']
            options['usePrefixUrl']= false;
            return this.xAjax(options);
        },

        showNotify(message, type) {
            this.notify.message = message;
            this.notify.type = type || 'success';
            this.notify.show = true;

            setTimeout(() => {
                this.notify.show = false;
            }, 1000);
        },
        getMenuList() {
            return this.jsTreeData[this.activeApplicationMenuId];
        },

        makeJsTree() {
            this.jsTree = $('#jstree').jstree({
                plugins: ['themes', 'state', 'json_data', 'ui', 'crrm', 'dnd', 'types', 'search', 'contextmenu'],
                core: {
                    data: this.getMenuList(),
                    check_callback: true
                },
                search: {
                    case_insensitive: true,
                    show_only_matches: true,
                    search_callback: function (str, node) {
                        if (str === '') {
                            return true;
                        }

                        if (str.indexOf('/') === 0) {//경로 검색
                            const path = node.data.path + node.data.paths;
                            return path.includes(str);
                        }

                        const text = node.text.toLowerCase();
                        return text.includes(str.toLowerCase());
                    }
                },
                types: {
                    'default': {
                        'icon': 'mdi mdi-folder text-primary'
                    },
                    'folder': {
                        'icon': 'mdi mdi-folder-multiple-outline text-primary'
                    },
                    'code': {
                        'icon': 'mdi mdi-folder-outline text-primary'
                    },
                    'file': {
                        'icon': 'mdi mdi-file  text-primary'
                    }
                }
            })
                .on('select_node.jstree', (e, data) => {
                    this.paths = this.getPath(data.node)
                    this.setMenuItem(data.node.data);
                })
                .on('create_node.jstree', (e, data) => {
                    const parentNode = this.jsTree.get_node(data.parent);

                    const shortUuid = this.getShortUuid();
                    $('#jstree').jstree().set_id(data.node, shortUuid);

                    data.node.icon = 'mdi mdi-file';
                    data.node.data = _.cloneDeep(this.defaultMenuInfo);
                    data.node.data.id = data.node.id;
                    data.node.data.type = 'menu';
                    data.node.data.name = data.node.text;
                    data.node.data.text = data.node.text;
                    data.node.data.parent = data.parent;
                    data.node.data.sort = parentNode.children.length;

                    if (parentNode.data.template !== 'NONE') {
                        data.node.data.template = parentNode.data.template;
                    }

                    if (parentNode.data.authorizer !== 'NONE') {
                        data.node.data.authorizer = parentNode.data.authorizer;
                    }

                    if (parentNode.data.roles !== '') {
                        data.node.data.roles = parentNode.data.roles;
                    }

                    this.jsTree.deselect_node(data.parent);
                    this.jsTree.select_node(data.node.id);

                    this.reDrawParent(parentNode.id);

                    const addIndex = _.findIndex(this.getMenuList(), menu => menu.id === parentNode.id) + parentNode.children.length + 1;
                    this.getMenuList().splice(addIndex, 0, {
                        id: data.node.id,
                        parent: data.parent,
                        text: data.node.text,
                        data: data.node.data
                    });
                })
                .on('rename_node.jstree', (e, data) => {

                    data.node.data.text = data.node.text;
                    data.node.data.name = data.node.text;
                })
                .on('delete_node.jstree', (e, data) => {

                    const parentNode = this.jsTree.get_node(data.parent);
                    const menuList = this.getMenuList();
                    const removeIndex = _.findLastIndex(menuList, menu => menu.id === data.node.id);

                    menuList.splice(removeIndex, data.node.children.length + 1);
                    this.reDrawParent(parentNode.id);
                    this.menu = _.cloneDeep(this.defaultMenuInfo);
                })
                .on('move_node.jstree', (e, data) => {
                    data.node.data.parent = data.parent;
                    this.menu.parent = data.parent;

                    const parentNode = this.jsTree.get_node(data.parent);
                    const menuList = this.getMenuList();
                    const removeIndex = _.findLastIndex(menuList, menu => menu.id === data.node.id);

                    const moveMenuList = menuList.splice(removeIndex, data.node.children.length + 1);
                    const moveMenu = _.find(moveMenuList, moveMenu => moveMenu.id === data.node.id);
                    moveMenu.parent = data.parent;
                    moveMenu.data.parent = data.parent;

                    const moveIndex = _.findLastIndex(menuList, menu => menu.id === parentNode.id) + 1;
                    this.getMenuList().splice(moveIndex, 0, ...moveMenuList);

                    this.adjustNodeSort(data.parent);
                    this.reDrawParent(data.parent);
                    this.adjustNodeSort(data.old_parent);
                    this.reDrawParent(data.old_parent);
                })
                .jstree(true);
        },
        adjustNodeSort(parentId) {
            const parentNode = this.jsTree.get_node(parentId);
            const parentNodeChildren = parentNode.children;
            _.forEach(parentNodeChildren, (childNodeId, index) => {
                const childNode = this.jsTree.get_node(childNodeId);
                const childMenu = _.find(this.getMenuList(), menu => menu.id === childNodeId);

                childNode.data.sort = index + 1;
                childMenu.data.sort = index + 1;
            });
        },
        reDrawParent(parentId) {
            const parentNode = this.jsTree.get_node(parentId);

            if (parentNode.children.length === 0) {
                parentNode.icon = 'mdi mdi-file';
            } else {
                parentNode.icon = 'mdi mdi-folder';
            }

            this.jsTree.redraw_node(parentNode);
        },
        refreshJsTree() {
            this.jsTree.settings.core.data = this.getMenuList();
            this.jsTree.refresh();
        },
        loadJsTree() {
            if (_.isEmpty(this.jsTree)) {
                this.makeJsTree();
            } else {
                this.refreshJsTree();
            }
        },
        searchTree() {
            this.jsTree.search(this.searchKeyword);
        },
        openAllTree() {
            this.jsTree.open_all();
        },
        closeAllTree() {
            this.jsTree.close_all();
        },
        exportXml() {
            location.href = `${this.controllerPrefix}/export`;
        },
        menuDataToXml(menu) {
            const attrNames = ['id', 'name', 'method', 'path', 'paths', 'template', 'roles', 'display', 'params', 'attributes'];
            const skipAttrs = {
                method: 'GET',
                display: 'Y'
            };
            const attrs = {};
            _.forEach(_.pickBy(_.pickBy(menu.data, (value, key) => attrNames.indexOf(key) !== -1 && !_.isEmpty(value)), (value2, key2) => skipAttrs[key2] !== value2), (value3, key3) => {
                let _value = value3;
                if (key3 === 'paths') {
                    _value = value3.join(',');
                }

                if (key3 === 'roles') {
                    _value = value3.join('|');
                }

                if (key3 === 'params') {
                    _value = _.map(value3, (vValue, vKey) => `${vKey}^${vValue}`).join(',');
                }

                if (key3 === 'attributes') {
                    _value = JSON.stringify(value3);
                }

                attrs[key3] = _value;
            });

            const sortedAttrs = {};
            _.forEach(_.sortBy(_.keys(attrs), key => attrNames.indexOf(key)), sortedKey => {
                sortedAttrs[sortedKey] = attrs[sortedKey];
            });

            return {
                name: menu.data.type,
                attrs: sortedAttrs,
                children: _.map(menu.children, childMenu => this.menuDataToXml(childMenu))
            };
        },
        uploadXml($event) {
            const value = $event.target.value;
            if (value.substring(value.lastIndexOf('.') + 1) !== 'xml') {
                this.ubicus.base.lib.notify('upload file must be xml', 'danger');
                return;
            }

            const formData = new FormData($event.target.form);// Supported in IE10, https://github.com/malsup/form/
            $event.target.value = '';
            this.innerAjax({
                url: `/import`,
                processData: false,
                contentType: false,
                data: formData,
                type: 'POST',
                success: (resp) => {
                    this.reloadMenuManageInfo();
                }
            });
        },
        importXml() {
            this.$refs.fileUploadField.click();
        },
        makeSitemenuXml() {
            const applicationList = _.flatten(_.map(this.jsTreeData, applicationMenuList => _.cloneDeep(applicationMenuList)));
            const sitemenu = {
                id: '#',
                data: {
                    type: 'sitemenu',
                    id: this.rootMenuId,
                    name: `${this.rootMenuId}-sitemenu`
                },
                children: this.getNestedChildren(applicationList,'#')
            }

            return this.jsonToXml([this.menuDataToXml(sitemenu)], {xmlHeader: true, escape: true}).replace(/attributes="{(.*?)}"/g, 'attributes=\'{$1}\'');
        },
        getNestedChildren(arr, parent) {
            const out = []
            for(let i in arr) {
                if (Object.prototype.hasOwnProperty.call(arr, i)){
                    if(arr[i].parent === parent) {
                        const children = this.getNestedChildren(arr, arr[i].id)
                        if(children.length) {
                            arr[i].children = children
                        }
                        out.push(arr[i])
                    }
                }
            }
            return out
        },

        saveSitemenu() {
            this.innerAjax({
                url: `/save`,
                data: 'xml=' + encodeURIComponent(this.makeSitemenuXml()),
                type: 'post',
                success: resp => {
                    this.ubicus.base.lib.notify('메뉴가 저장되었습니다.');
                    this.reloadMenuManageInfo();
                }
            });
        },
        getRoleByCode(code) {
            const filteredRoles = this.sitemenuRoles.filter(sitemenuRole => sitemenuRole.code === code);

            if (filteredRoles.length > 0) {
                return filteredRoles[0];
            }

            return undefined;
        },
        setMenuItem(menu) {
            const _menu = _.extend({}, this.defaultMenuInfo, menu);
            this.menuPaths = !_.isEmpty(_menu.paths) ? _.map(_menu.paths, path => {
                const pathInfo = path.split('^');
                const method = pathInfo.length > 1 ? pathInfo[0] : 'GET';
                const pathStr = pathInfo.length > 1 ? pathInfo[1] : pathInfo[0];
                const roles = pathInfo.length === 3 ? _.map(pathInfo[2].split('|'), roleCode => this.getRoleByCode(roleCode)) : [];

                return {method: method, roles: roles, path: pathStr};
            }) : [{
                method: 'GET',
                roles: [],
                path: ''
            }];
            this.menuParams = !_.isEmpty(_menu.params) ? _.map(_menu.params, (value, key) => ({key: key, value: value})) : [{key: '', value: ''}];

            this.menu = _menu;
        },
        addMenuPaths(index) {
            if (index < this.menuPaths.length - 1) {
                this.menuPaths.splice(index, 1);
            } else {
                this.menuPaths.push({
                    method: 'GET',
                    roles: [],
                    path: ''
                });
            }
        },
        addMenuParams(index) {
            if (index < this.menuParams.length - 1) {
                this.menuParams.splice(index, 1);
            } else {
                this.menuParams.push({
                    key: '', value: ''
                });
            }
        },
        reloadMenuManageInfo() {
            this.activeApplicationMenuId = undefined;

            this.innerAjax({
                url: `/reloadMenuManageInfo`,
                success: (resp) => {
                    if (resp) {
                        this.jsTreeData = resp.jsTreeData;
                        this.applicationMenuList = resp.applicationMenuList;
                        this.rootMenuId = resp.rootMenuId;

                        this.activeApplicationMenuId = this.applicationMenuList[0].id;
                    }
                }
            });
        },
        addApplication() {
            this.application.rid = this.rootMenuId;

            this.innerAjax({
                url: `/addApplication`,
                type: 'POST',
                data: this.application,
                success: (resp) => {
                    if (resp['affected'] > 0) {
                        this.reloadMenuManageInfo();

                        this.application.rid = '';
                        this.application.id = '';
                        this.application.name = '';
                    } else {
                        this.ubicus.base.lib.notify('sitemenu reload fail..', 'danger');
                    }

                    this.dialog = false;
                }
            });
        },
        deleteRole(arr, item){
            const idx = arr.findIndex(inner=>{
                return inner.code === item.code
            });

            if(idx > -1){
                arr.splice(idx,1)
            }
        },
        copyRoles(targetRoles) {
            if (_.isEmpty(targetRoles)) {
                this.ubicus.base.lib.notify('설정된 값이 없습니다.', 'warning');
                return;
            }

            const copyText = document.querySelector('#output');
            copyText.textContent = JSON.stringify(targetRoles);
            copyText.select();
            if (document.execCommand('copy')) {
                this.ubicus.base.lib.notify('복사되었습니다.');
            }
        },
        pasteRoles(type, target) {
            const pasteText = document.querySelector('#output');

            if (_.isEmpty(pasteText.textContent)) {
                this.ubicus.base.lib.notify('설정된 값이 없습니다.', 'warning');
                return;
            }

            pasteText.focus();
            document.execCommand('paste');

            if (type === 'pathRoles') {
                this.menuRoles = JSON.parse(pasteText.textContent);
            }

            if (type === 'pathsRoles') {
                target.roles = JSON.parse(pasteText.textContent);
            }
        },
        getParents(){
            const parents = [node, ...node.parents.map(id => {
                return {
                    id: id,
                    text: this.jsTree.get_node(id).text
                };
            })].filter(item => item.text).reverse();
            return parents;
        },
        getPath(node) {
            const nodePath = '<i class="text-primary">' + node.text + '</i>';
            if (node.parent === '#') {
                return nodePath;
            } else {
                const prePath = this.jsTree.get_path(node.parent, ' > ');
                return '<i>' + prePath + '</i>' + '<i class="text-danger"> > </i>' + nodePath;
            }
        },
        getShortUuid() {
            const _s4 = function() {
                return ((1+Math.random()) * 0x10000 | 0).toString(16).substring(1);
            } ;
            return _s4()+_s4()+_s4();
        },
        jsonToXml(obj,options){
            const element_start_char =
                "a-zA-Z_\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FFF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD";
            const element_non_start_char = "\-.0-9\u00B7\u0300-\u036F\u203F\u2040";
            const element_replace = new RegExp("^([^" + element_start_char + "])|^((x|X)(m|M)(l|L))|([^" + element_start_char + element_non_start_char + "])", "g");
            const not_safe_in_xml = /[^\x09\x0A\x0D\x20-\xFF\x85\xA0-\uD7FF\uE000-\uFDCF\uFDE0-\uFFFD]/gm;

            function process_to_xml(node_data,options){
                const makeNode = function(name, content, attributes, level, hasSubNodes) {
                    const indent_value = options.indent !== undefined ? options.indent : "\t";
                    const indent = options['prettyPrint'] ? '\n' + new Array(level).join(indent_value) : '';
                    if(options['removeIllegalNameCharacters']) {
                        name = name.replace(element_replace, '_');
                    }

                    const node = [indent, '<',name, (attributes || '')];
                    if(content && content.length > 0 || options.html) {
                        node.push('>')
                        node.push(content);
                        hasSubNodes && node.push(indent);
                        node.push('</');
                        node.push(name);
                        node.push('>');
                    } else {
                        node.push('/>');
                    }
                    return node.join('');
                };

                return (function fn(node_data,node_descriptor, level){
                    let type = typeof node_data;
                    if((Array.isArray) ? Array.isArray(node_data) : node_data instanceof Array) {
                        type = 'array';
                    } else if(node_data instanceof Date) {
                        type = 'date';
                    }

                    switch(type) {
                        case 'array':
                            const ret = [];
                            node_data.map(function(v){
                                ret.push(fn(v,1, level+1));
                            });
                            options['prettyPrint'] && ret.push('\n');
                            return ret.join('');
                        case 'date':
                            return node_data.toJSON?node_data.toJSON():node_data+'';
                        case 'object':
                            if(node_descriptor === 1 && node_data.name){
                                const content = [];
                                const attributes = [];

                                if(node_data.attrs) {
                                    if(typeof node_data.attrs != 'object') {
                                        // attrs is a string, etc. - just use it as an attribute
                                        attributes.push(' ');
                                        attributes.push(node_data.attrs);
                                    } else {
                                        for(let key in node_data.attrs){
                                            if(Object.prototype.hasOwnProperty.call(node_data.attrs, key)){
                                                const value = node_data.attrs[key];
                                                attributes.push(' ');
                                                attributes.push(key);
                                                attributes.push('="')
                                                attributes.push(options.escape ? esc(value) : value);
                                                attributes.push('"');
                                            }
                                        }
                                    }
                                }

                                if(typeof node_data.value != 'undefined') {
                                    let c = ''+node_data.value;
                                    content.push(options.escape && !node_data['noescape'] ? esc(c) : c);
                                } else if(typeof node_data.text != 'undefined') {
                                    let c = ''+node_data.text;
                                    content.push(options.escape && !node_data['noescape'] ? esc(c) : c);
                                }

                                if(node_data.children){
                                    content.push(fn(node_data.children,0,level+1));
                                }

                                return makeNode(node_data.name, content.join(''), attributes.join(''),level,!!node_data.children);
                            } else {
                                const nodes = [];
                                for(let name in node_data){
                                    if(Object.prototype.hasOwnProperty.call(node_data, name)){
                                        nodes.push(makeNode(name, fn(node_data[name],0,level+1),null,level+1));
                                    }

                                }
                                options['prettyPrint'] && nodes.length > 0 && nodes.push('\n');
                                return nodes.join('');
                            }
                        case 'function':
                            return node_data();
                        default:
                            return options.escape ? esc(node_data) : ''+node_data;
                    }

                }(node_data, 0, 0))
            }

            function getXmlHeader(standalone) {
                const ret = ['<?xml version="1.0" encoding="utf-8"'];

                if(standalone) {
                    ret.push(' standalone="yes"');
                }

                ret.push('?>');

                return ret.join('');
            }

            function convert(obj,options){

                var Buf = typeof Buffer !== 'undefined' ? Buffer : function Buffer () {};

                if(typeof obj == 'string' || obj instanceof Buf) {
                    try{
                        obj = JSON.parse(obj.toString());
                    } catch(e){
                        return false;
                    }
                }

                let xmlHeader = '';
                let docType = '';
                if(options) {
                    if(typeof options == 'object') {
                        if(options.xmlHeader) {
                            xmlHeader = getXmlHeader(!!options.xmlHeader.standalone);
                        }

                        if(typeof options['docType'] != 'undefined') {
                            docType = '<!DOCTYPE '+options['docType']+'>'
                        }
                    } else {
                        xmlHeader = getXmlHeader();
                    }
                }
                options = options || {}

                const ret = [
                    xmlHeader,
                    (options['prettyPrint'] && docType ? '\n' : ''),
                    docType,
                    process_to_xml(obj,options)
                ];

                return ret.join('');
            }

            function esc(str){
                return (''+str).replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/'/g, '&apos;')
                    .replace(/"/g, '&quot;')
                    .replace(not_safe_in_xml, '');
            }

            function cdata(str){
                if(str) return "<![CDATA["+str.replace(/]]>/g,'')+']]>';
                return "<![CDATA[]]>";
            }

            return convert(obj, options);
        }
    },
    watch: {
        'activeApplicationMenuId': {
            handler(id) {
                if (id) {
                    this.loadJsTree();
                }
            }
        },
        'menuPaths': {
            handler(paths) {
                this.menu.paths = _.filter(_.map(paths, path => {
                    if (path.path) {
                        return _.filter([path.method, path.path, _.isEmpty(path.roles) ? undefined : _.map(path.roles, role => role.code).join('|')], item => !_.isEmpty(item)).join('^');
                    }
                }), item => !_.isEmpty(item));
            },
            deep: true
        },
        'menuParams': {
            handler(params) {
                const _params = {};
                _.forEach(params, param => {
                    if (param.key) {
                        _.extend(_params, {[param.key]: param.value});
                    }
                });
                this.menu.params = _params;
            },
            deep: true
        },
        'menu': {
            handler(menu) {
                const menuInfo = _.head(_.filter(this.getMenuList(), item => item.id === menu.id));
                if (menuInfo) {
                    menuInfo.data = menu;
                }

                if (menu.id) {
                    this.jsTree.get_node(menu.id).data = menu;
                }
            },
            deep: true
        }
    }
};

export default UbBaseMenu;
