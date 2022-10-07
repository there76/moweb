const API_HOST = '/api/v1';
export const xAjax = (options) => {

    /*
    * url: options.url,
    * method: options.method,
    * data: options.data,
    **/
    if (options['usePrefixUrl'] !== false) {
        options['url'] = API_HOST + options['url'];
    }

    const paramError = options.error;

    return new Promise(function (resolve, reject) {
        const dOptions = {
            success: function (response, textStatus, jqXHR) {
                resolve(response);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                if (typeof paramError === 'function') {
                    paramError(jqXHR, textStatus, errorThrown);
                }

                const error = jqXHR['responseJSON'];
                if (error === undefined) {
                    if (jqXHR.status === 401) {
                        window.alert("세션이 만료되었습니다. 로그인 페이지로 이동합니다.");
                        location.reload();
                        reject(error);
                    } else {
                        window.alert("[" + jqXHR.status + "]사용자 요청이 실패하였습니다.");
                        reject(error);
                    }
                } else {
                    window.alert(error.message);
                    reject(error);
                }
            }
        };

        delete options.error;

        window.$.ajax(window.$.extend({}, dOptions, options))
    });
};

export const xAjaxJson = (options) => {
    const jsonOption = {
        contentType: "application/json"
    };

    if (typeof options.data === 'object') {
        jsonOption['data'] = JSON.stringify(options.data);
    } else {//이미 stringify 된경우
        jsonOption['data'] = options.data;
    }

    return xAjax(Object.assign(options, jsonOption));
}

export const xAjaxMultipart = (options) => {
    const formData = new FormData();

    const isFile = (value) => {
        return value.lastModified && value.lastModifiedDate && value.name
            && value.name && value.size && value.type
    }

    if (options.parts) {
        for (const [key, value] of Object.entries(options.parts)) {

            if (!isFile(value) && _.isObject(value)) {
                const blob = new Blob([JSON.stringify(value)], {
                    type: 'application/json'
                });
                formData.append(key, blob);
            } else {
                formData.append(key, value);
            }

        }
    }

    return xAjax(Object.assign(options, {
        contentType: false,
        processData: false,
        data: formData
    }));
}