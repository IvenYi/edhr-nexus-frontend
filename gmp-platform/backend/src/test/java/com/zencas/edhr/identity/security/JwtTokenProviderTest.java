package com.zencas.edhr.identity.security;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class JwtTokenProviderTest {

    @Test
    void generatedTokenContainsIdentityButNotPermissionList() {
        JwtTokenProvider provider = new JwtTokenProvider(
                "edhr-test-secret-key-for-jwt-provider-384",
                86_400_000L);

        String token = provider.generateToken("1", "admin");

        assertThat(token.length()).isLessThan(512);
        assertThat(provider.getUserId(token)).isEqualTo("1");
        assertThat(provider.getUsername(token)).isEqualTo("admin");
    }
}
