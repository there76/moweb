package com.hmsec.utils;

import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class DateTimeUtils {
    private DateTimeUtils(){
        //prevent new
    }

    public static long toTimeMillis(LocalTime localTime){
        return localTime.toSecondOfDay() * 1000L;
    }


    public static long toTimeMillis(LocalDate localDate) {
        return toTimeMillis(localDate, ZoneId.systemDefault());
    }

    public static long toTimeMillis(LocalDate localDate, ZoneId zoneId) {
        return localDate.atStartOfDay(zoneId).toEpochSecond();
    }

    public static long toTimeMillis(LocalDateTime localDateTime) {
        return toTimeMillis(localDateTime, ZoneId.systemDefault());
    }

    public static long toTimeMillis(LocalDateTime localDateTime, ZoneId zoneId) {
        return localDateTime.atZone(zoneId).toInstant().toEpochMilli();
    }

    public static LocalDateTime toLocalDateTime(String yyyyMMddHHmmss, String pattern) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern(pattern);
        return LocalDateTime.parse(yyyyMMddHHmmss, formatter);
    }

    public static LocalDate toLocalDate(String yyyyMMdd, String pattern) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern(pattern);
        return LocalDate.parse(yyyyMMdd, formatter);
    }

    public static LocalDate toLocalDate(long timeMillis) {
        return toLocalDate(timeMillis, ZoneId.systemDefault());
    }

    public static LocalDate toLocalDate(long timeMillis, ZoneId zoneId) {
        return Instant.ofEpochMilli(timeMillis).atZone(zoneId).toLocalDate();
    }

    public static LocalDateTime toLocalDateTime(long timeMillis) {
        return toLocalDateTime(timeMillis, ZoneId.systemDefault());
    }

    public static LocalDateTime toLocalDateTime(long timeMillis, ZoneId zoneId) {
        return Instant.ofEpochMilli(timeMillis).atZone(zoneId).toLocalDateTime();
    }
    
    public static String toFormattedDate(long timeMillis, String format) {
        return toFormattedDate(timeMillis, format, ZoneId.systemDefault());
    }

    public static String toFormattedDate(long timeMillis, String format, ZoneId zoneId) {
        return toFormattedDate(toLocalDateTime(timeMillis, zoneId), format);
    }
    
    public static String toFormattedDate(LocalDateTime localDateTime, String format) {
        return localDateTime.format(DateTimeFormatter.ofPattern(format));
    }

    public static String toFormattedDate(LocalDate localDate, String format) {
        return localDate.format(DateTimeFormatter.ofPattern(format));
    }
    
    public static String getToday() {
        return getToday("yyyyMMdd");
    }

    public static String getToday(String format) {
        return getFormatted(LocalDateTime.now(), format);
    }
    
    public static String getLocalDateTime() {
        return LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
    }
    
    public static LocalDateTime getStartOfDay(LocalDate localDate) {
        return LocalDateTime.of(localDate, LocalTime.MIN);
    }
    
    public static LocalDateTime getEndOfDay(LocalDate localDate) {
        return LocalDateTime.of(localDate, LocalTime.MAX);
    }
    
    
    public static String getNow(String format) {
        return getFormatted(LocalDateTime.now(), format);
    }
    
    public static String getUtcDateTime() {
        return getUtcDateTime(LocalDateTime.now());
    }
    
    public static String getUtcDateTime(LocalDateTime localDateTime) {
        ZoneId utcZone = ZoneId.of("UTC");
        ZonedDateTime utcDateTime = localDateTime.atZone(utcZone);
        ZonedDateTime zdt = utcDateTime.withZoneSameInstant(ZoneId.of("Asia/Seoul"));
        return zdt.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
    }
    
    public static String getUtcDateTimeToKor() {
        return getUtcDateTimeToKor(LocalDateTime.now());
    }
    
    public static String getUtcDateTimeToKor(LocalDateTime localDateTime) {
        ZoneId utcZone = ZoneId.of("Asia/Seoul");
        ZonedDateTime utcDateTime = localDateTime.atZone(utcZone);
        return utcDateTime.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
    }
    
    public static String getFormatted(LocalDateTime localDateTime, String format) {
        return localDateTime.format(DateTimeFormatter.ofPattern(format));
    }

    public static String getFormatted(LocalDate localDate, String format) {
        return localDate.format(DateTimeFormatter.ofPattern(format));
    }

    /**
     * startDateStr와 endDateStr 사이에 날짜 배열을 리턴한다.
     *
     * List<String> dates = getBetweenDays("2020-01-19", "2020-03-01", "yyyy-MM-dd");
     * [2020-01-19, 2020-01-20, ~~ ,2020-02-29, 2020-03-01]
     * */
    public static List<String> getBetweenDays(String startDateStr, String endDateStr, String format){
        List<String> dates = new ArrayList<>();

        DateFormat formatter;
        DateFormat outFormatter;
        Date startDate;
        Date endDate;
        try {
            formatter = new SimpleDateFormat("yyyyMMdd");
            outFormatter = new SimpleDateFormat(format);
            startDate = formatter.parse(startDateStr.replaceAll("[^0-9]", ""));
            endDate = formatter.parse(endDateStr.replaceAll("[^0-9]", ""));
            long interval = 24*1000 * 60 * 60; // 1 hour in millis
            long endTime =endDate.getTime() ; // create your endtime here, possibly using Calendar or Date
            long curTime = startDate.getTime();
            while (curTime <= endTime) {
                dates.add(outFormatter.format(new Date(curTime)));
                curTime += interval;
            }
        } catch (ParseException e) {
            //ignore
        }

        return dates;
    }
    
    
    public static void main(String[] args) {
        System.out.println(toLocalDateTime("2018-10-08 17:42:06","yyyy-MM-dd HH:mm:ss"));
        System.out.println(getUtcDateTimeToKor());

        List<String> dates = getBetweenDays("2020-01-01", "2020-03-01", "yyyy-MM-dd");
        for(String date: dates){
            System.out.println(date);
        }
    }
    

}
