package com.hmsec.moweb.config;

import com.hmsec.modules.base.users.service.handler.CustomAuthenticationFailureHandler;
import com.hmsec.modules.base.users.service.handler.CustomAuthenticationSuccessHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.security.servlet.PathRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.builders.WebSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.firewall.FirewalledRequest;
import org.springframework.security.web.firewall.HttpFirewall;
import org.springframework.security.web.firewall.RequestRejectedException;
import org.springframework.security.web.firewall.StrictHttpFirewall;

import javax.servlet.http.HttpServletRequest;


/**
 * Web Security 설정
 * https://velog.io/@tlatldms/Spring-boot-Spring-security-JWT-Redis-mySQL-2%ED%8E%B8
 * https://yookeun.github.io/java/2017/07/23/spring-jwt/
 */
@RequiredArgsConstructor
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {


    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
                .httpBasic()

                .and()

                //.exceptionHandling().authenticationEntryPoint(new CustomAuthenticationEntryPoint())
                .csrf().disable() // rest api이므로 csrf 보안이 필요없으므로 disable처리.
                .headers()
                .frameOptions().sameOrigin(); // SockJS는 기본적으로 HTML iframe 요소를 통한 전송을 허용하지 않도록 설정되는데 해당 내용을 해제한다.



        http.authorizeRequests()
                // 페이지 권한 설정
                .antMatchers("/admin/**").hasRole("ADMIN")
                .antMatchers("/user/**").hasRole("USER")
                .antMatchers("/consulting").hasRole("USER")
                .antMatchers("**/**").permitAll();

        // 2. 로그인 설정
        http.formLogin()// 권한없이 페이지 접근하면 로그인 페이지로 이동한다.
                .permitAll()
                .loginPage("/login")    // 로그인 페이지 url
                .usernameParameter("userId")
                .successHandler(customAuthenticationSuccessHandler())
                .failureHandler(customAuthenticationFailureHandler())
        ;

        //@Async를 처리하는 쓰레드에서도 SecurityContext를 공유받을 수 있다.
        SecurityContextHolder.setStrategyName(SecurityContextHolder.MODE_INHERITABLETHREADLOCAL);
    }

    @Bean
    public AuthenticationSuccessHandler customAuthenticationSuccessHandler() {
        String defaultUrl = "/";
        return new CustomAuthenticationSuccessHandler(defaultUrl);
    }

    @Bean
    public AuthenticationFailureHandler customAuthenticationFailureHandler() {
        return new CustomAuthenticationFailureHandler();
    }


    // favicon 요청등 정적인 요청 처리 시 필터 등록 제외
    @Override
    public void configure(WebSecurity web) throws Exception {
        //super.configure(web);
        web.httpFirewall(allowUrlEncodedSlashHttpFirewall());
        web.ignoring().requestMatchers(PathRequest.toStaticResources().atCommonLocations());
    }

    @Bean
    public HttpFirewall allowUrlEncodedSlashHttpFirewall() {
        CustomStrictHttpFirewall firewall = new CustomStrictHttpFirewall();
        firewall.setAllowUrlEncodedSlash(true);
        return firewall;
    }

    @Slf4j
    public static class CustomStrictHttpFirewall extends StrictHttpFirewall {

        @Override
        public FirewalledRequest getFirewalledRequest(HttpServletRequest request) throws RequestRejectedException {
            try {
                return super.getFirewalledRequest(request);
            } catch (RequestRejectedException re) {
                log.error("getFirewalledRequest", re);
                throw re;
            }
        }
    }
}
