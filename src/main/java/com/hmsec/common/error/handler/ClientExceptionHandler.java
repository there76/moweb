package com.hmsec.common.error.handler;

import com.hmsec.common.error.exception.NotAllowedFileExtensionException;
import com.hmsec.utils.MessagesUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.ConversionNotSupportedException;
import org.springframework.beans.TypeMismatchException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.http.converter.HttpMessageNotWritableException;
import org.springframework.validation.BindException;
import org.springframework.validation.BindingResult;
import org.springframework.web.HttpMediaTypeNotAcceptableException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingPathVariableException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.ServletRequestBindingException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.async.AsyncRequestTimeoutException;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import org.springframework.web.servlet.NoHandlerFoundException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Map;

@ControllerAdvice
@Slf4j
public class ClientExceptionHandler extends AbstractExceptionHandler {
    @Value("${spring.servlet.multipart.max-file-size:10MB}")
    private String maxFileSize;

    @Value("${spring.servlet.multipart.max-request-size:100MB}")
    private String maxRequestSize;

    //org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler
    @ExceptionHandler({
            HttpRequestMethodNotSupportedException.class,   //405:요청 경로는 있으나 지원하지 않는 Method인 경우 발생
            HttpMediaTypeNotSupportedException.class,       //415:요청의 Content Type을 핸들러가 지원하지 않는 경우 발생
            HttpMediaTypeNotAcceptableException.class,      //406:핸들러가 Client가 요청한 Type으로 응답을 내려줄 수 없는 경우 발생
            MissingPathVariableException.class,             //500:핸들러가 URL에서 기대한 Path Variable을 찾지 못한 경우 발생
            MissingServletRequestParameterException.class,  //400:핸들러가 기대한 요청 Parameter를 찾지 못한 경우 발생
            ServletRequestBindingException.class,           //400:복구 불가능한 치명적인 간주할 binding exception Filter 등의 Servlet Resource에서 던지기 쉽도록 ServletException을 상속하고 있음
            ConversionNotSupportedException.class,          //500:bean property로 요청 내용을 변경하기 위한 editor 혹은 converter를 찾지 못한 경우 발생
            TypeMismatchException.class,                    //400:bean property로 값을 변경할 때, 핸들러가 예상한 class로 변경할 수 없는 경우 발생
            HttpMessageNotReadableException.class,          //400:HttpMessageConverter에서 발생하며 read 메서드가 실패한 경우 발생
            HttpMessageNotWritableException.class,          //500:HttpMessageConverter에서 발생하며 write 메서드가 실패한 경우 발생
            MethodArgumentNotValidException.class,          //400:@Valid가 붙은 파라미터에 대해 검증 실패시 발생
            MissingServletRequestPartException.class,       //400:multipart/form-data 요청의 일부가 손실(can’t be found)되었을 때 발생
            BindException.class,                            //400:@ModelAttribute 으로 binding error 발생시 BindException 발생한다. 만약 메서드에서  BindingResult result를 인자로 받는 다면 에러가 발생하지 않고 각자 처리 한다.
            NoHandlerFoundException.class,                  //404:Dispatcher Servlet에서 핸들러를 찾지 못한 경우 기본적으로 404 응답을 내리지만 Dispatcher Servlet의 throwExceptionIfNoHandlerFound 값이 true인 경우 해당 예외를 발생
            AsyncRequestTimeoutException.class,             //503:비동기 요청의 응답시간이 초과될 때 발생
    })

