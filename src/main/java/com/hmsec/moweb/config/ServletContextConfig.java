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
     * ????????? ?????? ????????? ????????? ????????? ???????????? ????????????.
     * ???????????? ????????? ???????????? ????????? ????????????.
     */
    @Bean
    public LocaleResolver localeResolver() {
        //default AcceptHeaderLocaleResolver
        //CookieLocaleResolver
        return new CookieLocaleResolver();
    }

    @Bean // ??????????????? ???????????? ????????????. ????????? ??????????????? lang ????????? ???????????? ????????? ?????????.
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

        //static ?????? cache?????? ?????? ??????
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
    //VersionResourceResolver??? ?????? ????????????  1?????? 2???????????????
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
     * form ???????????? ?????? put, patch ?????? ModelAttribute??? ???????????? ?????? FormContentFilter ?????? HiddenHttpMethodFilter??? ??????
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
