package com.zencas.edhr.common.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class GlobalExceptionHandlerTest {

    @Test
    void maxUploadSizeExceededReturnsReadableBadRequest() {
        GlobalExceptionHandler handler = new GlobalExceptionHandler();
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getRequestURI()).thenReturn("/api/v1/files/upload");

        var response = handler.handleMaxUploadSizeExceededException(
                new MaxUploadSizeExceededException(1048576L),
                request);

        assertThat(response.getStatusCode().value()).isEqualTo(400);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getCode()).isEqualTo(400);
        assertThat(response.getBody().getMessage()).isEqualTo("上传文件大小超出限制，请压缩后重试或上传不超过 150MB 的文件");
    }

    @Test
    void dataIntegrityViolationsReturnReadableUserSaveMessages() {
        GlobalExceptionHandler handler = new GlobalExceptionHandler();
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getRequestURI()).thenReturn("/api/v1/identity/users/1");

        var response = handler.handleDataIntegrityViolationException(
                new DataIntegrityViolationException("duplicate key value violates unique constraint \"uk_user_role\""),
                request);

        assertThat(response.getStatusCode().value()).isEqualTo(400);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getMessage()).isEqualTo("用户岗位角色已存在，请刷新后重试");
    }
}
