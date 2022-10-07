<!DOCTYPE html>
<%@ page trimDirectiveWhitespaces="true" language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="menu" uri="http://www.ubicus.com/sitemesh" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<!--[if lte IE 7 ]><html class="lt-ie9 lt-ie8" lang="ko-KR"><![endif]-->
<!--[if IE 8 ]><html class="lt-ie9" lang="ko-KR"><![endif]-->
<!--[if (gte IE 9)|!(IE)]><!--><html lang="ko-KR"><!--<![endif]-->
<head>
    <meta http-equiv="Content-Type" content="text/html;charset=UTF-8"/>
    <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
    <meta http-equiv="Cache-control" content="public"/>
    <meta name="viewport"
          content="width=device-width,initial-scale=1.0,minimum-scale=0,maximum-scale=10,user-scalable=yes">
    <meta name="author" content="dure">
    <meta name="description" content="durepack sales wabsite">
    <meta http-equiv="Expires" content="-1">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Cache-Control" content="No-Cache">
    <title><sitemesh:write property="title"/></title>

    <script src="/webjars/momentjs/2.29.1/min/moment.min.js"></script>
    <script src="/webjars/jquery/3.6.0/jquery.min.js"></script>
    <script src="/webjars/vue/2.6.14/vue.min.js"></script>
    <script src="/webjars/vuetify/2.5.8/dist/vuetify.min.js"></script>
    <script src="/webjars/jstree/3.3.11/jstree.min.js"></script>
    <script src="/static/lib/ubicus.base.util.js"></script>
    <script src="/static/lib/ubicus.base.lib.js"></script>
    <script src="/static/lib/ubicus.base.ui.js"></script>
    <script src="/static/lib/ubicus.base.vue.js"></script>

    <link rel="stylesheet" href="/webjars/jstree/3.3.11/themes/default/style.min.css"/>
    <link rel="stylesheet" href="/webjars/vuetify/2.5.8/dist/vuetify.min.css"/>
    <link rel="stylesheet" href="/webjars/material-design-icons/4.0.0/material-icons.css"/>

    <sitemesh:write property="head"/>

</head>
<body>
<div>
    <sitemesh:write property="body"/>
</div>
<sitemesh:write property="code.scripts-wrap"/><!-- 페이지의 스크립트를 하단부에 둔다. -->

</body>
</html>