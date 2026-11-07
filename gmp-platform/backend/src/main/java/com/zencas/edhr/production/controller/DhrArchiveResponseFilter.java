package com.zencas.edhr.production.controller;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.async.WebAsyncUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.concurrent.atomic.AtomicReference;

/** Keeps an archive worker from committing headers while the initial security chain is still writing them. */
public final class DhrArchiveResponseFilter extends OncePerRequestFilter {
    private static final String MONITOR = DhrArchiveResponseFilter.class.getName() + ".monitor";
    private final AntPathRequestMatcher exports = new AntPathRequestMatcher("/api/v1/dhr-instances/*/summary/versions/*/export");

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !exports.matches(request);
    }

    @Override
    protected boolean shouldNotFilterAsyncDispatch() {
        return false;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        if (isAsyncDispatch(request)) {
            ResponseHandoff handoff = (ResponseHandoff) request.getAttribute(MONITOR);
            if (!response.isCommitted() && WebAsyncUtils.getAsyncManager(request).getConcurrentResult() instanceof Throwable
                    && handoff.failBeforeBody()) {
                // No ZIP bytes have started; preserve security headers and let the error handler write its own entity.
                response.setContentLengthLong(-1);
                response.setHeader("Content-Disposition", "inline");
                response.setContentType(null);
            }
            chain.doFilter(request, response);
            return;
        }
        ResponseHandoff handoff = new ResponseHandoff();
        request.setAttribute(MONITOR, handoff);
        synchronized (handoff) {
            chain.doFilter(request, response);
        }
    }

    static ResponseHandoff responseMonitor(NativeWebRequest request) {
        ResponseHandoff handoff = (ResponseHandoff) request.getAttribute(MONITOR, RequestAttributes.SCOPE_REQUEST);
        // Direct controller callers and isolated MVC fixtures do not install the security filter chain.
        return handoff == null ? new ResponseHandoff() : handoff;
    }

    static final class ResponseHandoff {
        private enum State { WAITING, BODY, FAILED, CLEANED }
        private final AtomicReference<State> state = new AtomicReference<>(State.WAITING);
        boolean claimBody() { return state.compareAndSet(State.WAITING, State.BODY); }
        boolean failBeforeBody() { return state.compareAndSet(State.WAITING, State.FAILED); }
        boolean claimCleanup() {
            return state.compareAndSet(State.WAITING, State.CLEANED)
                    || state.compareAndSet(State.FAILED, State.CLEANED);
        }
    }
}
