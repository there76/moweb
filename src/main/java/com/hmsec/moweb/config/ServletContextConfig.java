package com.hmsec.moweb.config;


import com.hmsec.common.file.service.FileService;
import com.hmsec.modules.base.users.service.handler.UserArgumentResolver;
import com.hmsec.moweb.resolver.AppManagerArgumentResolver;
import com.hmsec.moweb.resolver.file.AttachFileResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.web.servlet.WebMvcProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.filter.FormContentFilter;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.i18n.CookieLocaleResolver;
import org.springframework.web.servlet.i18n.LocaleChangeInterceptor;
import org.springframework.web.servlet.resource.ResourceUrlEncodingFilter;
import org.springframework.web.servlet.resource.VersionResourceResolver;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.util.*;


@Configuration
@RequiredArgsConstructor
@EnableConfigurationProperties(WebMvcProperties.class)
public class ServletContextConfig implements WebMvcConfigurer {

    @Value("${apps.upload.publicUrl}")
    private String publicUrl;

    @Value("${apps.upload.root}")
    private String uploadRoot;

    @Value("${apps.upload.allowedUploadExtensions}")
    private String allowedUploadExtensions = "";

    @Value("${apps.upload.allowedAccessExtensions}")
    private String allowedAccessExtensions = "";

    private final FileService fileService;


    @Bean
    public PasswordEncoder passwordEncoder() {
        return new CustomPasswordEncoder();
    }

    /**
     * 변경된 언어 정보를 기억할 로케일 리졸버를 생성한다.
     * 여기서는 쿠키에 저장하는 방식을 사용한다.
     */
    @Bean
    public LocaleResolver localeResolver() {
        //default AcceptHeaderLocaleResolver
        //CookieLocaleResolver
        return new CookieLocaleResolver();
    }

    @Bean // 지역설정을 변경하는 인터셉터. 요청시 파라미터에 lang 정보를 지정하면 언어가 변경됨.
    public LocaleChangeInterceptor localeChangeInterceptor() {
        LocaleChangeInterceptor lci = new LocaleChangeInterceptor();
        lci.setParamName("lang");
        return lci;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(localeChangeInterceptor());
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**").allowedOrigins("*").allowedMethods("*");
    }

    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
        resolvers.add(new UserArgumentResolver());
        resolvers.add(new AppManagerArgumentResolver());
        resolvers.add(new AttachFileResolver(fileService, uploadRoot, publicUrl, new HashSet(Arrays.asList(allowedUploadExtensions.split(",")))));

        WebMvcConfigurer.super.addArgumentResolvers(resolvers);
    }

    //https://moonscode.tistory.com/125
    //https://dzone.com/articles/2-step-resource-versioning-with-spring-mvc
    //-Dspring.profiles.active=prod
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        if (!registry.hasMappingForPattern("/webjars/**")) {
            registry.addResourceHandler("/webjars/**").addResourceLocations("/webjars/");
        }

        //static 폴더 cache관련 설정 제거
        VersionResourceResolver versionResourceResolver =
                new VersionResourceResolver().addContentVersionStrategy("/**");

        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/static/");

        registry.addResourceHandler("/favicon.ico").addResourceLocations("classpath:static/favicon.ico");

        registry.addResourceHandler("/robots.txt").addResourceLocations("classpath:static/webMaster/robots.txt");

        registry.addResourceHandler("/sitemap.xml").addResourceLocations("classpath:static/webMaster/sitemap.xml");


        Set<String> allowedExtensionSet = new HashSet<>(Arrays.asList(allowedAccessExtensions.split(",")));
        registry.addResourceHandler(publicUrl + "/**")
                .addResourceLocations(uploadRoot + publicUrl + "/");
    }
/*
    //VersionResourceResolver와 같이 처리되어  1번을 2번으로표시
    //1. <script src="<c:url value="/static/js/cowork.sample.js" />"></script>
    //2. <script src="/static/js/cowork.sample-dae281f68f432dbf8b9e5ea8056eb86c.js"></script>
    @Bean
    public FilterRegistrationBean<ResourceUrlEncodingFilter> resourceUrlEncodingFilterBean() {
        FilterRegistrationBean<ResourceUrlEncodingFilter> filterRegistration = new FilterRegistrationBean<>();

        filterRegistration.setFilter(new ResourceUrlEncodingFilter());
        filterRegistration.setOrder(1);
        filterRegistration.addUrlPatterns("/*");

        return filterRegistration;
    }


    *//**
     * https://stackoverflow.com/questions/19600532/modelattribute-for-restful-put-method-not-populated-value-json
     * form 데이터의 경우 put, patch 등은 ModelAttribute가 적용되지 않아 FormContentFilter 또는 HiddenHttpMethodFilter를 등록
     *//*
    @Bean
    public FilterRegistrationBean<FormContentFilter> formContentFilterBean() {
        //parses form data for HTTP PUT, PATCH, and DELETE requests
        FilterRegistrationBean<FormContentFilter> filterRegistration = new FilterRegistrationBean<>();
        filterRegistration.setFilter(new FormContentFilter());
        filterRegistration.addUrlPatterns("/*");

        return filterRegistration;
    }*/

    static class CustomPasswordEncoder implements PasswordEncoder {

        private String byteToHexString(byte[] data) {
            StringBuilder sb = new StringBuilder();
            for (byte b : data) {
                sb.append(Integer.toString((b & 0xff) + 0x100, 16).substring(1));
            }
            return sb.toString();
        }


        private String sha256(String plainText) {
            try {
                MessageDigest md = MessageDigest.getInstance("SHA-256");
                md.update(plainText.getBytes(StandardCharsets.UTF_8));
                return byteToHexString(md.digest());
            } catch (NoSuchAlgorithmException e) {
                throw new IllegalArgumentException("sha256 fail.. NoSuchAlgorithmException", e);
            }
        }

        @Override
        public String encode(CharSequence rawPassword) {
            return sha256(rawPassword.toString());
        }

        @Override
        public boolean matches(CharSequence rawPassword, String encodedPassword) {
            return encode(rawPassword).equals(encodedPassword);
        }

        public static void main(String[] args) {
            String password  = "1111";
            System.out.println(new CustomPasswordEncoder().encode(password));
            System.out.println(UUID.randomUUID().toString());
        }
    }
}
