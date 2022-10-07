package com.hmsec.common.error.handler;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataAccessException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.method.HandlerMethod;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Map;
import java.util.Set;


@ControllerAdvice
@Slf4j
public class ServerExceptionHandler extends AbstractExceptionHandler {

    @Value("${spring.profiles.active:Unknown}")
    private Set activeProfileSet;

    @ExceptionHandler(value = {DataAccessException.class})
    public Object handleException(final HttpServletRequest req, final HttpServletResponse resp,
                                  final HandlerMethod handlerMethod, final DataAccessException ex) {
        Map<String, Object> body = getStringObjectMap(req);
        String exMessage = ex.getMostSpecificCause().getMessage();
        String message = "데이터 처리 중 에러가 발생 하였습니다.";
        if(exMessage != null && exMessage.contains("Duplicate entry")){
            int keyIndex = exMessage.indexOf(" for key");
            if(keyIndex>-1){
                message = exMessage.substring(0, keyIndex);
            }else{
                message = "해당 데이터는 이미 존재합니다.";
            }
        }

        if(activeProfileSet.contains("local")){
            message = exMessage;
        }

        body.put("message", message);
        return response(req, resp, handlerMethod, ex, body);
    }

    @ExceptionHandler(value = {Exception.class})
    public Object handleException(final HttpServletRequest req, final HttpServletResponse resp,
                                  final HandlerMethod handlerMethod, final Exception ex) {
        Map<String, Object> body = getStringObjectMap(req);

        body.put("message", ex.getMessage());

        return response(req, resp, handlerMethod, ex, body);
    }
}
