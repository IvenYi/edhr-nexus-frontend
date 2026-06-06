package com.zencas.edhr.common.audit;

/** Thread-local context for audit operations, holding operator info. */
public final class AuditContext {

    private static final ThreadLocal<String> OPERATOR_ID = new ThreadLocal<>();
    private static final ThreadLocal<String> OPERATOR_NAME = new ThreadLocal<>();
    private static final ThreadLocal<String> IP_ADDRESS = new ThreadLocal<>();
    private static final ThreadLocal<String> SOURCE = new ThreadLocal<>();

    private AuditContext() {}

    public static void setOperator(String id, String name) {
        OPERATOR_ID.set(id);
        OPERATOR_NAME.set(name);
    }

    public static void setIpAddress(String ip) { IP_ADDRESS.set(ip); }
    public static void setSource(String src) { SOURCE.set(src); }

    public static String getOperatorId() { return OPERATOR_ID.get(); }
    public static String getOperatorName() { return OPERATOR_NAME.get(); }
    public static String getIpAddress() { return IP_ADDRESS.get(); }
    public static String getSource() { return SOURCE.get() != null ? SOURCE.get() : "UI"; }

    public static void clear() {
        OPERATOR_ID.remove();
        OPERATOR_NAME.remove();
        IP_ADDRESS.remove();
        SOURCE.remove();
    }
}
