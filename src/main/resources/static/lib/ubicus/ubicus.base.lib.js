/**
 * lib 은 third party library 등을 보다 쉽게 사용하기 위해 한단계 각 library를  wrapping 한다.
 * 1. 사내 개발 표준 구축
 * 2. 다른 library 로 변경 및 공통 기능 추가 대응
 *
 * [문서화를 위한 주석 규칙은](http://yui.github.io/yuidoc/syntax/index.html)
 * */
'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

(function (ubicus, $) {
    window.ubicus = ubicus;
    ubicus.base = ubicus.base || {};

    window.API_HOST = '/api/v1';

    /**
     * xAjax와 동일하나 contentType을 application/json으로 고정하고
     * Object 형태의 데이터를 stringify 하여 body데이터로 보낸다.
     *
     * 보통 POST,PATCH,PUT 등의 전송에서 Controller @RequestBody 를 통해 데이터 바인딩을 수행할 때 사용된다.
     * */
    window.xAjaxJson = function xAjaxJson(options) {
        var jsonOption = {
            contentType: "application/json"
        };

        if (typeof options.data === 'object') {
            jsonOption['data'] = JSON.stringify(options.data);
        } else {
            //이미 stringify 된경우
            jsonOption['data'] = options.data;
        }

        return xAjax(Object.assign(options, jsonOption));
    };

    window.xAjax = function xAjax(options) {
        /*
        * url: options.url,
        * method: options.method,
        * data: options.data,
        **/
        if (options['usePrefixUrl'] !== false) {
            options['url'] = window.API_HOST + options['url'];
        }

        var paramError = options.error;

        return new Promise(function (resolve, reject) {
            var dOptions = {
                success: function success(response, textStatus, jqXHR) {
                    resolve(response);
                },
                error: function error(jqXHR, textStatus, errorThrown) {
                    if (typeof paramError === 'function') {
                        paramError(jqXHR, textStatus, errorThrown);
                    }

                    var error = jqXHR['responseJSON'];
                    if (error === undefined) {
                        if (jqXHR.status === 401) {
                            self.notify("세션이 만료되었습니다. 로그인 페이지로 이동합니다.", { title: "세션만료" }, { type: 'error' });
                            reject(error);
                            location.href = '/login';
                        } else {
                            self.notify("[" + jqXHR.status + "]사용자 요청이 실패하였습니다.", { title: "오류" }, { type: 'error' });
                            reject(error);
                        }
                    } else {
                        self.notify(error.message, { title: error['error'] }, { type: 'error' });
                        reject(error);
                    }
                }
            };

            delete options.error;
            $.ajax($.extend({}, dOptions, options));
        });
    };

    window.xAjaxMultipart = function (options) {
        var formData = new FormData();

        var isFile = function isFile(value) {
            return value.lastModified && value.lastModifiedDate && value.name && value.size && value.type;
        };

        if (options.parts) {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = Object.entries(options.parts)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var _step$value = _slicedToArray(_step.value, 2);

                    var key = _step$value[0];
                    var value = _step$value[1];

                    var blob = new Blob([JSON.stringify(value)], {
                        type: 'application/json'
                    });
                    formData.append(key, blob);
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator['return']) {
                        _iterator['return']();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }
        }

        if (options.fileParts) {
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = Object.entries(options.fileParts)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var _step2$value = _slicedToArray(_step2.value, 2);

                    var key = _step2$value[0];
                    var value = _step2$value[1];

                    if (Array.isArray(value)) {
                        value.forEach(function (e) {
                            formData.append(key, e);
                        });
                    } else {
                        formData.append(key, value);
                    }
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2['return']) {
                        _iterator2['return']();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }
        }

        return xAjax(Object.assign(options, {
            contentType: false,
            processData: false,
            data: formData
        }));
    };

    var self = ubicus.base.lib = {
        messages: {
            PROCESS: '요청하신 작업이 처리되었습니다.'
        },
        code: function code(_code, options) {
            var dOptions = {
                type: 'object', //option,
                useYn: 'Y',
                defaultValue: ''
            };
            options = Object.assign(dOptions, options || {});

            var children = ubicus.base.company.code.CODES[_code] || [];
            if (options.useYn !== 'ALL') {
                children = children.filter(function (child) {
                    return child.useYn === options.useYn;
                });
            }

            if (options.type === 'option') {
                var option = '';

                children.forEach(function (child) {
                    var selected = '';
                    if (options['defaultValue'] === child['cd']) {
                        selected = ' selected="selected" ';
                    }

                    option += '<option value="' + child.cd + '" ' + selected + ' data-div-cd="' + child.divCd + '" data-etc1="' + child.etc1 + '" data-etc2="' + child.etc2 + '" data-etc3="' + child.etc3 + '" data-etc4="' + child.etc4 + '">' + child.cdNm + '</option>';
                });
                return option;
            } else if (options.type === 'v-object') {
                children.forEach(function (child) {
                    child.text = child.cdNm;
                    child.value = child.cd;
                });
            }

            return children;
        },

        download: function download(options) {
            return new Promise(function (resolve, reject) {
                // https://github.com/johnculviner/jquery.fileDownload/issues/129
                // successCallback 이 호출되지 않는 경우 response 에 set cookie fileDownload=true
                var defaultOptions = {
                    successCallback: function successCallback(url) {
                        resolve({ url: url });
                    },
                    failCallback: function failCallback(responseHtml, url, error) {
                        //chrome 의 버전이 올라가서 그런지 responseHtml 이 나오지 않음..
                        var json;
                        try {
                            json = JSON.parse(responseHtml.replace(/<[^>]*>?/gm, ''));
                            self.notify({ message: json.message, type: 'error' });
                        } catch (e) {
                            json = undefined;
                            self.notify({ message: 'The file could not be found.', type: 'error' });
                        }

                        reject({ html: responseHtml, url: url, json: json });
                    }
                };
                defaultOptions.data = options.data;
                defaultOptions.httpMethod = options.method || 'GET';

                $.fileDownload(options.url, defaultOptions);
            });
        },

        alert: function alert(msg, options) {
            msg = msg.replace(/\n/g, '<br/>');
            options = options || {};
            var dOptions = {
                html: msg,
                //title: "Are you sure?",
                //icon: "warning",
                showCancelButton: false,
                confirmButtonText: "OK"
            };

            return Swal.fire($.extend({}, dOptions, options));
        },

        confirm: function confirm(msg, options) {
            msg = msg.replace(/\n/g, '<br/>');
            options = options || {};
            var dOptions = {
                html: msg,
                showCancelButton: true,
                confirmButtonText: "확인",
                cancelButtonText: "취소",
                reverseButtons: true
            };

            return Swal.fire($.extend({}, dOptions, options));
        },

        notify: function notify(msg, options, settings) {
            //https://github.com/CodeSeven/toastr
            //https://codeseven.github.io/toastr/demo.html

            var toastType = 'success'; //warning, success, error, info
            var toastTitle = undefined;
            var toastMessage;
            var positionClass = "toast-bottom-left";
            var timeOut = "2000";

            if (typeof msg === 'object') {
                if (msg['message'] !== undefined) {
                    //type, title, message
                    toastMessage = msg['message'];

                    if (msg['type'] !== undefined) {
                        toastType = msg['type'];
                    }

                    if (msg['title'] !== undefined) {
                        toastTitle = msg['title'];
                    }
                } else {
                    //POST, PUT 등의 객체 리턴
                    toastMessage = self.messages.PROCESS;
                }
            } else if (msg === undefined) {
                //DELETE 요청 또는 실제로 없는경우
                toastMessage = self.messages.PROCESS;
            } else {
                // 추후 삭제예정
                toastMessage = msg;

                if (settings && settings.type) {
                    toastType = settings.type;
                }

                if (options) {
                    toastTitle = options.title;
                }
            }

            console.log(toastType, toastTitle, toastMessage);

            return window.toastr[toastType](toastMessage, toastTitle, { positionClass: positionClass, timeOut: timeOut });
        }
    };
})(window.ubicus || {}, jQuery);