package com.hmsec.moweb.resolver;

import com.hmsec.modules.base.users.model.AppManager;
import com.hmsec.modules.base.users.model.AppUser;
import org.springframework.core.MethodParameter;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

public class AppManagerArgumentResolver implements HandlerMethodArgumentResolver {
    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        if (parameter.getParameterAnnotation(RequestPart.class) != null
                || parameter.getParameterAnnotation(RequestBody.class) != null) {
            return false;
        }

        return parameter.getParameterType().isAssignableFrom(AppManager.class);
    }

    /**
     *
     * @param methodParameter
     * @param modelAndViewContainer
     * @param nativeWebRequest
     * @param webDataBinderFactory
     * @return
     * @throws Exception
     */
    @Override
    public Object resolveArgument(MethodParameter methodParameter, ModelAndViewContainer modelAndViewContainer,
                                  NativeWebRequest nativeWebRequest, WebDataBinderFactory webDataBinderFactory) throws Exception {

        Object principal = null;
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null) {
            principal = authentication.getPrincipal();
        }
        if (!(principal instanceof UserDetails)) {
            throw new AuthenticationServiceException("해당 페이지에 접근할 수 없습니다.");
        }

        AppManager appManager = (AppManager) principal;
        if (appManager.getUserTp() != AppUser.UserTp.ADMIN) {
            throw new AuthenticationServiceException("해당 페이지에 접근할 수 없습니다.");
        }

        return appManager;
    }
}
