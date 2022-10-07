package com.hmsec.utils;


import org.springframework.util.StringUtils;

import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class StringFormatUtils {
    private static final Charset CHARSET = StandardCharsets.UTF_8;
    private static final String EMAIL_ADDRESS_REGEXP = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}$";


    public static String padRightSpaces(String s, int n) {
        return String.format("%-" + n + "s", s);
    }

    public static String padLeftSpaces(String s, int n) {
        return String.format("%" + n + "s", s);
    }

    public static String replacePath(String path, String... args) {
        String targetPath = path;
        for (String s : args) {
            targetPath = targetPath.replaceFirst("\\{(\\w.*?)}", s);
        }

        return targetPath;
    }

    public static String replaceVariable(String path, String... args) {
        String targetPath = path;
        for (String s : args) {
            targetPath = targetPath.replaceFirst("#.*\\s", s);
        }

        return targetPath;
    }

    /**
     * SHA-256으로 해시한다.
     */
    public static String sha256(String plainText) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            md.update(plainText.getBytes(CHARSET));
            return byteToHexString(md.digest());
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("sha256 fail.. NoSuchAlgorithmException", e);
        }
    }

    public static String sha256(String plainText, String salt) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            md.update(plainText.getBytes(CHARSET));
            md.update(salt.getBytes(CHARSET));
            return byteToHexString(md.digest());
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("sha256 fail.. NoSuchAlgorithmException", e);
        }
    }

    /**
     * 바이트 배열을 HEX 문자열로 변환한다.
     *
     * @param data
     * @return
     */
    public static String byteToHexString(byte[] data) {
        StringBuilder sb = new StringBuilder();
        for (byte b : data) {
            sb.append(Integer.toString((b & 0xff) + 0x100, 16).substring(1));
        }
        return sb.toString();
    }

    public static void main(String[] args) {
        String chatByeMsg = "감사합니다. 지금까지 상담사 #user_nm 이었습니다.";


        System.out.println(replaceVariable(chatByeMsg, "가나다"));


        System.out.println(formatPhoneNumber("01068628293"));
        System.out.println(formatPhoneNumber("0114888934"));
    }

    public static boolean checkEmailAddressFormat(String email) {
        return StringUtils.hasLength(email) && email.matches(EMAIL_ADDRESS_REGEXP);
    }

    public static boolean isNumeric(String value) {
        try {
            Double.parseDouble(value);
        } catch (NumberFormatException e) {
            return false;
        }
        return true;
    }

    public static String formatPhoneNumber(String src) {
        if (src == null) {
            return "";
        }
        if (src.length() == 8) {
            return src.replaceFirst("^([0-9]{4})([0-9]{4})$", "$1-$2");
        } else if (src.length() == 12) {
            return src.replaceFirst("(^[0-9]{4})([0-9]{4})([0-9]{4})$", "$1-$2-$3");
        }
        return src.replaceFirst("(^02|[0-9]{3})([0-9]{3,4})([0-9]{4})$", "$1-$2-$3");
    }


}
