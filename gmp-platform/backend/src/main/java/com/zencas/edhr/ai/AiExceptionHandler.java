package com.zencas.edhr.ai;

import com.zencas.edhr.common.dto.ApiResponse;
import org.springframework.core.annotation.Order;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.Map;

@Order(-1)
@RestControllerAdvice(basePackageClasses = AiController.class)
public class AiExceptionHandler {
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> invalidParameter(MethodArgumentTypeMismatchException error) {
        return ResponseEntity.badRequest().body(ApiResponse.error(400, "INVALID_PARAMETER", Map.of("reason", "INVALID_PARAMETER")));
    }

    @ExceptionHandler(AiException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handle(AiException error) {
        return ResponseEntity.status(error.getStatus()).body(ApiResponse.error(
                error.getStatus(), error.getReason(), Map.of("reason", error.getReason())));
    }
}
