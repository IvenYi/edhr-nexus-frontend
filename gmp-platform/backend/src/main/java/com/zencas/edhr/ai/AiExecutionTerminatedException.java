package com.zencas.edhr.ai;

/** Qualification ended the run before any native write. Preserve that terminal event and lease release. */
final class AiExecutionTerminatedException extends AiException {
    AiExecutionTerminatedException(int status, String reason) {
        super(status, reason);
    }
}
