<!DOCTYPE html>
<%@ page trimDirectiveWhitespaces="true" language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="menu" uri="http://www.ubicus.com/sitemesh" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="sec" uri="http://www.springframework.org/security/tags" %>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags" %>
<sec:authentication var="appUser" property="principal"/>

<%
    String userAgent = request.getHeader("User-Agent");
    boolean isIe = (userAgent.indexOf("MSIE") > -1 || userAgent.indexOf("Trident") > -1);
    pageContext.setAttribute("isIe", isIe);
%>

<head>
    <meta http-equiv="Content-Type" content="text/html;charset=UTF-8"/>
    <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
    <meta http-equiv="Cache-control" content="public"/>
    <meta name="viewport"
          content="width=device-width,initial-scale=1.0,minimum-scale=0,maximum-scale=10,user-scalable=yes">
    <meta name="author" content="dure">
    <meta name="description" content="두레는 환경을 생각하는 국내 1등식품포장용기 전문기업. 친환경PLA용기, 초밥용기, 특수종이컵, 도시락, 트레이, 바가스펄프, 알루미늄용기">
    <meta http-equiv="Expires" content="-1">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Cache-Control" content="No-Cache">
    <meta name="format-detection" content="telephone=no" />
    <meta name="naver-site-verification" content="29bcfe2634d705b76e56db1d777d0c8932b37241" />
    <meta name="google-site-verification" content="yaX2-14y5lXRcTKoOf1vClNJL3dNGJRX2nn8QP8Mnf0" />
    <meta property="og:type" content="website">
    <meta property="og:title" content="두레">
    <meta property="og:description" content="두레는 환경을 생각하는 국내 1등식품포장용기 전문기업. 친환경PLA용기, 초밥용기, 특수종이컵, 도시락, 트레이, 바가스펄프, 알루미늄용기">
    <meta property="og:image" content="/static/webMaster/dure.jpg">
    <meta property="og:url" content="http://www.durepack.com">

    <title><sitemesh:write property="title"/></title>



    <link rel="shortcut icon" href="https://dure.s3.ap-northeast-2.amazonaws.com/data/images/favicon.ico" type="image/x-icon">
    <link rel="icon" href="https://dure.s3.ap-northeast-2.amazonaws.com/data/images/favicon.ico" type="image/x-icon">

    <link rel="stylesheet" href="/static/css/common.css?ts=<%=System.currentTimeMillis()%>"/>
    <link rel="stylesheet" href="/static/css/template.css?ts=<%=System.currentTimeMillis()%>"/>
    <link href="/static/lib/sweetalert2/9.17.1/sweetalert2.min.css" rel="stylesheet" type="text/css"/>
    <link href="/static/lib/toastr/toastr-2.1.1.min.css" rel="stylesheet" type="text/css"/>

    <style>
        .swal2-container {
            z-index: 2001
        }
    </style>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/core-js/3.19.2/minified.js"></script>

    <script src="/webjars/jquery/3.6.0/jquery.min.js"></script>
    <script src="/webjars/vue/2.6.14/vue.min.js"></script>

    <script src="/static/js/scrollTo/jquery.scrollTo.js"></script>
    <script src="/static/js/TweenMax/TweenMax.min.js"></script>
    <script src="/static/js/waypoint/jquery.waypoints.js"></script>
    <script src="/static/js/marquee/jquery.marquee.min.js"></script>
    <script defer src="/static/js/common.js" ></script>
    <script src="/static/lib/ubicus/ubicus.base.lib.js"></script>
    <script src="/static/lib/ubicus/ubicus.base.util.js"></script>
    <script src="/static/lib/ubicus/ubicus.base.rule.js"></script>
    <script src="/static/lib/jquery/jquery.blockUI.js"></script>
    <script src="/static/lib/lodash.min.js"></script>
    <script src="/static/lib/sweetalert2/9.17.1/sweetalert2.min.js"></script>
    <script src="/static/lib/toastr/toastr-2.1.1.min.js"></script>
    <script src="/static/lib/moment.min.js"></script>
    <script src="/static/lib/pagination.min.js"></script>
    <script type="text/javascript"
            src="http://maps.google.com/maps/api/js?key=AIzaSyAbk1wMXUHM5Un2u6rlK7ZFLOjsXjA3LWw"></script>
    <script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"></script>


    <c:choose>
        <c:when test="${isIe}">
            <link rel="stylesheet" href="/static/css/swiper/swiper-bundle.min.4.5.1.css"/>
            <script src="/static/js/swiper/swiper-bundle.min.4.5.1.js"></script>
            <link rel="stylesheet" type="text/css" href="/static/css/iescss.css?ts=<%=System.currentTimeMillis()%>" />
        </c:when>
        <c:otherwise>
            <link rel="stylesheet" href="/static/css/swiper/swiper-bundle.min.css"/>
            <script src="/static/js/swiper/swiper-bundle.min.js"></script>
        </c:otherwise>
    </c:choose>

    <!-- Global site tag (gtag.js) - Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-551GJ4FCHD"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', 'G-551GJ4FCHD');
    </script>

    <sitemesh:write property="head"/>
