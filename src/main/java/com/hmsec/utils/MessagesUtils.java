package com.hmsec.utils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.context.support.MessageSourceAccessor;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URL;
import java.net.URLConnection;
import java.nio.charset.StandardCharsets;
import java.util.*;

public class MessagesUtils {
    private static MessageSourceAccessor msgAccessor = null;

    private static final String defaultExceptonMessage = "불편을 끼쳐 드려 죄송합니다. 현재 귀하가 요청하신 작업을 처리할 수 없습니다. 기술팀에서 이 문제를 검토하고 있으니 신속하게 해결하겠습니다.";

    public void setMessageSourceAccessor(MessageSourceAccessor msgAccessor) {
        MessagesUtils.msgAccessor = msgAccessor;
    }

    public static String getMessage(String key) {
        return msgAccessor.getMessage(key, LocaleContextHolder.getLocale());
    }

    public static String getMessage(String key, String defaultMessage) {
        return msgAccessor.getMessage(key, defaultMessage, LocaleContextHolder.getLocale());
    }


    public static String getMessage(String key, Object[] objs) {
        return msgAccessor.getMessage(key, objs, LocaleContextHolder.getLocale());
    }

    public static String getMessage(String key, Object[] objs, String defaultMessage) {
        return msgAccessor.getMessage(key, objs, defaultMessage, LocaleContextHolder.getLocale());
    }

    public static String getEnumMessage(Enum<?> key) {
        return getEnumMessage(key, key.name());
    }

    public static String getEnumMessage(Enum<?> key, String defaultMessage) {
        String className = getSimpleFullName(key.getClass());
        getMessage("enum."+className+"."+key.name(), defaultMessage);

        return getMessage("enum."+className+"."+key.name(), defaultMessage);
    }

    public static String getExceptionMessage(String key, String defaultMessage) {
        return msgAccessor.getMessage("server.exception." + key, defaultMessage, LocaleContextHolder.getLocale());
    }

    public static String getExceptionMessage(String key, Object[] objs, String defaultMessage) {
        return msgAccessor.getMessage("server.exception." + key, objs, defaultMessage, LocaleContextHolder.getLocale());
    }

    public static String getExceptionMessage(String key) {
        String message = getExceptionMessage(key,"");
        if ("".equals(message)) {
            message = getExceptionMessage("Exception", defaultExceptonMessage);
        }

        return message;
    }

    public static String getExceptionMessage(String key, Object[] objs) {
        String message = getExceptionMessage(key, objs,"");
        if ("".equals(message)) {
            message = getExceptionMessage("Exception", defaultExceptonMessage);
        }

        return message;
    }

    public static String getJson(Locale locale) {
        final ResourceBundle bundle = ResourceBundle.getBundle("messages/messages", locale, new UTF8Control());
        final Map<String, String> bundleMap = resourceBundleToMap(bundle);

        ObjectMapper om = new ObjectMapper();
        try {
            return om.writeValueAsString(bundleMap);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
            return "";
        }
    }

    private static Map<String, String> resourceBundleToMap(final ResourceBundle bundle) {
        final Map<String, String> bundleMap = new HashMap<>();

        for (String key : bundle.keySet()) {
            final String value = bundle.getString(key);
            bundleMap.put(key, value);
        }

        return bundleMap;
    }

    public static class UTF8Control extends ResourceBundle.Control {
        public ResourceBundle newBundle (String baseName, Locale locale, String format, ClassLoader loader, boolean reload) throws IOException {
            String bundleName = toBundleName(baseName, locale);
            String resourceName = toResourceName(bundleName, "properties");
            ResourceBundle bundle = null;
            InputStream stream = null;
            if (reload) {
                URL url = loader.getResource(resourceName);
                if (url != null) {
                    URLConnection connection = url.openConnection();
                    if (connection != null) {
                        connection.setUseCaches(false);
                        stream = connection.getInputStream();
                    }
                }
            } else {
                stream = loader.getResourceAsStream(resourceName);
            }
            if (stream != null) {
                try {
                    // Only this line is changed to make it to read properties files as UTF-8.
                    bundle = new PropertyResourceBundle(new InputStreamReader(stream, StandardCharsets.UTF_8));
                } finally {
                    stream.close();
                }
            }
            return bundle;
        }
    }

    public static String getSimpleFullName(Class<?> clazz){
        String name = clazz.getName();
        name = name.substring(name.lastIndexOf('.') + 1);
        return name;
    }
}
