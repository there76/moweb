const baseHelper = Vuex.createNamespacedHelpers('base');

const crudMixIn = {
    data: () => ({
        url: '[crudMixIn] please set crud url',
        search: {},
        view: {
            mode: 'sheet',  //sheet || dialog
            title: '[crudMixIn] please set view title',
            show: false,
            edit: false
        },
        tbl: {
            headers: [],
            items: [],
            total: 10,
            options: {}
        },
        form: {
            init: {},
            data: {},
            valid: false
        },
        loading: {
            show: false
        }
    }),
    computed: {
        ...baseHelper.mapGetters([
            'getUser'
        ])
    },
    watch: {
        'tbl.options': {
            handler: 'fetchData',
            deep: true
        }
    },
    methods: {
        getQueryString() {
            return this.ubicus.base.util.dataTablesParam(this.tbl.options, this.search, []);
        },
        onCrudMixInActions(actionName, data, options) {
            return true;
        },
        fetchData(isSearchFirst) {
            if (this.tbl.paging !== 'client' && isSearchFirst === true) {//1페이지 조회
                this.ubicus.base.util.dataTablesReset(this.tbl.options);
                return Promise.resolve({})
            }

            return this.xAjax({
                url: this.url,
                method: 'GET',
                data: this.getQueryString()
            }).then(resp => {
                this.onCrudMixInActions('beforeFetchData', resp);
                this.view.show = false;
                this.tbl.items = resp.data;
                this.tbl.total = resp.recordsTotal;
                this.onCrudMixInActions('fetchData', resp);
                return Promise.resolve(resp)
            });
        },
        excelData() {
            this.ubicus.base.lib.download({
                url: `${this.$settings.requestMapping}${this.url}/excel`,
                method: 'GET',
                data: this.getQueryString()
            });
        },
        selectItem(item, row) {
            this.onCrudMixInActions('beforeSelectItem', item, {});
            this.form.data = Object.assign({}, this._.cloneDeep(this.form.init), item);
            this.view.edit = true;
            this.view.show = true;
            this.onCrudMixInActions('selectItem', item, {});
            row.select(true);
        },
        newItem() {
            this.onCrudMixInActions('newItem');
            this.view.edit = false;
            this.view.show = true;
            this.resetItem();
        },
        saveItem(method) {  //method: POST || PATCH
            if (method === undefined) {
                throw Error('method is required.')
            }

            //form validation <v-form ref="form" v-model="form.valid">
            if (!this.form.valid && this.$refs.form !== undefined) {
                return this.$refs.form.validate();//form validation 수행하여 화면에 에러 메시지 표시
            }

            const data = this.ubicus.base.util.deepCopy(this.form.data)
            if(this.onCrudMixInActions('beforeSaveItem', data, {method: method, data: this.form.data}) === false){
                return;
            }

            this.loading.show = true;
            this.xAjaxJson({
                url: this.url,
                method: method,
                data: data
            }).then((resp) => {
                if(this.onCrudMixInActions('saveItem', resp,  {method: method, data: this.form.data}) === false){
                    return; //아래 행위는 직접 처리 해야함
                }
                this.ubicus.base.lib.notify(resp);
                this.fetchData(method === 'POST');
            }).finally(() => {
                this.loading.show = false;
            });
        },
        deleteItem(item, name) {
            let _name = name || item['name'];
            if (_name === undefined) {
                _name = '';
            } else {
                _name = '[' + _name + '] ';
            }

            if(this.onCrudMixInActions('beforeDeleteItem', item, {}) === false){
                return;
            }

            this.ubicus.base.lib.confirm(_name + '삭제 하시겠습니까?').then(result => {
                if (result.isConfirmed) {
                    this.xAjaxJson({
                        url: this.url +'/'+ item[this.pk],
                        method: 'DELETE',
                        data: this.form.data
                    }).then((resp) => {
                        if(this.onCrudMixInActions('deleteItem', resp, {}) === false){
                            return; //아래 행위는 직접 처리 해야함
                        }
                        this.ubicus.base.lib.notify(resp);
                        this.fetchData(false);
                    });
                }
            });
        },
        resetItem: function () {//입력폼 초기화
            this.form.data = Object.assign({}, this._.cloneDeep(this.form.init)); //init에 설정된 값으로 data를 모두 초기화
            if (this.$refs.form !== undefined) {
                this.$refs.form.resetValidation();  //form에 표시된 모든 error validation 표시를 제거
            }
            this.onCrudMixInActions('resetItem', this.form.data);
        },
        ...baseHelper.mapActions({
            $setOverlay: 'setOverlay'
        })
    }
}

export default crudMixIn;
