package com.zencas.edhr.template.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;

/** Canonical content values; never resolves an entity or substitutes a system timestamp. */
public final class FormLookupValue {
    public static final Set<String> TYPES = Set.of("text", "number", "date");
    private FormLookupValue() {}

    public static String number(String value) {
        try {
            BigDecimal number = new BigDecimal(value.trim()).stripTrailingZeros();
            if (number.precision() > 512 || Math.abs((long) number.scale()) > 512) return null;
            String normalized = number.toPlainString();
            return normalized.length() <= 512 ? normalized : null;
        } catch (RuntimeException ex) { return null; }
    }

    public static String date(String value) {
        if (value == null || !value.matches("[0-9]{4}-[0-9]{2}-[0-9]{2}")) return null;
        try {
            LocalDate date = LocalDate.parse(value);
            return date.getYear() >= 1 ? date.toString() : null;
        } catch (java.time.format.DateTimeParseException ex) { return null; }
    }
}
