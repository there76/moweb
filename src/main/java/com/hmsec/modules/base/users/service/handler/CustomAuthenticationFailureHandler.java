package com.hmsec.modules.base.users.service.handler;


import com.hmsec.modules.base.users.model.AppUser;
import com.hmsec.modules.base.users.service.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.security.authentication.*;
import org.springframework.security.authentication.event.AuthenticationFailureBadCredentialsEvent;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.DefaultRedirectStrategy;
import org.springframework.security.web.RedirectStrategy;
import org.springframework.security.web.WebAttributes;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

//org.springframework.security.web.authentication.ui.DefaultLoginPageGeneratingFilter

//org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler

@Slf4j
public class CustomAuthenticationFailureHandler implements AuthenticationFailureHandler, ApplicationListener<AuthenticationFailureBadCredentialsEvent> {

    @Autowired
    UserRepository userRepository;

    private RedirectStrategy redirectStratgy = new DefaultRedirectStrategy();

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response, AuthenticationException e) throws IOException, ServletException {
        log.error("onAuthenticationFailure", e);


        String userId = request.getParameter("userId");

        AppUser appUser = userRepository.findByUserIdForLogin(userId);

        int errorNum = 0;
        if (e instanceof BadCredentialsException) {//자격 증명에 실패하였습니다. (패스워드 틀림, 해당 아이디 없음)
            errorNum = 1;
            userRepository.plusPasswordCnt(appUser);
        } else if (e instanceof LockedException) { //사용자 계정이 잠겨 있습니다. (비밀번호 여러번 틀림)
            errorNum = 2;
        } else if (e instanceof CredentialsExpiredException) {//자격 증명 유효 기간이 만료되었습니다. (비밀번호 변경일자 지남)
            errorNum = 3;
        } else if (e instanceof DisabledException) {//유효하지 않은 사용자입니다. (퇴사 했음)
            errorNum = 4;
        } else if (e instanceof AccountExpiredException) {//사용자 계정의 유효 기간이 만료 되었습니다.(한시적 기간 사용자 종료)
            errorNum = 5;
        } else {//기타
            errorNum = 6;
        }

        //userRepository.failureLoginInfo(appuser);
        if(errorNum == 3) {
            request.setAttribute("error", errorNum);
            request.setAttribute("id", appUser.getUserNo());
            request.setAttribute("userId", userId);

            request.getRequestDispatcher("/changePassword").forward(request, response);

        } else {
            request.getSession().setAttribute(WebAttributes.AUTHENTICATION_EXCEPTION, e);
            redirectStratgy.sendRedirect(request, response, "/login?error=" + errorNum);
        }
    }

    @Override
    public void onApplicationEvent(AuthenticationFailureBadCredentialsEvent event) {
        Object userName = event.getAuthentication().getPrincipal();
        Object credentials = event.getAuthentication().getCredentials();
        log.debug("Failed login using USERNAME [" + userName + "]");
        log.debug("Failed login using PASSWORD [" + credentials + "]");
    }
}
