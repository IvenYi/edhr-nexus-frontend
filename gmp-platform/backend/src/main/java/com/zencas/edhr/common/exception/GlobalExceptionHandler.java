package com.zencas.edhr.common.exception;

import com.zencas.edhr.common.dto.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

/** Global exception handler for REST controllers. */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Void>> handleBusinessException(
            BusinessException ex, HttpServletRequest request) {
        log.warn("Business exception: code={}, message={}, path={}",
                ex.getCode(), ex.getMessage(), request.getRequestURI());
        return ResponseEntity
                .status(ex.getHttpStatus())
                .body(ApiResponse.error(ex.getHttpStatus(), ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<String>> handleValidationException(
            MethodArgumentNotValidException ex) {
        String detail = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining("; "));
        log.warn("Validation failed: {}", detail);
        return ResponseEntity
                .badRequest()
                .body(ApiResponse.error(400, "参数校验失败: " + detail));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDeniedException(
            AccessDeniedException ex) {
        log.warn("Access denied: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error(403, "无操作权限"));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleDataIntegrityViolationException(
            DataIntegrityViolationException ex, HttpServletRequest request) {
        String message = resolveDataIntegrityMessage(ex, request);
        log.warn("Data integrity violation: message={}, path={}, detail={}",
                message, request.getRequestURI(), ex.getMessage());
        return ResponseEntity
                .badRequest()
                .body(ApiResponse.error(400, message));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(
            Exception ex, HttpServletRequest request) {
        log.error("Unhandled exception at path={}: {}", request.getRequestURI(), ex.getMessage(), ex);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(500, "系统内部错误"));
    }

    private String resolveDataIntegrityMessage(DataIntegrityViolationException ex, HttpServletRequest request) {
        String detail = String.valueOf(ex.getMessage()).toLowerCase();
        String path = request.getRequestURI();

        if (detail.contains("uk_user_username")) {
            return "用户名已存在";
        }
        if (detail.contains("uk_user_role")) {
            return "用户岗位角色已存在，请刷新后重试";
        }
        if (detail.contains("uk_user_dept")) {
            return "用户所属组织已存在，请刷新后重试";
        }
        if (path.contains("/identity/users")) {
            return "用户保存失败，请检查账号、所属组织和岗位角色后重试";
        }
        return "数据已存在或被引用，无法保存";
    }
}