</head>
<body>
<c:if test="${popup != null and popup.get('TOP_BANNER') != null && popup.get('TOP_BANNER').size() > 0}">
    <c:forEach var="item" items="${popup.get('TOP_BANNER')}">
        <div  class="top-banner js-top-banner">
            <c:if test="${item.getLink() != null && item.getLink() ne ''}">
            <a class="top-banner__link" href="${item.getLink()}">
                </c:if>
                <div class="top-banner__content__wrap">
                    <c:if test="${item.getContentType().name() eq 'HTML'}">
                        <div class="top-banner__content__html">${item.getContent()}</div>
                    </c:if>
                    <c:if test="${item.getContentType().name() eq 'IMAGE'}">
                        <c:forEach var="imageUrl" items="${item.getImages()}">
                            <div class="top-banner__content__img" style="'background-image: url(\'' + ${imageUrl} + '\')'"></div>
                        </c:forEach>
                    </c:if>
                </div>
                <c:if test="${item.getLink() != null && item.getLink() ne ''}">
            </a>
            </c:if>
            <div class="top-banner__btn__wrap">
                <c:if test="${item.getCookieDay() > 0}">
                    <button class="top-banner__btn__close js-btn-cookie-close" data-key="${item.getPopupKey()}" data-day="${item.getCookieDay()}">${item.getCookieDay()}일동안 다시보지 않기 X</button>
                </c:if>
                <c:if test="${item.getCookieDay() == null || item.getCookieDay() == 0}">
                    <button class="top-banner__btn__close js-btn-close" >X</button>
                </c:if>
            </div>
        </div>
    </c:forEach>
</c:if>

