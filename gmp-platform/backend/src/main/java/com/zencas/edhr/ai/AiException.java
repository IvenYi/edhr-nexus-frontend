package com.zencas.edhr.ai;

import lombok.Getter;

@Getter
public class AiException extends RuntimeException {
    private final int status;
    private final String reason;

    public AiException(int status, String reason) {
        super(reason);
        this.status = status;
        this.reason = reason;
    }
}
