/**
 * ui는 DOM을  조작하는 공통 처리 함수들을 집어 넣는다.
 *     - 화면 종속적인 $('#someId') 와 같은 특정 seletor등을 처리 하는 경우
 * */
(function (ubicus, $) {
    window.ubicus = ubicus;
    ubicus.base = ubicus.base || {};

    let windowResizeTimer = null;
    window.addEventListener("resize", ()=>{
        clearTimeout(windowResizeTimer);
        windowResizeTimer = setTimeout(()=>{
            ubicus.base.ui.MAX_WIDTH = window.innerWidth;
            ubicus.base.ui.MAX_HEIGHT = window.innerHeight;
        },500);
    });

    const self = ubicus.base.ui = {
        MAX_WIDTH: window.innerWidth,
        MAX_HEIGHT: window.innerHeight,

        /**
         * iframe element에 content의 내용을 넣는다. content가 HTML인 경우 application의 css를 제외 하기 위해 iframe에 넣는다.
         *
         * @param {Element} iframe <iframe> element
         * @param {String} content html 내용
         */
        setIframeContent : function(iframe,content){
            if(content !== undefined && content !== ''){
                //val = val.replace(/(<a href=["|']hts[^>]*>)([^<]+)(<\/a>)/g, '$2');
                const ifrm = iframe.contentWindow || iframe.contentDocument.document || iframe.contentDocument;
                ifrm.document.open();
                ifrm.document.write(content);
                const style = document.createElement('style');
                style.textContent =`
                ::-webkit-scrollbar {
                    width: 7px;
                    height: 7px;
                }
                
                /* Track */
                ::-webkit-scrollbar-track {
                    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
                    -webkit-border-radius: 10px;
                    border-radius: 10px;
                }
                
                /* Handle */
                ::-webkit-scrollbar-thumb {
                    -webkit-border-radius: 10px;
                    border-radius: 10px;
                    background: rgba(199, 236, 210,0.8);
                    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.5);
                }
                ::-webkit-scrollbar-thumb:window-inactive {
                    background: rgba(199, 236, 210,0.4);
                }
                
                body{
                    background: hsla(0,0%,100%,.7);
                }
                
                `
                ;

                ifrm.document.head.appendChild(style);
                ifrm.document.close();

                const resizeIframe = function resizeIframe(iframe) {
                    let padding = 0;
                    if (iframe.contentWindow.document.body.scrollHeight < (window.innerHeight - padding)){
                        iframe.height = iframe.contentWindow.document.body.scrollHeight + "px";
                    } else {
                        iframe.height = (window.innerHeight - padding) + "px";
                    }
                }

                resizeIframe(iframe);
            }
        },

        /**
         * jo
         *
         * @param {String||Object} jsonObject JSON
         * @return {Element} <div class="print-json-root"></div>
         */
        printJSONObject: function printJSONObject(jsonObject) {function jsonToString(e) {var t=typeof e;if("object"!=t||null===e)return"string"==t&&(e='"'+e+'"'),String(e);var n,r,s=[],a=e&&e.constructor==Array;for(n in e)r=e[n],t=typeof r,"string"==t?r='"'+jsonEscape(r)+'"':"object"==t&&null!==r&&(r=jsonToString(r)),s.push((a?"":'"'+jsonEscape(n)+'":')+String(r));return(a?"[":"{")+String(s)+(a?"]":"}")}function jsonEscape(e){return e.replace(/\\n/g,"\\n").replace(/\'/g,"\\'").replace(/\"/g,'\\"').replace(/\&/g,"\\&").replace(/\r/g,"\\r").replace(/\t/g,"\\t").replace(/\b/g,"\\b").replace(/\f/g,"\\f")}function stringToJson(str){return""===str&&(str='""'),eval("var p="+str+";"),p}function isArray(e){try{return Array.isArray(e)}catch(t){return void 0!==e.length}}function objLength(e){var t=0;try{t=Object.keys(e).length}catch(n){for(var r in e)e.hasOwnProperty(r)&&t++}return t}if("string"==typeof jsonObject&&(jsonObject=stringToJson(jsonObject)),void 0===window.printJSONExpandableCallback){try{var cssText="";cssText+=".print-json-root ul{ margin: 0; padding: 0; }.print-json-root ul li > ul{ padding-left: 20px; } .print-json-root li{list-style: none;}\n",cssText+=".print-json-string{color:red;}\n",cssText+=".print-json-boolean{color:#7f0055;}\n",cssText+=".print-json-number{color:blue;}\n",cssText+=".print-json-key{color:#881391;}\n",cssText+=".print-json-icon{vertical-align:top;display: inline-block;width: 15px;height: 15px;background-repeat: no-repeat;background-position: 3px 4px;}\n",cssText+=".print-json-plus{cursor:pointer;background-image:url(data:image/gif;base64,R0lGODlhCQAJAIABAAAAAP///yH5BAEAAAEALAAAAAAJAAkAAAIRhI+hG7bwoJINIktzjizeUwAAOw==);}\n",cssText+=".print-json-minus{cursor:pointer;background-image:url(data:image/gif;base64,R0lGODlhCQAJAIABAAAAAP///yH5BAEAAAEALAAAAAAJAAkAAAIQhI+hG8brXgPzTHllfKiDAgA7);}\n",cssText+=".print-json-array{cursor:pointer;background-image:url(data:image/gif;base64,R0lGODlhCQAJAIABAAAAAP///yH5BAEAAAEALAAAAAAJAAkAAAIRhI+hG7bwoJINIktzjizeUwAAOw==);}\n",cssText+=".print-json-table{border-collapse:collapse;}\n";var style=document.createElement("style");style.setAttribute("type","text/css"),style.setAttribute("id","printJSONInternalCSS"),document.getElementsByTagName("head")[0].appendChild(style);try{style.styleSheet.cssText=cssText}catch(e){style.innerHTML=cssText}}catch(e){alert("style 생성 실패 : \n"+e.message)}window.printJSONExpandableCallback=function(e,t){for(var n=t.nextSibling;"UL"!=n.nodeName;)n=n.nextSibling;if(n){var r=n.style.display;if("none"==r){n.style.display="",t.className="print-json-icon print-json-minus";var s=t.jsonData;for(var a in s){var i=s[a],o=0,l=typeof i,c=i,p="print-json-"+l,d=null;"object"==l&&(isArray(i)?(o=i.length,c="Array["+o+"]",o>0&&(d=document.createElement("I"),d.setAttribute("class","print-json-icon print-json-plus"),d.setAttribute("onclick","printJSONViewArrayCallback(event,this)"),d.jsonData=i)):(o=objLength(i),c="Object"));var A=document.createElement("LI"),u=document.createElement("span"),j=document.createElement("SPAN");j.setAttribute("class","print-json-key"),j.appendChild(document.createTextNode(a));var b=document.createTextNode(": "),h=document.createElement("SPAN");h.setAttribute("class",p),h.appendChild(document.createTextNode(c)),null!=d&&h.appendChild(d);var m=document.createElement("I");if(m.setAttribute("class","print-json-icon"),o>0&&(m.setAttribute("class","print-json-icon print-json-plus"),m.setAttribute("onclick","printJSONExpandableCallback(event,this)"),m.jsonData=i),u.appendChild(j),u.appendChild(b),u.appendChild(h),A.appendChild(m),A.appendChild(u),o>0){var g=document.createElement("ul");g.style.display="none",A.appendChild(g)}n.appendChild(A)}}else n.style.display="none",t.className="print-json-icon print-json-plus",n.innerHTML=""}},window.printJSONViewArrayCallback=function(e,t){try{if("print-json-icon print-json-plus"==t.className){t.className="print-json-icon print-json-minus";var n=t.jsonData,r="<thead><tr>";if(r+="<th>seq</th>",n.length>0){var s=n[0],a=typeof s;if("object"==a)for(var i in s)r+="<th>"+i+"</th>";else r+="<th>contents</th>"}r+="</tr></thead>";for(var o=[],l=0,c=n.length;c>l;l++){var p="<tr>";p+="<td>"+l+"</td>";var s=n[l],a=typeof s;if("object"==a)for(var i in s)p+="<td>"+s[i]+"</td>";else p+="<td>"+s+"</td>";p+="</tr>\n",o.push(p)}var d="<tbody>"+o.join("")+"</tbody>",A=document.createElement("table");A.setAttribute("border","1"),A.setAttribute("class","table table-striped table-bordered table-condensed print-json-table"),A.innerHTML=r+d;for(var u=t.parentNode;"LI"!=u.nodeName;)u=u.parentNode;try{u.insertBefore(A,u.getElementsByTagName("UL")[0])}catch(j){u.appendChild(A)}}else{t.className="print-json-icon print-json-plus";for(var u=t.parentNode;"LI"!=u.nodeName;)u=u.parentNode;var A=u.getElementsByTagName("TABLE")[0];u.removeChild(A)}}catch(j){console.log(j)}}}var ul=document.createElement("UL"),li=document.createElement("LI"),span=document.createElement("SPAN"),text=document.createTextNode("Object:"+typeof jsonObject),icon=document.createElement("I");icon.setAttribute("class","print-json-icon"),icon.setAttribute("class","print-json-icon print-json-plus"),objLength(jsonObject)>0&&(icon.setAttribute("onclick","printJSONExpandableCallback(event,this)"),icon.jsonData=jsonObject);var childUL=document.createElement("UL");childUL.style.display="none",span.appendChild(text),li.appendChild(icon),li.appendChild(span),li.appendChild(childUL),ul.appendChild(li);var div=document.createElement("DIV");return div.setAttribute("class","print-json-root"),div.setAttribute("style","position:relative"),div.appendChild(ul),div},

        /**
         * 시간 선택 할 수 있는 시간 박스 생성 0 시 부터 ~ 23 시
         * @param {String} selectBoxID selectbox 명
         * @param {String} htmlID selectbox 가 append 될 영역 id
         * @param {int} setHour 현재 시간
         *
         */
        setHourSelectBoxCalendar: function(selectBoxID, htmlID, setHour){
            let hh_box = [];
            hh_box.push("<select id='"+selectBoxID+"' class='form-control' name='"+selectBoxID+"'>\n");

            let flag = false;

            for(let i=0; i<24; i++) {

                if(setHour == i) flag = true;

                if(i<10){
                    if(flag == true){
                        hh_box.push("<option value='0"+i+"' selected='selected' >0"+i+"시</option>\n");
                    }else{
                        hh_box.push("<option value='0"+i+"' >0"+i+"시</option>\n");
                    }
                } else{
                    if(flag == true){
                        hh_box.push("<option value='"+i+"' selected='selected'>"+i+"시</option>\n");
                    }else{
                        hh_box.push("<option value='"+i+"' >"+i+"시</option>\n");
                    }
                }

                flag = false;
            }
            hh_box.push("</select>");

            $('#'+htmlID).html(hh_box.join(""));

        },

        /**
         * 지정된 간격으로 분 선택 할 수 있는 콤보 박스 생성
         * interval 로 분단위 리턴
         * @param {String} selectBoxID selectbox 명
         * @param {String} htmlID selectbox 가 append 될 영역 id
         * @param {int} interval : 간견 (integer)
         * @param {int} setMin : 현재분
         *
         */
        setMinSelectBoxCalendar: function (selectBoxID, htmlID, interval, setMin){

            let mm_box = [];
            mm_box.push("<select id='"+selectBoxID+"' class='form-control' name='"+selectBoxID+"'>\n");

            if(typeof(interval) != 'number'){
                interval = 1;
            }

            let minLength = 60 / interval;
            let minValue = 0;
            let flag = false;

            for(let M=0; M<minLength; M++){
                minValue = M*interval;

                if(((minValue - setMin) / interval >= 0 && (minValue - setMin) / interval < 1)){
                    flag = true;
                }

                if(minValue<10){
                    if(flag == true){
                        mm_box.push("<option value='0"+minValue+"' selected='selected' >0"+minValue+"분</option>\n");
                    }else{
                        mm_box.push("<option value='0"+minValue+"' >0"+minValue+"분</option>\n");
                    }
                } else{
                    if(flag == true){
                        mm_box.push("<option value='"+minValue+"' selected='selected'>"+minValue+"분</option>\n");
                    }else{
                        mm_box.push("<option value='"+minValue+"' >"+minValue+"분</option>\n");
                    }
                }

                flag = false;
            }

            mm_box.push("</select>");

            $('#'+htmlID).html(mm_box.join(""));

        },

        tinymce: {
            baseSkinPath : "/static/lib/vue/vue-easy-tinymce-1.0.2/css",
            skinInfo :{
                'black':{
                    skin :'dark',
                    path : '/dark/content.css'
                },
                'lightgray':{
                    skin :'lightgray',
                    path : '/tinymce-content.css'
                }
            },
            getSkinPath: function(isDark = false){
                const skin = isDark ? 'black' : 'lightgray';
                return ubicus.base.ui.tinymce.baseSkinPath + ubicus.base.ui.tinymce.skinInfo[skin].path;

            },
            changeTheme: function (isDark = false) {

                const $tinymceSkinLink = $('link[href*="/tinymce/skins/"]');
                const tinymceSkinLinkHref = $tinymceSkinLink.attr('href');
                const $editorIframe = $('iframe[id*="editor-"]');

                if (isDark) {
                    if ($tinymceSkinLink.length > 0) {
                        $tinymceSkinLink.attr('href', tinymceSkinLinkHref.replace('lightgray', 'dark'));
                    }

                    if ($editorIframe.length > 0) {
                        $editorIframe.contents().find('link').each(function () {
                            const $this = $(this);
                            const href = $this.attr('href');
                            if (href.indexOf('lightgray/content.min.css') > -1) {
                                $this.attr('href', href.replace('lightgray/content.min.css', 'dark/content.min.css'));
                            } else if (href.indexOf(ubicus.base.ui.tinymce.skinInfo.lightgray.path) > -1) {
                                $this.attr('href', href.replace(ubicus.base.ui.tinymce.skinInfo.lightgray.path, ubicus.base.ui.tinymce.skinInfo.black.path));

                            }
                        })
                    }


                } else {
                    if ($tinymceSkinLink.length > 0) {
                        $tinymceSkinLink.attr('href', tinymceSkinLinkHref.replace('dark', 'lightgray'));
                    }
                    if ($editorIframe.length > 0) {
                        $editorIframe.contents().find('link').each(function () {
                            const $this = $(this);
                            const href = $this.attr('href');
                            if (href.indexOf('dark/content.min.css') > -1) {
                                $this.attr('href', href.replace('dark/content.min.css', 'lightgray/content.min.css'));
                            } else if (href.indexOf(ubicus.base.ui.tinymce.skinInfo.black.path) > -1) {
                                $this.attr('href', href.replace(ubicus.base.ui.tinymce.skinInfo.black.path, ubicus.base.ui.tinymce.skinInfo.lightgray.path));
                            }
                        })
                    }
                }
            }
        },

        activeDialogDraggable: function(isAll = false) {
            const container = {};
            const wrappersSelector = '.v-dialog__content.v-dialog__content--active';
            const dialogSelector = `.v-dialog.v-dialog--active${!isAll ? '.ub-draggable' : ''}`;


            const closestDialog = (event) => {
                // check for left click
                if (event.button !== 0) {
                    return;
                }

                let dialog;
                // target must contain one of provided classes
                ['v-card__title', 'v-toolbar__content', 'v-toolbar__title'].forEach((className) => {
                    if (event.target.classList.contains(className)) {
                        dialog = event.target.closest(dialogSelector);
                    }
                });

                return dialog
            }

            const makeDialogAbove = (event) => {
                const wrappers = document.querySelectorAll(wrappersSelector);
                const activeWrapper = event.target.closest(wrappersSelector);
                // if we clicked on non-related element
                if (!activeWrapper) {
                    return false;
                }

                // list of all z-indexes of wrappers
                let indexes = [];
                // collect all the indexes
                wrappers.forEach((element) => {
                    indexes.push(parseInt(element.style.zIndex));
                });

                const maxIndex = Math.max(...indexes);
                const currentIndex = parseInt(activeWrapper.style.zIndex);
                // if z-index of current active dialog is less than we will switch them
                // to make this dialog above the rest
                if (currentIndex < maxIndex) {
                    wrappers.forEach((element) => {
                        if (parseInt(element.style.zIndex) === maxIndex) {
                            element.style.zIndex = currentIndex.toString();
                            activeWrapper.style.zIndex = maxIndex.toString();
                        }
                    });
                }
            }

            const setStyles = (event) => {
                const dialog = closestDialog(event);

                if (dialog) {
                    container.el = dialog;
                    container.mouseStartX = event.clientX;
                    container.mouseStartY = event.clientY;
                    container.elStartX = container.el.getBoundingClientRect().left;
                    container.elStartY = container.el.getBoundingClientRect().top;
                    container.el.style.position = 'fixed';
                    container.el.style.margin = '0px';
                    container.oldTransition = container.el.style.transition;
                    container.el.style.transition = 'none';
                }
            }

            const alignDialog = (event) => {
                const dialog = document.querySelector(dialogSelector);
                if (dialog === null) return;

                const styleLeft = parseInt(dialog.style.left);
                const styleTop = parseInt(dialog.style.top);
                const boundingWidth = dialog.getBoundingClientRect().width;
                const boundingHeight = dialog.getBoundingClientRect().height;

                const left = Math.min(styleLeft, window.innerWidth - boundingWidth);
                const top = Math.min(styleTop, window.innerHeight - boundingHeight);

                let borderLeft = 0;
                let borderTop = 0;

                // we need to add some borders to center the dialog once the window has resized
                if (styleLeft > window.innerWidth) {
                    borderLeft = left / 2;
                }

                if (styleTop + boundingHeight > window.innerHeight) {
                    borderTop = (window.innerHeight - boundingHeight) / 2;
                }

                dialog.style.left = (left - borderLeft) + 'px';
                dialog.style.top = (top - borderTop) + 'px';
            }

            const moveDialog = (event) => {
                if (container.el) {
                    container.el.style.left = Math.min(
                        Math.max(container.elStartX + event.clientX - container.mouseStartX, 0),
                        window.innerWidth - container.el.getBoundingClientRect().width
                    ) + 'px';

                    container.el.style.top = Math.min(
                        Math.max(container.elStartY + event.clientY - container.mouseStartY, 0),
                        window.innerHeight - container.el.getBoundingClientRect().height
                    ) + 'px';
                }
            }

            const setTransitionBack = (event) => {
                if (container.el) {
                    container.el.style.transition = container.oldTransition;
                    container.el = undefined;
                }
            }


            $(document).off('mousedown.ub-dialog-draggable').on('mousedown.ub-dialog-draggable', (e) => {
                makeDialogAbove(e);
                setStyles(e);
            });

            $(document).off('mousemove.ub-dialog-draggable').on('mousemove.ub-dialog-draggable', (e) => {
                moveDialog(e);
            });

            $(document).off('mouseup.ub-dialog-draggable').on('mouseup.ub-dialog-draggable', (e) => {
                setTransitionBack(e);
            });

            clearInterval(window.UbicusMocaDialogDraggableIntervalId);

            window.UbicusMocaDialogDraggableIntervalId = setInterval(() => {
                alignDialog();
            }, 500);
        }





    };
})(window.ubicus || {}, jQuery);