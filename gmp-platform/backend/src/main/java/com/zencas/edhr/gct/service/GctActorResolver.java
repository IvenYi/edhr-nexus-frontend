package com.zencas.edhr.gct.service;

import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class GctActorResolver {

    private static final String FALLBACK_ACTOR = "demo-user";

    public String resolve(String requestedActor) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null
                && authentication.isAuthenticated()
                && !(authentication instanceof AnonymousAuthenticationToken)
                && !isBlank(authentication.getName())) {
            return authentication.getName();
        }
        return isBlank(requestedActor) ? FALLBACK_ACTOR : requestedActor;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