<div class="app">
    <div class="header">
        <div class="menu">
            <div class="m-serach-btn">
                <div class="m-serach-btn-div">
                    <svg class="" style="width:30px;height:30px" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
                    </svg>
                </div>
            </div>
            <div class="menu-search mobile-search">
                <input type="text" placeholder="Search..." class="field global-search-btn mfield"
                       id="global-search-btn2"/>
                <div class="icons-container icon-search-container">
                    <div class="icon-search"></div>
                </div>
            </div>
            <div class="spacer mobile-spacer"></div>
            <div class="logo web_br"><a href="/"><img src="https://dure.s3.ap-northeast-2.amazonaws.com/data/images/common/logo_dure.png" alt="logo"/></a></div>
            <div class="logo mobile_br"><a href="/"><img src="https://dure.s3.ap-northeast-2.amazonaws.com/data/images/common/m_logo.png" alt="logo"/></a></div>
            <div class="spacer mobile-spacer"></div>
            <ul class="menu-ul web-menu">
                <menu:forEach depth="1">
                    <c:if test="${menu.params.loc eq 'left' and menu.params.display ne 'N'}">
                        <li class="menu-list">
                            <a href="${menu.path }"
                               class="<c:if test="${status.selected }">active</c:if>">${menu.name}</a>
                            <div class="sub-menu-list-wrap">
                                <c:if test="${!status.leaf}">
                                    <ul class="inner">
                                        <menu:forEach depth="2">
                                            <li class="sub-menu-list">
                                                <a href="${menu.path }"
                                                   class="<c:if test="${status.selected }">active</c:if>">${menu.name}</a>
                                                <c:if test="${!status.leaf}">
                                                    <ul>
                                                        <menu:forEach depth="3">
                                                            <li><a href="${menu.path }"
                                                                   class="<c:if test="${status.selected }">active</c:if>">${menu.name}</a>
                                                            </li>
                                                        </menu:forEach>
                                                    </ul>
                                                </c:if>
                                            </li>
                                        </menu:forEach>
                                    </ul>
                                </c:if>
                            </div>
                            <div class="menu-line"></div>
                        </li>
                    </c:if>
                </menu:forEach>
            </ul>
            <div class="spacer menu-spacer"></div>
            <div class="menu-search web-search">
                <input type="text" placeholder="Search..." class="field global-search-btn"
                       id="global-search-btn"/>
                <div class="icons-container icon-search-container" style="cursor: pointer;">
                    <div class="icon-search"></div>
                </div>
            </div>
            <div class="menu-sub-div web-menu">
                <ul class="sub-ul">
                    <menu:forEach depth="1">
                        <c:if test="${menu.params.loc eq 'right' and menu.params.display ne 'N'}">
                            <li>
                                <a href="${menu.path }" class="<c:if test="${status.selected }">active</c:if> ${menu.params.className}">${menu.name}</a>
                                <div class="menu-line"></div>
                            </li>
                        </c:if>
                    </menu:forEach>

                    <sec:authorize access="isAuthenticated()">
                        <li><a href="/user/mypage">MyPage</a></li>
                        <li><a href="/logout">Logout</a></li>
                    </sec:authorize>
                    <sec:authorize access="!isAuthenticated()">
                        <li><a href="/join">회원가입</a></li>
                        <li><a href="/login">Login</a></li>
                    </sec:authorize>
                    <li style="padding:0 5px 0 25px">
                        <a href="https://www.instagram.com/dure_pack/?hl=ko" class="" target="_blank">
                            <img src="/static/img/common/icon_ins_w.png" alt="instar" class="header_icon" />
                            <img src="/static/img/common/icon_ins_b.png" alt="instar" class="headerFixed_icon"  />
                        </a>
                    </li>
                    <li style="padding:0 0 0 5px;">
                        <a href="https://www.youtube.com/channel/UCdG5YqqoKfX8YFyxO9d3UEA" class="" target="_blank">
                            <img src="/static/img/common/icon_you_w.png" alt="youtube" class="header_icon"/>
                            <img src="/static/img/common/icon_you_b.png" alt="youtube" class="headerFixed_icon" />
                        </a>
                    </li>
                </ul>
            </div>
        </div>
        <div class="mobile-menu">
            <div class="open">
                <div class="line l_top"></div>
                <div class="line l_middle"></div>
                <div class="line l_low"></div>
            </div>
        </div>
        <div class="cover"></div>
        <div class="mobile-nav">
            <div class="mobile-nav-div">
                <ul class="mobile-nav-ul">
                    <menu:forEach depth="1">
                        <c:if test="${menu.params.loc eq 'left' and menu.params.display ne 'N'}">
                            <li>
                                <c:if test="${status.leaf}">
                                    <a href="${menu.path }" class="<c:if test="${status.selected }"> active</c:if>">${menu.name}</a>
                                </c:if>
                                <c:if test="${!status.leaf}">
                                    <a href="#" class="menu_plus <c:if test="${status.selected }"> active</c:if>">${menu.name}
                                        <span>+</span>
                                    </a>
                                    <ul class="depth-two">
                                        <menu:forEach depth="2">
                                            <li>
                                                <a href="${menu.path }"
                                                   class="<c:if test="${status.selected }">active</c:if>">${menu.name}</a>
                                                <c:if test="${!status.leaf}">
                                                    <ul>
                                                        <menu:forEach depth="3">
                                                            <li><a href="${menu.path }"
                                                                   class="<c:if test="${status.selected }">active</c:if>">${menu.name}</a>
                                                            </li>
                                                        </menu:forEach>
                                                    </ul>
                                                </c:if>
                                            </li>
                                        </menu:forEach>
                                    </ul>
                                </c:if>
                            </li>
                        </c:if>
                        <c:if test="${menu.params.loc eq 'right' and menu.params.display ne 'N'}">
                            <li>
                                <a href="${menu.path }"
                                   class="<c:if test="${status.selected }">active</c:if> ${menu.params.className}">${menu.name}</a>
                                <div class="menu-line"></div>
                            </li>
                        </c:if>
                    </menu:forEach>
                </ul>
                <div class="menu-vr"></div>
                <ul class="m_link">
                    <li><a href="https://www.dure-shop.co.kr/" target="_blank">(주)두레샵</a></li>
                    <li><a href="http://duremall.co.kr/" target="_blank">(주)두레몰</a></li>
                    <li><a href="http://ecodr.kr/pages/page_1.php" target="_blank">(주)에코두레</a></li>
                </ul>
                <ul class="join-menu">
                    <sec:authorize access="isAuthenticated()">
                        <li><a href="/user/mypage">MyPage</a></li>
                        <li class="join-menu-line"> | </li>
                        <li><a href="/logout">Logout</a></li>
                    </sec:authorize>
                    <sec:authorize access="!isAuthenticated()">
                        <li><a href="/join">회원가입</a></li>
                        <li class="join-menu-line"> | </li>
                        <li><a href="/login">Login</a></li>
                    </sec:authorize>
                    <li class="join-menu-line"> | </li>
                    <li>
                        <a href="https://www.instagram.com/dure_pack/?hl=ko" class="" target="_blank">
                            <img src="/static/img/common/icon_ins_b.png" alt="instar" />
                        </a>
                    </li>
                    <li>
                        <a href="https://www.youtube.com/channel/UCdG5YqqoKfX8YFyxO9d3UEA" class="" target="_blank">
                            <img src="/static/img/common/icon_you_b.png" alt="youtube" />
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    </div>

    <div class="contents">
        <div class="bread-comp m-bread-comp">
            <a href="/">HOME</a> /
            <menu:forEach depth="1">
                <c:if test="${status.selected }"><a href="${menu.path}">${menu.name}</a></c:if>
                <menu:forEach depth="2">
                    <c:if test="${status.selected }"> / <a href="${menu.path}">${menu.name}</a></c:if>
                    <menu:forEach depth="3">
                        <c:if test="${status.selected }"> / <a href="${menu.path}">${menu.name}</a></c:if>
                    </menu:forEach>
                </menu:forEach>
            </menu:forEach>

            <c:if test="${additionalBreadComp ne null}">
                <c:forEach items="${additionalBreadComp}" var="menu">
                    / <a href="${menu.path}">${menu.name}</a>
                </c:forEach>
            </c:if>

        </div>
        <div class="content-body">
            <sitemesh:write property="body"/>
        </div>
    </div>
