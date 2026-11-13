package com.zencas.edhr.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.common.dto.ApiResponse;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.List;

/** Registered only inside the security chain; never accepts the key as a general user credential. */
public class AiWorkerAuthenticationFilter extends OncePerRequestFilter {
    private final AiProperties config;
    private final ObjectMapper mapper;

    public AiWorkerAuthenticationFilter(AiProperties config, ObjectMapper mapper) {
        this.config = config;
        this.mapper = mapper;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getServletPath().startsWith("/api/v1/ai/internal/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String supplied = request.getHeader("X-EDHR-AI-Worker-Key");
        String expected = config.getWorkerKey();
        if (expected.length() < 32 || supplied == null || !MessageDigest.isEqual(
                supplied.getBytes(StandardCharsets.UTF_8), expected.getBytes(StandardCharsets.UTF_8))) {
            response.setStatus(401);
            response.setContentType("application/json;charset=UTF-8");
            mapper.writeValue(response.getWriter(), ApiResponse.error(401, "WORKER_AUTH_REQUIRED"));
            return;
        }
        var context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(new UsernamePasswordAuthenticationToken("ai-worker", null,
                List.of(new SimpleGrantedAuthority("AI_WORKER"))));
        var previous = SecurityContextHolder.getContext();
        SecurityContextHolder.setContext(context);
        try { chain.doFilter(request, response); }
        finally { SecurityContextHolder.setContext(previous); }
    }
}