    public Object handleException(final HttpServletRequest req, final HttpServletResponse resp,
                                  final HandlerMethod handlerMethod, final Exception ex) {
        HttpHeaders headers = new HttpHeaders();

        Map<String, Object> body = getStringObjectMap(req);
        body.put("message", ex.getMessage());
        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
        if (ex instanceof HttpRequestMethodNotSupportedException) {
            status = HttpStatus.METHOD_NOT_ALLOWED;
        } else if (ex instanceof HttpMediaTypeNotSupportedException) {
            status = HttpStatus.UNSUPPORTED_MEDIA_TYPE;

            HttpMediaTypeNotSupportedException e = (HttpMediaTypeNotSupportedException) ex;
            StringBuilder builder = new StringBuilder();
            builder.append(e.getContentType());
            builder.append(" media type is not supported. Supported media types are ");
            e.getSupportedMediaTypes().forEach(t -> builder.append(t).append(", "));

            body.put("message", builder.substring(0, builder.length() - 2).toString());

        } else if (ex instanceof HttpMediaTypeNotAcceptableException) {
            status = HttpStatus.NOT_ACCEPTABLE;
        } else if (ex instanceof MissingPathVariableException) {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
        } else if (ex instanceof MissingServletRequestParameterException) {
            //@RequestParam 으로 바인딩 할때 요구된 값이 존재하지 않는 경우
            status = HttpStatus.BAD_REQUEST;
            MissingServletRequestParameterException e = (MissingServletRequestParameterException) ex;
            body.put("errors", FieldError.of(e.getParameterName(), null, e.getMessage()));
        } else if (ex instanceof ServletRequestBindingException) {
            status = HttpStatus.BAD_REQUEST;
        } else if (ex instanceof ConversionNotSupportedException) {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
        } else if (ex instanceof TypeMismatchException) {//MethodArgumentTypeMismatchException
            //@RequestParam 으로 바인딩 할때 요구한 타입과 다른 경우
            status = HttpStatus.BAD_REQUEST;
            TypeMismatchException e = (TypeMismatchException) ex;

            String name = e.getPropertyName();
            String value = (String) e.getValue();
            String reason = e.getErrorCode() + ". [" + name + "=" + value + "] should be ";
            if (e.getRequiredType() == null) {
                reason += e.getRequiredType() + " type";
            } else {
                reason += e.getRequiredType().getSimpleName() + " type";
            }

            //String.format("The parameter '%s' of value '%s' could not be converted to type '%s'", ex.getName(), ex.getValue(), ex.getRequiredType().getSimpleName())
            body.put("errors", FieldError.of(name, value, reason));
        } else if (ex instanceof HttpMessageNotReadableException) {
            status = HttpStatus.BAD_REQUEST;
        } else if (ex instanceof HttpMessageNotWritableException) {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
        } else if (ex instanceof MethodArgumentNotValidException) {
            //javax.validation.Valid or @Validated 으로 binding error 발생
            status = HttpStatus.BAD_REQUEST;
            BindingResult bindingResult = ((MethodArgumentNotValidException) ex).getBindingResult();
            body.put("errors", FieldError.of(bindingResult));
        } else if (ex instanceof MissingServletRequestPartException) {
            status = HttpStatus.BAD_REQUEST;
        } else if (ex instanceof BindException) {
            //@ModelAttribute 으로 binding error 발생시 BindException 발생
            status = HttpStatus.BAD_REQUEST;
            BindingResult bindingResult = ((BindException) ex).getBindingResult();
            body.put("errors", FieldError.of(bindingResult));
        } else if (ex instanceof NoHandlerFoundException) {
            //String.format("Could not find the %s method for URL %s", ex.getHttpMethod(), ex.getRequestURL())
            status = HttpStatus.NOT_FOUND;
        } else if (ex instanceof AsyncRequestTimeoutException) {
            status = HttpStatus.SERVICE_UNAVAILABLE;
        }


        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());

        return response(req, resp, handlerMethod, ex, body);
    }

    @ExceptionHandler(MultipartException.class)
    public Object handleMultipartException(final HttpServletRequest req, final HttpServletResponse resp,
                                           final HandlerMethod handlerMethod, final MultipartException e) {
        Map<String, Object> body = getStringObjectMap(req);


        String simpleName = e.getClass().getSimpleName();
        String message;
        if (e instanceof MaxUploadSizeExceededException) {
            log.debug("MaxUploadSizeExceededException {}", e.getMessage());
            message = MessagesUtils.getExceptionMessage(simpleName, new String[]{maxFileSize});
        } else if (e instanceof NotAllowedFileExtensionException) {
            log.debug("NotAllowedFileExtensionException {}", e.getMessage());
            message = MessagesUtils.getExceptionMessage(simpleName);
        } else {
            log.error("MultipartException", e);
            message = MessagesUtils.getExceptionMessage("FileUploadException", "File Upload Failed.");
        }
        HttpStatus status = HttpStatus.BAD_REQUEST;
        body.put("message", message);
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        return response(req, resp, handlerMethod, e, body);
    }
}
