'use strict';

/**
 * 공통으로 사용하는 validation rules 를 정의한다.
 *
 * <v-text-field label="이름" v-model="form.data.name" :rules="ubicus.base.rule.required"></v-text-field>
 * */
(function (ubicus) {
    window.ubicus = ubicus;
    ubicus.base = ubicus.base || {};

    ubicus.base.rule = {
        password: [function (password) {
            return password && password.length > 0 || '필수 입력 항목입니다';
        }, function (password) {
            return password.length > 8 || '8~16 자리를 사용해야 합니다';
        }, function (password) {
            return password.length < 16 || '8~16 자리를 사용해야 합니다';
        }, function (password) {
            return (/[0-9]/.test(password) || '숫자가 포함되어야 합니다'
            );
        }, function (password) {
            return (/[a-zA-Z]/.test(password) || '영문이 포함되어야 합니다'
            );
        }, function (password) {
            return (/[~!@#$%<>^&*]/.test(password) || '특수문자가 포함되어야 합니다'
            );
        }],
        required: [function (v) {
            return v && String(v).trim().length > 0 || '필수 입력 항목입니다';
        }],
        requiredMulti: [function (v) {
            return v.length > 0 || "필수 입력 항목입니다";
        }],
        requiredObject: [function (v) {
            return v.value !== '' && v.value !== undefined ? true : '필수 입력 항목입니다';
        }],
        number: [function (v) {
            return v !== null && v !== undefined && String(v) !== '' && !isNaN(v) || '숫자 입력 항목입니다';
        }],
        timeHHmmss: [function (v) {
            return v && v.length > 0 && /^([0-1][0-9]|2[0-3]):([0-5][0-9])(:[0-5][0-9])$/.test(v) || '형식이 올바르지 않습니다. (HH:mm:ss)';
        }],
        timeHHmm: [function (v) {
            return v && v.length > 0 && /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/.test(v) || '형식이 올바르지 않습니다. (HH:mm)';
        }],
        email: [function (v) {
            return !!v || '필수 입력 항목입니다';
        }, function (v) {
            return (/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) || '이메일 형식이 아닙니다'
            );
        }],
        sortNumber: [function (v) {
            return v !== '' && !isNaN(v) && v > -1 || '필수 입력 항목입니다';
        }],
        verifyForm: function verifyForm(formElement, attributeName, notValidatedFn, validatedFn) {
            var attrName = attributeName || 'data-rule';
            var elements = formElement.querySelectorAll('[' + attrName + ']');
            var isValid = true;

            for (var i = 0, len = elements.length; i < len; i++) {
                var element = elements[i];
                var ruleName = element.getAttribute(attrName);
                var rules = this[ruleName];
                var value = element.value;

                for (var j = 0, len2 = rules.length; j < len2; j++) {
                    var rule = rules[j];
                    var message = rule(value);

                    if (message !== true) {
                        if (typeof notValidatedFn === 'function') {
                            notValidatedFn(element, message);
                        } else {
                            alert(message);
                            element.focus();
                        }

                        isValid = false;
                        break;
                    } else {
                        if (typeof validatedFn === 'function') {
                            validatedFn(element);
                        }
                    }
                }

                if (!isValid) {
                    break;
                }
            }

            return isValid;
        }
    };
})(window.ubicus || {});