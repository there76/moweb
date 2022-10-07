package com.hmsec.common.error.handler;


import com.hmsec.common.error.BusinessException;
import com.hmsec.common.error.ErrorCode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.error.ErrorAttributeOptions;
import org.springframework.boot.web.servlet.error.DefaultErrorAttributes;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.security.Principal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


public class AbstractExceptionHandler {
    public static final String SPACE = " ";
    public static final String LF = "\n";

    protected static final Logger LOGGER = LoggerFactory.getLogger("ExceptionHandler");

    @Value("${apps.error.page:common/error}")
    private String errorPage;

    @Autowired
    protected Environment environment;

    protected Object response(final HttpServletRequest req, final HttpServletResponse resp,
                              final HandlerMethod handlerMethod, final Exception ex, final Map<String, Object> body
    ) {
        StringBuilder sb = new StringBuilder();
        sb.append(ex.getClass().getName()).append(LF);
        makeErrorLogFromReqeust(req, sb);
        LOGGER.error(sb.toString(), ex);

        HttpStatus httpStatus;
        try {
            if(ex instanceof BusinessException){
                ErrorCode errorCode = ((BusinessException) ex).getErrorCode();
                httpStatus = HttpStatus.valueOf(errorCode.getStatus());
                body.put("error", errorCode.getMessage());
            }else{
                httpStatus = HttpStatus.valueOf((Integer) body.get("status"));
                body.put("error", httpStatus.getReasonPhrase());
            }
        } catch (IllegalArgumentException ise) {
            httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
            body.put("error", httpStatus.getReasonPhrase());
        }

        body.put("status", httpStatus.value());
        int status = httpStatus.value();

        RestController classAnnotation = handlerMethod.getMethod().getDeclaringClass().getAnnotation(RestController.class);
        ResponseBody methodAnnotation = handlerMethod.getMethodAnnotation(ResponseBody.class);
        if (classAnnotation != null || methodAnnotation != null) {
            return new ResponseEntity<>(body, HttpStatus.valueOf(status));
        } else {
            resp.setStatus(status);
            return new ModelAndView(errorPage, body);
        }
    }

    protected Map<String, Object> getStringObjectMap(HttpServletRequest req) {
        return getStringObjectMap(new ServletWebRequest(req));
    }

    protected Map<String, Object> getStringObjectMap(WebRequest webRequest) {
        DefaultErrorAttributes errorAttributes = new DefaultErrorAttributes();
        return errorAttributes.getErrorAttributes(webRequest, ErrorAttributeOptions.of(ErrorAttributeOptions.Include.values()));
    }

    protected String getStackTrace(Throwable e) {
        StringWriter sw = new StringWriter();
        e.printStackTrace(new PrintWriter(sw));
        return sw.toString();
    }

    private void makeErrorLogFromReqeust(HttpServletRequest req, StringBuilder sb) {
        sb.append(req.getRemoteAddr()).append(SPACE).append(req.getRequestedSessionId()).append(SPACE);
        sb.append(req.getMethod()).append(SPACE).append(req.getRequestURI());
        if (req.getQueryString() != null) {
            sb.append("?").append(req.getQueryString());
        }
        sb.append(LF);//IP SESSIONID METHOD URL

        Principal principal = req.getUserPrincipal();
        if (principal != null && ((Authentication) principal).getPrincipal() != null) {
            sb.append(((Authentication) principal).getPrincipal());
        } else {
            sb.append("Not Authenticated User");
        }
        sb.append(LF);//사용자 정보


        LocaleContextHolder.getTimeZone();
        LocaleContextHolder.getLocale();
    }

    protected boolean isDevProfiles() {
        return Arrays.stream(environment.getActiveProfiles())
                .anyMatch(env -> (env.equalsIgnoreCase("dev") || env.equalsIgnoreCase("local")));
    }

    public static class FieldError {
        private final String field;
        private final String value;
        private final String reason;

        private FieldError(final String field, final String value, final String reason) {
            this.field = field;
            this.value = value;
            this.reason = reason;
        }

        public String getField() {
            return field;
        }

        public String getValue() {
            return value;
        }

        public String getReason() {
            return reason;
        }

        public static List<FieldError> of(final String field, final String value, final String reason) {
            List<FieldError> fieldErrors = new ArrayList<>();
            fieldErrors.add(new FieldError(field, value, reason));
            return fieldErrors;
        }

        public static List<FieldError> of(final BindingResult bindingResult) {
            final List<org.springframework.validation.FieldError> fieldErrors = bindingResult.getFieldErrors();
            return fieldErrors.stream()
                    .map(error -> new FieldError(error.getField(),
                            error.getRejectedValue() == null ? "null" : error.getRejectedValue().toString(),
                            error.getDefaultMessage()))
                    .collect(Collectors.toList());
        }

        @Override
        public String toString() {
            return "FieldError [field=" + field + ", value=" + value + ", reason=" + reason + "]";
        }
    }
}
