package com.zencas.edhr.common.config;

import com.zencas.edhr.identity.security.JwtAuthenticationFilter;
import com.zencas.edhr.identity.security.JwtTokenProvider;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.Authentication;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Real parser/filter/entry-point coverage, not a live JWT natural-expiry experiment. */
@WebMvcTest(controllers = SecurityJwtExpirationTest.ProtectedIdentityController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class,
        SecurityJwtExpirationTest.JwtConfiguration.class,
        SecurityJwtExpirationTest.ProtectedIdentityController.class})
class SecurityJwtExpirationTest {
    private static final String TEST_SECRET = "pr6-expiration-test-key-only-at-least-384-bits-long";
    private static final String USER_ID = "385762229210103808";

    @Autowired MockMvc mvc;
    @Autowired JwtTokenProvider tokens;

    @Test
    void validProviderTokenReachesProtectedResourceWithExactIdentity() throws Exception {
        String token = tokens.generateToken(USER_ID, "qa-expiration", "QA", 480);
        assertThat(tokens.validateToken(token)).isTrue();
        mvc.perform(get("/api/v1/protected/expiration-identity")
                .header("Authorization", "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.userId").value(USER_ID));
    }

    @Test
    void expiredCorrectlySignedFixtureIsRejectedByActualParserAndSecurityChain() throws Exception {
        // This isolated test credential is never sent to the live QA application.
        // Production lifetime, the JVM clock, and validation are left unchanged.
        String expired = Jwts.builder()
            .subject(USER_ID)
            .claim("username", "qa-expiration")
            .issuedAt(new Date(0))
            .expiration(new Date(60_000))
            .signWith(Keys.hmacShaKeyFor(TEST_SECRET.getBytes(StandardCharsets.UTF_8)))
            .compact();

        assertThat(tokens.validateToken(expired)).isFalse();
        mvc.perform(get("/api/v1/protected/expiration-identity")
                .header("Authorization", "Bearer " + expired))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.code").value(401))
            .andExpect(jsonPath("$.message").value("未登录或登录已过期"))
            .andExpect(jsonPath("$.userId").doesNotExist());
    }

    @TestConfiguration
    static class JwtConfiguration {
        @Bean
        JwtTokenProvider jwtTokenProvider() {
            return new JwtTokenProvider(TEST_SECRET, 28_800_000L);
        }
    }

    @RestController
    static class ProtectedIdentityController {
        @GetMapping("/api/v1/protected/expiration-identity")
        Map<String, String> identity(Authentication authentication) {
            return Map.of("userId", authentication.getName());
        }
    }
}
