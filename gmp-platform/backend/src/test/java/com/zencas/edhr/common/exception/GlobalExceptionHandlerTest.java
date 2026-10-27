package com.zencas.edhr.common.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.mock.http.MockHttpInputMessage;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class GlobalExceptionHandlerTest {

    @RestController
    static class InputFixtureController {
        @PostMapping("/fixture/input")
        Map<String, String> input(@RequestBody Map<String, String> input) { return input; }

        @PostMapping("/fixture/technical-error")
        void technicalError() { throw new IllegalStateException("synthetic technical fault"); }
    }

    @Test
    void converterErrorsOutsideLoginReturn400AndValidBodiesStillBind() throws Exception {
        var mvc = MockMvcBuilders.standaloneSetup(new InputFixtureController())
                .setControllerAdvice(new GlobalExceptionHandler()).build();
        mvc.perform(post("/fixture/input").contentType("application/json")
                        .content("{\"value\":{\"sensitive\":\"fixture-secret\"}}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("请求体格式不正确"));
        mvc.perform(post("/fixture/input").contentType("application/json")
                        .content("{\"value\":\"normal\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.value").value("normal"));
    }

    @Test
    void technicalFailuresRemain500() throws Exception {
        var mvc = MockMvcBuilders.standaloneSetup(new InputFixtureController())
                .setControllerAdvice(new GlobalExceptionHandler()).build();
        mvc.perform(post("/fixture/technical-error"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.message").value("系统内部错误"));
    }

    @Test
    void unreadableBodyReturnsBadRequestWithoutConverterDetails() {
        GlobalExceptionHandler handler = new GlobalExceptionHandler();
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getRequestURI()).thenReturn("/api/v1/auth/login");
        var response = handler.handleUnreadableRequestBody(new HttpMessageNotReadableException(
                "sensitive-fixture-only", new MockHttpInputMessage(new byte[0])), request);
        assertThat(response.getStatusCode().value()).isEqualTo(400);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getCode()).isEqualTo(400);
        assertThat(response.getBody().getMessage()).isEqualTo("请求体格式不正确");
        assertThat(response.getBody().getMessage()).doesNotContain("sensitive-fixture-only");
    }

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
