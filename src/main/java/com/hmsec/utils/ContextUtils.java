package com.hmsec.utils;

import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component("ContextUtils")
public class ContextUtils implements ApplicationContextAware {
    private static ApplicationContext applicationContext;

    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        this.applicationContext = applicationContext;
    }

    public static ApplicationContext getContext() {
        return applicationContext;
    }

    public static Object getBean(String beanName) {
        return applicationContext.getBean(beanName);
    }

    public static <T> T getBean(Class<T> requiredType) {
        return applicationContext.getBean(requiredType);
    }

    public static <T> T getBean(String beanName, Class<T> requiredType) {
        return applicationContext.getBean(beanName, requiredType);
    }

    public static Environment getEnvironment() {
        return applicationContext.getEnvironment();
    }

    public static String getEnvironmentProperty(String name) {
        return getEnvironment().getProperty(name);
    }

    public static <T> T getEnvironmentProperty(String name, Class<T> requiredType) {
        return getEnvironment().getProperty(name, requiredType);
    }

    public static String[] getActiveProfiles() {
        return getEnvironment().getActiveProfiles();
    }
}
