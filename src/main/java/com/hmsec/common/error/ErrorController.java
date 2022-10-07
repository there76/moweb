package com.hmsec.common.error;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.web.ServerProperties;
import org.springframework.boot.autoconfigure.web.servlet.error.BasicErrorController;
import org.springframework.boot.autoconfigure.web.servlet.error.ErrorViewResolver;
import org.springframework.boot.web.servlet.error.ErrorAttributes;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.List;
import java.util.Map;

/**
 * [오류 처리에 대해](https://supawer0728.github.io/2019/04/04/spring-error-handling/)
 * [custom error page](https://medium.com/@hyunalee419/spring-boot-custom-error-page-4258cd37f05c)
 * [Spring Guide - Exception 전략](https://cheese10yun.github.io/spring-guide-exception/)
 * [REST API Error Handling](https://www.toptal.com/java/spring-boot-rest-api-error-handling)
 * [whitelabel](https://goddaehee.tistory.com/214)
 */

@Slf4j
@Controller
@RequestMapping("${server.error.path:${error.path:/error}}")
public class ErrorController extends BasicErrorController {

    @Value("${apps.error.page:common/error}")    //30초
    private String errorPage;

    private MessageSource messageSource;

    @Autowired
    public void setMessageSource(MessageSource messageSource) {
        this.messageSource = messageSource;
    }

    public ErrorController(ErrorAttributes errorAttributes, ServerProperties serverProperties, List<ErrorViewResolver> errorViewResolvers) {
        super(errorAttributes, serverProperties.getError(), errorViewResolvers);
    }

    @RequestMapping(produces = MediaType.TEXT_HTML_VALUE)
    public ModelAndView errorHtml(HttpServletRequest request, HttpServletResponse response) {
        ModelAndView modelAndView = super.errorHtml(request, response);

        setDefaultPropertyInBody(modelAndView.getModel(), request);

        modelAndView.setViewName(errorPage);
        System.out.println(modelAndView);
        return modelAndView;
    }

    @Override
    public ResponseEntity<Map<String, Object>> error(HttpServletRequest request) {
        ResponseEntity<Map<String, Object>> ret = super.error(request);

        setDefaultPropertyInBody(ret.getBody(), request);

        return ret;
    }

    private void setDefaultPropertyInBody(Map<String, Object> body, HttpServletRequest request) {
        //{timestamp=Tue Jul 28 00:42:23 KST 2020, status=404, error=Not Found, message=No message available, path=/groupware/sample/dispatch/notFoundPage}

        if (body != null) {
            //날짜를 보기 쉬운 포맷으로
            String formatTimeStamp = getFormatTime((Date) body.get("timestamp"));
            if (formatTimeStamp != null) {
                body.put("timestampF", formatTimeStamp);
            }

            //status별 메시지
            Integer status = (Integer) body.get("status");
            if (status != null) {
                if (status == 404) {
                    String error404Message = "요청하신 페이지를 찾을 수 없습니다.";
                    if (messageSource != null) {
                        error404Message = messageSource.getMessage("apps.error.status.404", null, error404Message, LocaleContextHolder.getLocale());
                    }

                    body.put("message", error404Message);
                }
            }
        }
    }

    private String getFormatTime(Long timestamp) {
        if (timestamp != null) {
            LocalDateTime ldt = Instant.ofEpochMilli(timestamp).atZone(ZoneId.systemDefault()).toLocalDateTime();
            return ldt.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        }

        return null;
    }

    private String getFormatTime(Date timestamp) {
        if (timestamp != null) {
            return getFormatTime(timestamp.getTime());
        }
        return null;
    }
}
