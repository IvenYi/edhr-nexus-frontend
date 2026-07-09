package com.zencas.edhr.common.util;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

/** Date/time utility methods. */
public final class DateTimeUtils {

    private static final ZoneId ZONE_SHANGHAI = ZoneId.of("Asia/Shanghai");
    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_INSTANT;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private DateTimeUtils() {
        throw new UnsupportedOperationException("Utility class");
    }

    /** Parse ISO instant string to LocalDateTime in Shanghai zone. */
    public static LocalDateTime parseIsoToLocal(String isoTimestamp) {
        try {
            return LocalDateTime.ofInstant(Instant.parse(isoTimestamp), ZONE_SHANGHAI);
        } catch (DateTimeParseException e) {
            return null;
        }
    }

    /** Format LocalDateTime to "yyyy-MM-dd HH:mm:ss" string. */
    public static String formatDateTime(LocalDateTime dateTime) {
        if (dateTime == null) {
            return null;
        }
        return dateTime.format(DATETIME_FORMATTER);
    }

    /** Format LocalDate to "yyyy-MM-dd" string. */
    public static String formatDate(LocalDate date) {
        if (date == null) {
            return null;
        }
        return date.format(DATE_FORMATTER);
    }

    /** Get current timestamp in Shanghai zone as LocalDateTime. */
    public static LocalDateTime now() {
        return LocalDateTime.now(ZONE_SHANGHAI);
    }

    /** Get current date in Shanghai zone. */
    public static LocalDate today() {
        return LocalDate.now(ZONE_SHANGHAI);
    }

    /** Get current UTC Instant as string. */
    public static String nowIso() {
        return Instant.now().toString();
    }

    /** Get current year-month-day string for sequence reset. */
    public static String todayStr() {
        return today().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
    }

    /** Get current year-month string for sequence reset. */
    public static String currentMonthStr() {
        return today().format(DateTimeFormatter.ofPattern("yyyyMM"));
    }

    /** Get current year string for sequence reset. */
    public static String currentYearStr() {
        return String.valueOf(today().getYear());
    }
}
