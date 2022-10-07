/**
 * vue 는 vue 전용 공통 함수를 작성한다.
 *
 * */

(function (Vue) {
    Vue.prototype.moment = moment;   //vue에서 {{moment()}} 처럼 사용하기 위해
    Vue.prototype.ubicus = ubicus;   //vue에서 ubicus를 전역으로 접근하기 위해
    Vue.prototype.xAjax = xAjax;
    Vue.prototype.xAjaxJson = xAjaxJson;
    Vue.prototype.xAjaxMultipart = xAjaxMultipart;
    Vue.prototype._ = _;

    Vue.prototype.$settings = {
        requestMapping: '/api/v1',
        datatable: {
            rows2: "90px",
            rows5: "202px",
            rows6: "234px",
            rows10: "362px",
            rows15: "522px",
            rows20: "682px",
            footer2: {
                showFirstLastPage: true,
                firstIcon: 'mdi-arrow-collapse-left',
                lastIcon: 'mdi-arrow-collapse-right',
                prevIcon: 'mdi-minus',
                nextIcon: 'mdi-plus',
                itemsPerPageOptions: [2, 10, 50]
            },
            footer5: {
                showFirstLastPage: true,
                firstIcon: 'mdi-arrow-collapse-left',
                lastIcon: 'mdi-arrow-collapse-right',
                prevIcon: 'mdi-minus',
                nextIcon: 'mdi-plus',
                itemsPerPageOptions: [5, 25, 100]
            },
            footer6: {
                showFirstLastPage: true,
                firstIcon: 'mdi-arrow-collapse-left',
                lastIcon: 'mdi-arrow-collapse-right',
                prevIcon: 'mdi-minus',
                nextIcon: 'mdi-plus',
                itemsPerPageOptions: [6, 25, 100]
            },
            footer10: {
                showFirstLastPage: true,
                firstIcon: 'mdi-arrow-collapse-left',
                lastIcon: 'mdi-arrow-collapse-right',
                prevIcon: 'mdi-minus',
                nextIcon: 'mdi-plus',
                itemsPerPageOptions: [10, 50, 100]
            },
            footer15: {
                showFirstLastPage: true,
                firstIcon: 'mdi-arrow-collapse-left',
                lastIcon: 'mdi-arrow-collapse-right',
                prevIcon: 'mdi-minus',
                nextIcon: 'mdi-plus',
                itemsPerPageOptions: [15, 50, 100]
            },
            footer20: {
                showFirstLastPage: true,
                firstIcon: 'mdi-arrow-collapse-left',
                lastIcon: 'mdi-arrow-collapse-right',
                prevIcon: 'mdi-minus',
                nextIcon: 'mdi-plus',
                itemsPerPageOptions: [20, 50, 100]
            },
            getItemsPerPageOptions: ((min = 5, max = 100, step = 5,) => (Array(Math.floor((max - min) / step) + 1).fill(min).map(((x, i) => (x + i * step)),)))
        }
    }

    Vue.filter("comma", val =>{
        let str = String(val).split(".");
        str[0] = str[0].replace(/,/g,'')
        str[0] = str[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return str.join(".");

        // return String(val).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    })

    /*Vue.filter('comma', {
      // model -> view  formats the value when updating the input element.
        read: function(val) {
            return String(val).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        },
        // view -> model    // formats the value when writing to the data.

        write: function(val, oldVal) {
            return String(val).replace(/,/g, "");
        }
    });*/

    Vue.component('ub-button', {
        template: `
            <v-tooltip left v-if="mode === 'search'">
                <template v-slot:activator="{ on, attrs }">
                    <v-btn :color="color" v-bind="attrs" v-on="on" @click="clickEvent" class="ml-1" :class="className"
                           :disabled="disabled" :loading="loading">
                        <v-icon>{{icon}}</v-icon>
                    </v-btn>
                </template>
                <span><slot>{{label}}</slot></span>
            </v-tooltip>
            <v-tooltip left v-else-if="mode === 'label'">
                <template v-slot:activator="{ on, attrs }">
                    <v-btn :color="color" v-bind="attrs" v-on="on" @click="clickEvent" class="ml-1" :class="className" outlined small text
                           :disabled="disabled" :loading="loading">
                        <v-icon>{{icon}} mdi-18px</v-icon>
                        {{label}}
                    </v-btn>
                </template>
                <span><slot>{{label}}</slot></span>
            </v-tooltip>
            <v-tooltip left v-else-if="mode === 'icon'">
                <template v-slot:activator="{ on, attrs }">
                    <v-icon :color="color" v-bind="attrs" v-on="on" @click="clickEvent" small :disabled="disabled" :class="className">{{!loading ? icon : 'mdi-cached mdi-spin'}} mdi-18px</v-icon>
                </template>
                <span><slot>{{label}}</slot></span>
            </v-tooltip>
            <v-btn v-else-if="mode === 'text'" :color="color" @click="clickEvent" outlined raised text :class="className" :disabled="disabled">
                <v-icon>{{!loading ? icon : 'mdi-cached mdi-spin'}} mdi-18px</v-icon>
                <slot>{{label}}</slot>
            </v-btn>
        `,
        props: {
            mode: {
                type: String,
                default: 'search'
            },
            disabled: {
                type: Boolean,
                default: false,
            },
            loading: {
                type: Boolean,
                default: false,
            },
            className: String,
            label: String,
            color: String,
            click: Function,
            icon: String
        },
        methods: {
            clickEvent(event) {
                this.$emit("click", event);
            }
        }
    });

    Vue.component('ub-search', {
        template: `
            <v-form class="search-form">
                <v-container :class="classes">
                    <v-row class="ubcs-search-div">
                        <slot></slot>
                    </v-row>
                    <slot name="extends"></slot>
                </v-container>
            </v-form>
        `,
        props: {
            classes: {
                type: Array,
                default: () => []
            }
        }
    });

    Vue.component('ub-date-range-picker', {
        template: `
            <div :class="classes">
                <v-md-date-range-picker
                        :label="label"
                        :max-year="maxYear"
                        :min-year="minYear"
                        show-year-select
                        v-model="dModel"
                        :presets="presets"
                        :type="type"
                        language="ko"
                        show-total-range-label
                        :custom-locale="locale"
                >
                    <template v-slot:picker-input="{label, value}">
                        <slot name="input" v-bind:label="label" v-bind:value="value">
                            <template v-if="shape === 'underline'">
                                <v-text-field :label="label" v-model="value"></v-text-field>
                            </template>
                            <template v-else>
                                <v-text-field :label="label" v-model="value" outlined dense hide-details></v-text-field>
                            </template>
                        </slot>
                    </template>
                </v-md-date-range-picker>
            </div>
        `,

        props: {
            classes: {
                type: Array,
                default: () => []
            },
            type: {
                type: String,
                default: "calendar"
            },
            format: {
                type: String,
                default: "date"
            },
            start: {
                type: String    //2020-01-01
            },
            end: {
                type: String    //2020-01-02
            },
            minYear: {
                type: String,
                default: '2010'
            },
            maxYear: {
                type: String,
                default: '2030'
            },
            label: {
                type: String,
                default: "기간"
            },
            shape: {
                type: String,
                default: 'outlined'
            },
            presets: {
                type: Object,
                default: function () {
                    return {
                        calendar: [
                            {
                                label: '오늘',
                                range: ubicus.base.util.getDateRange(0, 0),
                            },
                            {
                                label: '어제',
                                range: ubicus.base.util.getDateRange(1, 1),
                            },
                            {
                                label: '지난 7일',
                                range: ubicus.base.util.getDateRange(6, 0),
                            },
                            {
                                label: '지난 30일',
                                range: ubicus.base.util.getDateRange(29, 0),
                            },
                            {
                                label: '이번달',
                                range: ubicus.base.util.getDateRange(0, 0, 'month'),
                            },
                            {
                                label: '지난달',
                                range: ubicus.base.util.getDateRange(1, 1, 'month'),
                            }
                        ],
                        month: [
                            {
                                label: '이번달',
                                range: ubicus.base.util.getDateRange(0, 0, 'month'),
                            },
                            {
                                label: '지난달',
                                range: ubicus.base.util.getDateRange(1, 1, 'month'),
                            },
                            {
                                label: '올해',
                                range: ubicus.base.util.getDateRange(0, 0, 'year'),
                            },
                            {
                                label: '작년',
                                range: ubicus.base.util.getDateRange(1, 1, 'year'),
                            }
                        ]
                    };
                }
            }
        },
        data: function () {
            return {
                dModel: {
                    start: null,
                    end: null
                },
                locale: {
                    customRangeLabel: '직접선택',
                    totalRangeLabel: '전체',
                    format: 'YYYY-MM-DD'
                }
            }
        },
        created() {
            const start = this.start || moment({year: this.minYear}).startOf('year').format(this.locale.format)
            const end = this.end || moment({year: this.maxYear}).endOf('year').format(this.locale.format)

            Object.assign(this.dModel, {
                start: start,
                end: end
            });

            if(this.format === 'datetime'){
                this.$emit("update:start", moment(start, this.locale.format).format('YYYY-MM-DD 00:00:00'));
                this.$emit("update:end", moment(end,this.locale.format).format('YYYY-MM-DD 23:59:59'));
            }
        },
        watch: {
            "dModel": {
                handler: function (data) {
                    if(this.format === 'datetime'){
                        this.$emit("update:start", moment(data.start).format('YYYY-MM-DD 00:00:00'));
                        this.$emit("update:end", moment(data.end).format('YYYY-MM-DD 23:59:59'));
                    }else{
                        this.$emit("update:start", moment(data.start).format(this.locale.format));
                        this.$emit("update:end", moment(data.end).format(this.locale.format));
                    }
                },
                deep: true
            },
            "start":{
                handler: function (date) {
                    this.$nextTick(()=>{
                        this.dModel.start = moment(date, this.locale.format).toDate();
                        if(this.format === 'datetime'){
                            this.$emit("update:start", moment(date).format('YYYY-MM-DD 00:00:00'));
                        }else{
                            this.$emit("update:start", date);
                        }
                    });
                }
            },
            "end":{
                handler: function (date) {
                    this.$nextTick(()=>{
                        this.dModel.end = moment(date, this.locale.format).toDate();
                        if(this.format === 'datetime'){
                            this.$emit("update:end", moment(date).format('YYYY-MM-DD 23:59:59'));
                        }else{
                            this.$emit("update:end", date);
                        }
                    });
                }
            }
        }
    });

    Vue.component('ub-date-picker', {
        template: `
            <div>
                <v-menu max-width="290px" min-width="auto" transition="scale-transition" offset-y ref="menu" v-model="menu"
                    :close-on-content-click="!confirm"
                >
                    <template v-slot:activator="{ on, attrs }">
                        <template v-if="shape === 'underline'">
                            <v-text-field v-model.sync="text" :label="label" :readonly="readonly" v-bind="attrs" v-on="on" @change="apply"></v-text-field>
                        </template>
                        <template v-else>
                            <v-text-field v-model.sync="text" :label="label" :readonly="readonly" v-bind="attrs" v-on="on" @change="apply" outlined dense hide-details></v-text-field>
                        </template>
                    </template>
                    <template v-if="type==='range'">
                        <v-date-picker v-model.sync="dModel" :locale="locale" no-title scrollable range>
                            <template v-if="confirm">
                                <v-spacer></v-spacer>
                                <v-btn text color="primary" @click="cancel()">Cancel</v-btn>
                                <v-btn text color="primary" @click="apply(dModel)">OK</v-btn>
                            </template>                      
                        </v-date-picker>
                    </template>
                    <template v-else>
                        <v-date-picker v-model.sync="dModel" :locale="locale" no-title scrollable :type="type">
                            <template v-if="confirm">
                                <v-spacer></v-spacer>
                                <v-btn text color="primary" @click="cancel()">Cancel</v-btn>
                                <v-btn text color="primary" @click="apply(dModel)">OK</v-btn>
                            </template>                      
                        </v-date-picker>
                    </template>
                </v-menu>
            </div>
        `,
        props: {
            label: String,
            locale: {
                type: String,
                default: 'ko-kr'
            },
            type: {
                type: String,
                default: 'date'
            },
            value: {
                type: String,
                default: function(){
                    if(this.type === 'date'){
                        return moment().format('YYYY-MM-DD');
                    }else if(this.type === 'month'){
                        return moment().format('YYYY-MM');
                    }else if(this.type === 'range'){
                        return moment().format('YYYY-MM-DD') +' ~ '+ moment().format('YYYY-MM-DD');
                    }
                }
            },
            readonly: {
                type: Boolean,
                default: false
            },
            confirm: {
                type: Boolean,
                default: true
            },
            shape: {
                type: String,
                default: 'outlined'
            },
        },
        data: function () {
            return {
                menu: false,
                dModel: undefined,
                text: undefined
            }
        },
        mounted() {
            this.reset();
        },
        watch: {
            "dModel": {
                handler: function (data) {
                    if(!this.confirm){
                        this.apply(data);
                    }
                },
                deep: true
            }
        },
        methods: {
            reset(){
                this.text = this.value;
                if(this.type === 'range'){
                    this.dModel = this.value.split(' ~ ');//array 필요
                }else{
                    this.dModel = this.value;
                }
            },
            cancel(){
                this.reset();
                this.menu = false;
            },
            apply(data){
                if(this.type === 'range'){
                    if(typeof data === 'string'){
                        data = data.split(' ~ ');
                    }

                    this.dModel = data.sort();//반대 클릭시 시작 종료 정렬
                    this.text = this.dModel.join(' ~ ');
                }else {
                    this.dModel = data;
                    this.text = data;
                }

                if(!this.validateDate(data)){
                    return this.reset();
                }

                this.$emit("input", this.text); //value update
                this.menu = false;
            },
            validateDate(date){
                if(typeof date === 'string'){
                    return moment(date).isValid();
                }else{//array range
                    const dataLen = date.length;
                    if(dataLen !== 2){
                        return false;
                    }

                    for(let i = 0; i < dataLen; i++){
                        if(!moment(date[i]).isValid()){
                            return false;
                        }
                    }

                    return true;
                }
            }
        }
    })



    Vue.component('ub-view', {
        template: `
            <div v-if="dView.mode === 'sheet'">
                <v-sheet v-if="dView.show" :outlined="dView.outlined">
                    <slot name="head" v-bind:edit="dView.edit"></slot>
                    <slot name="body" v-bind:edit="dView.edit"></slot>
                    <v-card-actions>
                        <slot name="control.prepend" v-bind:edit="dView.edit"></slot>
                        <v-spacer></v-spacer>
                        <slot name="control" v-bind:edit="dView.edit"></slot>
                    </v-card-actions>
                </v-sheet>
            </div>
            <div v-else-if="dView.mode === 'dialog'">
                <v-dialog v-model="dView.show" :max-width="dView.width" scrollable @keydown.esc="closeDialog()"
                          @click:outside="closeDialog()" overlay-color="#fff">
                    <v-card>
                        <v-card-title>
                            <span class="headline">{{dView.title}}</span>
                            <v-spacer></v-spacer>
                            <v-btn icon @click="closeDialog()">
                                <v-icon>mdi-close</v-icon>
                            </v-btn>
                        </v-card-title>
                        <v-card-text>
                            <slot name="head" v-bind:edit="dView.edit"></slot>
                            <slot name="body" v-bind:edit="dView.edit"></slot>
                        </v-card-text>
                        <v-card-actions>
                            <slot name="control.prepend" v-bind:edit="dView.edit"></slot>
                            <v-spacer></v-spacer>
                            <slot name="control" v-bind:edit="dView.edit"></slot>
                            <slot name="close" v-bind:edit="dView.edit">
                                <v-btn color="secondary" text @click="closeDialog()" outlined raised>
                                    <v-icon>mdi-close mdi-18px</v-icon>
                                    닫기
                                </v-btn>
                            </slot>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
            </div>
        `,
        props: {
            view: Object
        },
        data: function () {
            return {
                dView: Object.assign({
                    mode: 'sheet',  //  sheet || dialog
                    show: false,
                    edit: false,
                    width: '600px',
                    title: '제목',
                    outlined: false
                }, this.view)
            }
        },
        watch: {
            "view": {
                handler: function (view) {
                    Object.assign(this.dView, view);
                },
                deep: true
            }
        },
        methods: {
            closeDialog() {
                this.dView.show = false;
                this.$emit("update:view", this.dView);
            }
        }
    });

    Vue.component('ub-dialog', {
        template:`
            <v-dialog v-model="dialog.visible" :width="dialog.width||1024" scrollable :persistent="persistent" overlay-color="#fff"
                  @keydown.esc="onClickEsc" 
                  @click:outside="onClickOutside">
                <v-card>
                    <v-card-title class="headline lighten-2">{{ dialog.title }}<v-spacer></v-spacer>
                        <v-btn icon @click="dialog.close()"><v-icon>mdi-close</v-icon></v-btn>
                    </v-card-title>
                    <v-card-text v-if="dialog.visible" >
                        <component ref="dialog-component" :is="dialog.component" v-bind.sync="dialog.props" @close="dialog.close()"></component>
                    </v-card-text>
                    <v-card-actions>
                        <template v-if="dialog.actions && dialog.actions.left">
                            <v-btn v-for="(item, index) in dialog.actions.left" :key="item.name+index" :color="item.color" text @click="invokeComponentMethod(item)" outlined raised>{{item.name}}</v-btn>
                        </template>
                        <v-spacer></v-spacer>
                        <template v-if="dialog.actions && dialog.actions.right">
                            <v-btn v-for="(item, index) in dialog.actions.right" :key="item.name+index" :color="item.color" text @click="invokeComponentMethod(item)" outlined raised>{{item.name}}</v-btn>
                        </template>
                        <v-btn color="grey" text @click="dialog.close()" outlined raised>Close</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        `,
        props:{
            persistent: {
                type: Boolean,
                default: true
            },
            dialog: Object
            /*
            {
                title: '플랫폼 관리',
                width: 1024
                visible: false,
                reload: true,
                component: MpAdvertiserPlatform,
                props: {advertiser: {}},
                close: () => {this.dialog.platform.visible = false;},
                actions:{
                    left:[
                        {
                            name:'복사',
                            color: 'green',
                            method: 'callInner'
                        }
                    ],
                    right:[
                        {
                            name:'저장',
                            color: 'danger',
                            method: 'callInner'
                        }
                    ]
                }
            }
            */
        },
        methods: {
            onClickOutside() {
                if(!this.persistent){
                    this.dialog.close()
                }
            },
            onClickEsc(){
                this.dialog.close()
            },
            invokeComponentMethod(btn){
                if (typeof this.$refs['dialog-component'][btn.method] === 'function'){
                    this.$refs['dialog-component'][btn.method](this.dialog)
                }else{
                    let msg = this.dialog.component.name+' component 의 ' +btn.method+' 가 정의되지 않았거나 Function 이 아닙니다.';
                    this.ubicus.base.lib.notify({message: msg, type:'error'})
                }
            }
        }
    });

    Vue.component('ub-boolean-yn', {
        template: `
            <span v-if="mode === 'chip'">
                <v-chip color="green" v-if="value === 'Y'" small>사용</v-chip>
                <v-chip color="gray" v-else small>미사용</v-chip>
            </span>
            <span v-else-if="mode === 'boolean'">
                <v-chip color="green" v-if="value === 'true'" small>예</v-chip>
                <v-chip color="gray" v-else small>아니오</v-chip>
            </span>
            <span v-else>
                <span v-if="value === 'Y'">Y</span>
                <span v-else>X</span>
            </span>
        `,
        props: {
            value: String,
            mode: {
                type: String,
                default: 'chip'
            }
        }
    });

    Vue.component('ub-number-field', {
        template: `
            <v-text-field :label="label" :value="value | comma" @input="val => this.$emit('update:value',val)" :rules="ubicus.base.rule.required" class="ub-number-field"></v-text-field>
        `,
        props: {
            label: String,
            value: String|Number,
        }
    });

    //form 내에 인풋이 한개 밖에 없는 경우 enter를 누르면 자동 form submit이 발생하는 걸 막기 위해 빈 인풋을 추가
    Vue.component('ub-prevent-submit-input', {
        template: `<input type="text" style="position:absolute;width:0 !important;height:0 !important;line-height: 0 !important;"/>`,
    });
})(window.Vue);


(function (ubicus) {
    window.ubicus = ubicus;
    ubicus.base = ubicus.base || {};

    const menuToRoutes = (menu, routes) => {
        if (menu.children && menu.children.length > 0) {
            menu.children.forEach(childMenu => {
                menuToRoutes(childMenu, routes);
            });
        } else {
            if (menu.path) {
                const name = menu.path.substring(menu.path.lastIndexOf('/') + 1);
                routes.push({
                    name: name,
                    label: menu.name,
                    path: menu.path,
                    component: () => import(`/static/apps/views${menu.path}.js`),
                    meta: {
                        title: menu.name,
                        menu: menu
                    }
                });
            }
        }
    };

    ubicus.base.vue = {
        getRoutesByMenu: function (menu) {
            const _routes = [];
            menuToRoutes(menu, _routes);
            return _routes;
        }
    };
})(window.ubicus || {});