</div>
<div class="scoll-link web_br">
    <ul>
        <li><img src="https://dure.s3.ap-northeast-2.amazonaws.com/data/images/common/shop_01.png" alt="shop_1"/></li>
        <li><a href="http://ecodr.kr/pages/page_1.php" target="_blank"><img src="https://dure.s3.ap-northeast-2.amazonaws.com/data/images/common/shop_02.png" alt="shop_2"/></a></li>
        <li><a href="http://duremall.co.kr/" target="_blank"><img src="https://dure.s3.ap-northeast-2.amazonaws.com/data/images/common/shop_03.png" alt="shop_3"/></a></li>
        <li><a href="https://www.dure-shop.co.kr/" target="_blank"><img src="https://dure.s3.ap-northeast-2.amazonaws.com/data/images/common/shop_04.png" alt="shop_4"/></a></li>

    </ul>
</div>
<div class="scroll-top">
    <div class="scroll-top-div">
        <svg class="scroll-top-icon" style="width:30px;height:30px" viewBox="0 0 24 24">
            <path fill="currentColor" d="M13,20H11V8L5.5,13.5L4.08,12.08L12,4.16L19.92,12.08L18.5,13.5L13,8V20Z" />
        </svg>
    </div>
</div>
<div class="footer">
    <div class="footer-logo-client">
        <div class="footer-logo-client-marquee">
            <img src="https://dure.s3.ap-northeast-2.amazonaws.com/data/images/common/footer-logs.png"/>
        </div>
    </div>
    <div class="footer_div">
        <div class="footer-logo">
            <img src="https://dure.s3.ap-northeast-2.amazonaws.com/data/images/common/logo_footer.png"/>
        </div>
        <div class="footer-content">
            <p class="noto-font">
                주식회사 두레 | 대표: 박종필 | 사업자등록정보: 215-81-71732 | 경기도 이천시 호법면 이섭대천로 759-17
            </p>
            <p class="noto-font">
                Tel : 031-638-7976 | Fax : 031-638-7980 | E-mail : 98dure@hanmail.net
            </p>
            <p class="noto-font">
                주식회사 두레의 허가없이 홈페이지 내의 디자인 및 이미지(사진)등을 무단 사용할 수 없습니다.
            </p>
        </div>
        <div class="footer-eco">
            <ul class="noto-font">
                <li><a href="/privacy">개인정보보호처리방침</a></li>
                <li>|</li>
                <li><a href="/terms">이용약관</a></li>
            </ul>
        </div>
        <div class="footer-mobile">
            <div class="footer-content">
                <p class="noto-font">
                    주식회사 두레 | 대표: 박종필 | 사업자등록정보: 215-81-71732 |<br/>
                    경기도 이천시 호법면 이섭대천로 759-17
                </p>
                <p class="noto-font">
                    Tel : <a href="tel:031-638-7976">031-638-7976</a> | Fax : <a href="tel:031-638-7976">031-638-7980</a> |<br/>
                    E-mail : 98dure@hanmail.net
                </p>
                <p class="noto-font">
                    주식회사 두레의 허가없이 홈페이지 내의 디자인 및 이미지(사진)등을 무단 사용할 수 없습니다.
                </p>
            </div>
            <div class="footer-eco">
                <ul class="noto-font">
                    <li><a href="/privacy">개인정보보호처리방침</a></li>
                    <li>|</li>
                    <li><a href="/terms">이용약관</a></li>
                </ul>
            </div>
        </div>
    </div>
    <div class="footer-copy">
        <p class="din-font">© DURE Co.,Ltd. All Rights Reserved.</p>
    </div>
