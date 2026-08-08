package com.zencas.edhr.knowledge;

final class KnowledgeValidationException extends IllegalArgumentException {

    KnowledgeValidationException(String message) {
        super(message);
    }

    KnowledgeValidationException(String message, Throwable cause) {
        super(message, cause);
    }
}
