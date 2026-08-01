package com.zencas.edhr.common.config;

import com.zencas.edhr.identity.security.JwtAuthenticationFilter;
import com.zencas.edhr.identity.security.JwtTokenProvider;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.beans.factory.annotation.Autowired;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = SecurityConfigTest.ProtectedApiController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, SecurityConfigTest.ProtectedApiController.class})
class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @Test
    void unauthenticatedProtectedApiReturnsUnauthorizedJson() throws Exception {
        mockMvc.perform(get("/api/v1/protected/ping"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(401))
                .andExpect(jsonPath("$.message").value("未登录或登录已过期"));
    }

    @Test
    void invalidTokenProtectedApiReturnsUnauthorizedJson() throws Exception {
        when(jwtTokenProvider.validateToken("bad-token")).thenReturn(false);

        mockMvc.perform(get("/api/v1/protected/ping")
                        .header("Authorization", "Bearer bad-token"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(401))
                .andExpect(jsonPath("$.message").value("未登录或登录已过期"));
    }

    @Test
    void publicFilePreviewCanBeRequestedWithoutJwtForImageTags() throws Exception {
        mockMvc.perform(get("/api/v1/files/123/public-preview"))
                .andExpect(status().isOk());
    }

    @Test
    void authenticatedFilePreviewStillRequiresJwt() throws Exception {
        mockMvc.perform(get("/api/v1/files/123/preview"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(401))
                .andExpect(jsonPath("$.message").value("未登录或登录已过期"));
    }

    @Test
    void authenticatedApiWithNoRequiredPermissionReturnsForbiddenJson() throws Exception {
        when(jwtTokenProvider.validateToken("valid-token")).thenReturn(true);
        when(jwtTokenProvider.getUserId("valid-token")).thenReturn("1");
        when(jwtTokenProvider.getUsername("valid-token")).thenReturn("operator");
        when(jwtTokenProvider.getDisplayName("valid-token")).thenReturn("操作员");

        mockMvc.perform(get("/api/v1/protected/batch-record-template")
                        .header("Authorization", "Bearer valid-token"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(403))
                .andExpect(jsonPath("$.message").value("无操作权限"));
    }

    @Test
    void authenticatedApiWithRequiredPermissionCanAccessProtectedResource() throws Exception {
        when(jwtTokenProvider.validateToken("valid-token")).thenReturn(true);
        when(jwtTokenProvider.getUserId("valid-token")).thenReturn("1");
        when(jwtTokenProvider.getUsername("valid-token")).thenReturn("operator");
        when(jwtTokenProvider.getDisplayName("valid-token")).thenReturn("操作员");
        when(jwtTokenProvider.getPermissions("valid-token")).thenReturn(java.util.List.of("master-data.batch-record-templates"));

        mockMvc.perform(get("/api/v1/protected/batch-record-template")
                        .header("Authorization", "Bearer valid-token"))
                .andExpect(status().isOk());
    }

    @RestController
    static class ProtectedApiController {
        @GetMapping("/api/v1/protected/ping")
        String ping() {
            return "pong";
        }

        @GetMapping("/api/v1/files/{id}/preview")
        String preview() {
            return "preview";
        }

        @GetMapping("/api/v1/files/{id}/public-preview")
        String publicPreview() {
            return "public-preview";
        }

        @PreAuthorize("hasAuthority('master-data.batch-record-templates')")
        @GetMapping("/api/v1/protected/batch-record-template")
        String batchRecordTemplate() {
            return "batch-record-template";
        }
    }
}
