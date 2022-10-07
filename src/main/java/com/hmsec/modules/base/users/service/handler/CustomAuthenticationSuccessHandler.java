package com.hmsec.modules.base.users.service.handler;


import com.hmsec.modules.base.users.model.AppUser;
import com.hmsec.modules.base.users.service.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.DefaultRedirectStrategy;
import org.springframework.security.web.RedirectStrategy;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.savedrequest.HttpSessionRequestCache;
import org.springframework.security.web.savedrequest.RequestCache;
import org.springframework.security.web.savedrequest.SavedRequest;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;


@Slf4j
public class CustomAuthenticationSuccessHandler implements AuthenticationSuccessHandler {
    @Autowired
    UserDetailsServiceImpl userDetailsService;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    UserRepository userRepository;

    private final String defaultUrl;
    private final RequestCache requestCache = new HttpSessionRequestCache();
    private final RedirectStrategy redirectStratgy = new DefaultRedirectStrategy();

    public CustomAuthenticationSuccessHandler(String defaultUrl) {
        this.defaultUrl = defaultUrl;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {

        String tempPw = "";

        SavedRequest savedRequest = requestCache.getRequest(request, response);
        AppUser appUser = (AppUser) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        tempPw = appUser.getPassword();
        String id = appUser.getUsername();
        String encodeId = passwordEncoder.encode(id);
        int errorNum = 0;




        if (appUser.getPwErrCnt() > 6) {
            this.logout(request, response);
            errorNum = 2;
            redirectStratgy.sendRedirect(request, response, "/login?error=" + errorNum);
        } else if (encodeId.equals(tempPw)) {
            errorNum = 6;
            request.setAttribute("error", errorNum);
            request.setAttribute("empNo", appUser.getUserNo());
            request.setAttribute("userId", appUser.getUsername());
            request.getRequestDispatcher("/changePassword").forward(request, response);
        } else {
            // 로그인 오류 count 초기화
            userRepository.resetPasswordCnt(appUser.getUserNo());

            if (savedRequest != null) {
                String targetUrl = savedRequest.getRedirectUrl();
                if (targetUrl.endsWith("/error") || targetUrl.contains("/ws-stomp")) {
                    log.error("savedRequest.getRedirectUrl() is {}", targetUrl);
                    targetUrl = defaultUrl;
                }

                redirectStratgy.sendRedirect(request, response, targetUrl);
            } else {
                redirectStratgy.sendRedirect(request, response, defaultUrl);
            }
        }
    }

    public void logout(HttpServletRequest request, HttpServletResponse response) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            new SecurityContextLogoutHandler().logout(request, response, auth);
        }
    }
}
