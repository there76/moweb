'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

/**
 * util은 해당 프로젝트가 아니여도 모든 프로젝트에서 사용할 수 있도록 공통 스크립트만 작성한다.
 *     - 화면내의 dom을 처리 하는 작업을 하지 않도록 한다.   (dom 조작은 ui를 사용)
 *     - util은 단독으로도 사용할 수있도록 선별하여 작성한다. (ui, lib, vue 등을 호출하지 말자)
 *
 * [문서화를 위한 주석 규칙은](http://yui.github.io/yuidoc/syntax/index.html)
 * */
(function (ubicus) {
    window.ubicus = ubicus;
    ubicus.base = ubicus.base || {};

    var KEYCODE = {
        ENTER: 13,
        ESCAPE: 27,
        ARROW_LEFT: 37,
        ARROW_UP: 38,
        ARROW_RIGHT: 39,
        ARROW_DOWN: 40,
        QUESTION: 191,
        CTRL: 17,
        ALT: 18,
        m: 77,
        k: 75
    };

    var self = ubicus.base.util = {
        KEYCODE: KEYCODE,

        /**
         * path에 포함된 pathVariables를 pathParams를 통해 binding한다.
         *
         * ubicus.base.util.bindPath('/base/{category1}/list/{category2}',{category1:'board',category2:'notice'});
         * =>  /base/board/list/notice
         *
         * @param {String} pathExpression 경로로 pathVariables를 포함할 수도 있다.
         * @param {Object} pathParams binding할 object
         *
         * @return pathVariable이 모두 바인딩된 경로
         * */
        bindPath: function bindPath(pathExpression, pathParams) {
            var path = pathExpression;
            if (!path.match(/^\//)) {
                path = '/' + path;
            }

            if (pathParams) {
                path = path.replace(/{([\w-]+)}/g, function (fullMatch, key) {
                    if (pathParams.hasOwnProperty(key)) {
                        return pathParams[key];
                    }
                });
            }

            return path;
        },

        /**
         * 해당 문자열이 값을 가지고 있는지 체크 한다. null, undefined, 공백 을 체크한다.
         * @param {String} str 문자열
         *
         * @return {Boolean} 값이 있는지 여부
         */
        hasText: function hasText(str) {
            return str !== undefined && str !== null && str.trim() !== '';
        },

        /**
         * camelCase를 snakeCase로 변경한다
         * TypeOfData.AlphaBeta => type_of_data_alpha_beta
         *
         * @param {String} s camelCase 문자열
         *
         * @returns {String} snake case로 변경된 문자열
         * */
        snakeCase: function snakeCase(s) {
            return s.replace(/\.?([A-Z]+)/g, function (x, y) {
                return "_" + y.toLowerCase();
            }).replace(/^_/, "");
        },

        /**
         * 문자열에 포함된 html tag를 제거 한다.
         *
         * @param {String} s html이 포함된 문자열
         *
         * @returns {String} html이 제거된 문자열
         * */
        stripHtml: function stripHtml(s) {
            return s.replace(/<[^>]*>?/gm, '');
        },

        /**
         * UUID 생성
         * e12dddb3-3265-461f-823a-d738d0f742be
         *
         * @returns {String} javascript uuid
         * */
        uuid: function uuid() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0,
                    v = c === 'x' ? r : r & 0x3 | 0x8;
                return v.toString(16);
            });
        },

        /**
         * @description 파일 사이즈를 읽기 좋게 표시해준다.
         *
         * 100 => 100 B
         * 10000 => 9.77 KB
         * 10000000 => 9.54 MB
         *
         * @param {Number} size 파일사이즈
         * @returns {String} 포맷된 파일 사이즈
         * */
        fileSize: function fileSize(size) {
            var i = Math.floor(Math.log(size) / Math.log(1024));
            return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
        },


        /**
         * @description     저장된 브라우저 cookie중 name에 해당하는 값을 가져온다.
         * @param  {string } key        가져올 쿠키의 key값
         * @return {string }            key에 해당하는 value값
         */
        getCookie: function getCookie(key) {
            var value = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
            return value ? value[2] : null;
        },

        /**
         * @description    브라우저 쿠키 세팅한다. value가 null 인경우는 쿠키를 삭제한다.
         * @param {string } key        저장할 쿠키 이름
         * @param {string||null } value        저장할 쿠키 값, null인경우 해당키 삭제
         * @param {Number } expireDays    만료일자
         */
        setCookie: function setCookie(key, value, expireDays) {
            var date = new Date();

            if (value !== null) {
                if (expireDays === undefined) {
                    expireDays = 7;
                }
                date.setTime(date.getTime() + expireDays * 60 * 60 * 24 * 1000);
                document.cookie = key + '=' + value + ';expires=' + date.toUTCString() + ';path=/';
            } else {
                document.cookie = key + "= " + "; expires=" + date.toUTCString() + "; path=/";
            }
        },

        setLocalStorage: function setLocalStorage(key, value) {
            var saveValue = value;
            if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object') {
                saveValue = JSON.stringify(value);
            }

            localStorage.setItem(key, saveValue);
        },
        getLocalStorage: function getLocalStorage(key) {
            var restoreValue = localStorage.getItem(key);
            if (restoreValue !== null) {
                try {
                    restoreValue = JSON.parse(restoreValue);
                } catch (e) {}
            }

            return restoreValue;
        },

        /**
         * @description    오늘 날짜 기준 특정 기간 추출(startDate, endDate)
         * @param {Number} startOffset 시작
         * @param {Number} endOffset 종료
         * @param {string} period day: '일', week: '주', month: '월', year: '년'
         */
        getDateRange: function getDateRange() {
            var startOffset = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
            var endOffset = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
            var period = arguments.length <= 2 || arguments[2] === undefined ? 'day' : arguments[2];

            return [moment().subtract(startOffset, period).startOf(period), moment().subtract(endOffset, period).endOf(period)];
        },


        getDateRangeFormat: function getDateRangeFormat(range) {
            return moment(range['start']).format('YYYY-MM-DD') + ' ~ ' + moment(range['end']).format('YYYY-MM-DD');
        },

        /**
         * @description fetchData 등에서 range에 들어 있는 date 객체를 날짜 검색을 하기위한 값으로 변경 후 searchObject에 넣어준다.
         *
         * @param {Object} searchObject 검색용 서치 객체
         * @param {String} rangeKeyName range: { start: Date, end: Date} 형태에서 range
         * @param {String} startFieldName searchObject에 넣을 fieldName
         * @param {String} endFieldName true면 뒤, false면 앞
         *
         */
        setDateRangeParam: function setDateRangeParam(searchObject, rangeKeyName, startFieldName, endFieldName) {
            var range = searchObject[rangeKeyName];
            if (range === undefined) {
                throw Error('[' + rangeKeyName + '] is not defined in searchObject');
            }

            searchObject[startFieldName] = moment(range['start']).format('YYYY-MM-DD 00:00:00');
            searchObject[endFieldName] = moment(range['end']).format('YYYY-MM-DD 23:59:59.999999');
        },

        /**
         * @description 전달된 value가 값을 가지고 있는지 체크 null, undefined, 공백인지를 체크 한다.
         *
         * @param {String} value 값
         * @returns {Boolean} 값이 있는지 여부
         */
        hasValue: function hasValue(value) {
            return !(value === null || value === undefined || value === '');
        },

        /**
         * @description array의 앞, 뒤를 지정해서 items를 추가한다.
         * @param {Array} src 원본 array
         * @param {Array} items 추가할 array
         * @param {Boolean} isAppend true면 뒤, false면 앞
         * @returns {Array} 합쳐진 하나의 array
         */
        concatArray: function concatArray(src, items, isAppend) {
            return isAppend ? src.concat(items) : items.concat(src);
        },

        /**
         * @description 전달된 object가 array인지 확인 한다.
         * @param {Object} obj array인지 확인할 Object
         * @returns {Boolean} array 인지 여부
         */
        isArray: function isArray(obj) {
            return Object.prototype.toString.call(obj) === "[object Array]";
        },

        /**
         * @description 전달된 object의 깊은 복사를 수행한다.
         * @param {Object} obj array인지 확인할 Object
         * @returns {Object} 깊은 복사된 obj 객체
         */
        deepCopy: function deepCopy(obj) {
            return JSON.parse(JSON.stringify(obj));
        },

        /**
         * @description 숫자 세자리마다 콤마(,) 금액
         * @param {string} str 숫자형 스트링
         * @returns {string} 소수점 포함 금액 포맷팅된 문자열
         */
        addComma: function addComma(str) {
            return Number(str).toLocaleString('en').split(".")[0];
        },


        /**
         * @description obj 의 값을 queryString 형태로 변경한다. $.param 과 동일한 기능
         *
         * @param {Object} obj queryString 형태로 변경할 Object
         * @param {String} prefix key앞에 붙일 prefix
         * @return {String} a=1&b=1 형태의 쿼리 스트링
         * */
        param: function param(obj, prefix) {
            //return $.param(obj)

            var str = [],
                p;
            for (p in obj) {
                if (obj.hasOwnProperty(p)) {
                    var k = prefix ? prefix + "[" + p + "]" : p;
                    var v = obj[p];
                    if (v === undefined) {
                        v = '';
                    }

                    str.push(v !== null && (typeof v === 'undefined' ? 'undefined' : _typeof(v)) === "object" ? self.param(v, k) : encodeURIComponent(k) + "=" + encodeURIComponent(v));
                }
            }
            return str.join("&");
        },


        /**
         * @description vuetify 의 v-data-table 사용 시 ajax전송에 필요한 queryString 정보를 만들때 사용한다.
         *
         * @param {Object} options v-data-table options.sync="options" 옵션과 연결된 options
         *      var {groupBy, groupDesc, itemsPerPage, multiSort, mustSort, page, sortBy, sortDesc} = options
         * @param {Object} data 해당 data-table에서 필요한 커스텀 데이터
         * @param {Array} excludeKeys data에서 제외시킬 필드이 름
         *      {custNo : 1}
         * */
        dataTablesParam: function dataTablesParam(options, data, excludeKeys) {
            var page = options.page ? options.page : 1;
            var size = options.itemsPerPage ? options.itemsPerPage : 5;
            var sortBy = options.sortBy ? options.sortBy : [];
            var sortDesc = options.sortDesc ? options.sortDesc : [];

            var query = '';
            query += 'pageType=dataTables&page=' + page + '&size=' + size;
            for (var i = 0, ic = sortBy.length; i < ic; i++) {
                query += '&sort=' + self.snakeCase(sortBy[i]) + ',' + (sortDesc[i] ? 'DESC' : 'ASC');
            }

            if (data) {
                query += '&' + $.param(data);
            }

            return query;
        },

        /**
         * @description vuetify 의 v-data-table 사용 시 options 정보를 리셋한다
         * @param {Object} options v-data-table options.sync="options" 옵션과 연결된 options
         * */
        dataTablesReset: function dataTablesReset(options) {
            Object.assign(options, {
                page: 1,
                sortBy: [],
                sortDesc: [],
                groupBy: [],
                groupDesc: []
            });
        },

        /**
         * @description roles 안에 arr에 해당하는 role이 있는지 검사한다.
         * @param {Array} roles 사용자의 roles
         * @param {Array||String} arr 검사하고자 하는 role
         * */
        hasAnyRole: function hasAnyRole(roles, arr) {
            var rolesMap = roles.reduce(function (map, obj) {
                map[obj] = true;
                return map;
            }, {});

            if (typeof arr === 'string') {
                return !!rolesMap[arr];
            } else {
                for (var i = 0, ic = arr.length; i < ic; i++) {
                    if (rolesMap[arr[i]] !== undefined) {
                        return true;
                    }
                }
            }

            return false;
        }
    };
})(window.ubicus || {});