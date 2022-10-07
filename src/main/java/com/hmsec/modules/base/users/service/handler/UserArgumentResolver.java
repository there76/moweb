package com.hmsec.modules.base.users.service.handler;


import com.hmsec.modules.base.users.model.AppUser;
import com.hmsec.utils.CommonUtils;
import org.springframework.core.MethodParameter;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

import javax.servlet.http.HttpServletRequest;

public class UserArgumentResolver implements HandlerMethodArgumentResolver {
    @Override
    public boolean supportsParameter(MethodParameter parameter) {

        if (parameter.getParameterAnnotation(RequestPart.class) != null
                || parameter.getParameterAnnotation(RequestBody.class) != null) {
            return false;
        }

        return parameter.getParameterType().isAssignableFrom(AppUser.class);
    }

    @Override
    public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer, NativeWebRequest webRequest, WebDataBinderFactory binderFactory) throws Exception {
        return UserArgumentResolver.getAppUser();
    }

    public static AppUser getAppUser(){
        Object principal = null;
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();

        if (authentication != null) {
            principal = authentication.getPrincipal();
        }

        AppUser user;
        if (!(principal instanceof UserDetails)) {
            user = new AppUser();
            user.setUserTp(AppUser.UserTp.ANONYMOUS);
        } else {
            user = (AppUser) principal;
        }
        user.setRequestIp(CommonUtils.getClientIP(request));
        return user;
    }
}