</div>
<sitemesh:write property="code.scripts-wrap"/><!-- 페이지의 스크립트를 하단부에 둔다. -->

<script>
    <c:if test="${popup != null and popup.get('TOP_BANNER') != null && popup.get('TOP_BANNER').size() > 0}">
    $('.js-top-banner .js-btn-cookie-close').on('click', function() {
        var $btn = $(this);
        var cookieDay = Number($btn.attr('data-day'));
        ubicus.base.util.setCookie('top-banner-' + $btn.attr('data-key'), cookieDay, moment().add(cookieDay - 1, 'day').endOf('day'));
        $btn.closest('.js-top-banner').remove();
    });

    $('.js-top-banner .js-btn-close').on('click', function() {
        $(this).closest('.js-top-banner').remove();
    });
    </c:if>

    $('.global-search-btn').on('keydown', function (e) {
        if (e.keyCode == 13) {
            e.preventDefault();
            location.href = '/product?searchKeyword=' + this.value;
        }
    });

    $('.icon-search-container').on('click', function (e) {
        location.href = '/product?searchKeyword=' + $('.global-search-btn:visible').val();
    });


    function __isMobile() {
        var UserAgent = navigator.userAgent;
        if (UserAgent.match(/iPhone|iPod|Android|Windows CE|BlackBerry|Symbian|Windows Phone|webOS|Opera Mini|Opera Mobi|POLARIS|IEMobile|lgtelecom|nokia|SonyEricsson/i) != null || UserAgent.match(/LG|SAMSUNG|Samsung/) != null) {
            return true;
        } else {
            return false;
        }
    }



    'use strict';

    (function (dure) {

        window.dure = dure;
        var BASKETS_STORAGE_KEY = 'BASKETS_STORAGE';
        var basketData = {};
        var initBasketData = {
            samples: []
        };

        var isLogin = '${appUser}' != 'anonymousUser';

        $('.js-check-login').on('click', function(e) {
            e.preventDefault();

            var $elem = $(this);

            if (isLogin) {
                location.href = $elem.attr('href');
            } else {
                ubicus.base.lib.confirm($elem.text() + ' 메뉴는 로그인이 필요합니다.\n로그인 페이지로 이동하시겠습니까?').then(result => {
                    if (result.isConfirmed) {
                        location.href = '/login';
                    }
                });
            }
        });

        dure.basket = {
            goSamplePage: function goSamplePage() {
                location.href = '/sample';
            },
            addSample: function addSample(product, checkedDetails) {
                var confirmMsg = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

                var index = basketData.samples.findIndex(function (e) {
                    return e.product.prdtKey === product.prdtKey;
                });
                if (index > -1) {
                    basketData.samples.splice(index, 1);
                }
                basketData.samples.push({
                    product: product,
                    details: checkedDetails
                });
                setSamplesStorage();

                if (confirmMsg) {

                    ubicus.base.lib.confirm('샘플신청 리스트에 추가되었습니다.\n샘플신청 페이지로 이동하시겠습니까?', {
                        confirmButtonText: "이동하기",
                        cancelButtonText: "더 둘러보기",
                    }).then(e => {
                        if(e.isConfirmed) {
                            dure.basket.goSamplePage();
                        }
                    })


                    /*if (!confirm('샘플신청 리스트에 추가되었습니다.\n샘플신청 페이지로 이동하시겠습니까?\n[확인]=이동하기 [취소]= 더 둘러보기')) {
                        return;
                    }
                    dure.basket.goSamplePage();*/
                }
            },
            getSamples: function getSamples() {
                return basketData.samples;
            },
            clearSample: function clearSample() {
                basketData.samples = [];
                setSamplesStorage();
            },


            /**
             * var checkedInfo = {'34804654-b305-48fe-9941-dd784bdc84b8':{reqQuantity:5}};
             * var contractInfo = {'cmpnyNm': '유비커스', 'zipCd':'12345','addr': '누리꿈스퀘어', 'email': 'absdf@sadf.com', 'telNo': '01011112222', 'reqUserNm' : '박대영' };
             * dure.basket.requestSample(contractInfo , checkedInfo);
             *
             * @param contractInfo
             * @param checkedInfo
             */
            requestSample: function requestSample() {
                var contractInfo = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
                var checkedInfo = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];


                if (!isLogin) {
                    if (confirm('샘플신청은 로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
                        location.href = '/login';
                    }
                    return;
                }

                if (basketData.samples.length == 0) {
                    ubicus.base.lib.alert('선택된 제품이 존재하지 않습니다');
                    return;
                }

                if (!contractInfo.cmpnyNm) {
                    ubicus.base.lib.alert('회사명은 필수값입니다.');
                    return;
                }

                if (!contractInfo.zipCd) {
                    ubicus.base.lib.alert('우편번호는 필수값입니다.');
                    return;
                }

                if (!contractInfo.addr) {
                    ubicus.base.lib.alert('주소는 필수값입니다.');
                    return;
                }

                if (!contractInfo.email) {
                    ubicus.base.lib.alert('이메일은 필수값입니다.');
                    return;
                }

                if (!contractInfo.reqUserNm) {
                    ubicus.base.lib.alert('담당자명은 필수값입니다.');
                    return;
                }

                if (!contractInfo.telNo) {
                    ubicus.base.lib.alert('연락처는 필수값입니다.');
                    return;
                }

                var productSampleDetail = [];

                basketData.samples.forEach(function (sample) {
                    sample.details.forEach(function (detail) {
                        productSampleDetail.push({
                            prdtNo: sample.product.prdtNo,
                            prdtDtNo: detail.prdtDtNo,
                            reqQuantity: checkedInfo[sample.product.prdtKey].reqQuantity
                        });
                    });
                });

                xAjaxJson({
                    url: '/productSample',
                    method: 'POST',
                    data: {
                        cmpnyNm: contractInfo.cmpnyNm,
                        zipCd: contractInfo.zipCd,
                        addr: contractInfo.addr,
                        addr2: contractInfo.addr2,
                        email: contractInfo.email,
                        telNo: contractInfo.telNo,
                        reqUserNm: contractInfo.reqUserNm,
                        productSampleDetails: productSampleDetail
                    }
                }).then(function (e) {
                    dure.basket.clearSample();
                    location.href = '/sample/sampleList';
                });
            }
        };
        dure.isLogin = isLogin;

        var setSamplesStorage = function setSamplesStorage() {
            window.localStorage.setItem(BASKETS_STORAGE_KEY, JSON.stringify(basketData));
        };

        var init = function init() {
            var storageValue = window.localStorage.getItem(BASKETS_STORAGE_KEY);
            if (storageValue) {
                try {
                    Object.assign(basketData, JSON.parse(storageValue));
                } catch (ignore) {
                    Object.assign(basketData, initBasketData);
                }
            } else {
                Object.assign(basketData, initBasketData);
            }
        };

        init();
    })(window.dure || {});


</script>

</body>
</html>
