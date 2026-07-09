package com.zencas.edhr.workflow.engine;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.util.Set;

/**
 * Annotation to register a state machine definition for a business entity type.
 * Classes annotated with @StateMachine are automatically discovered by StateMachineRegistry.
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface StateMachineDef {

    /** Business entity type (e.g., "TEMPLATE", "FORM_INSTANCE", "TXN_INSTANCE"). */
    String entityType();

    /** Comma-separated list of transitions in format "FROM->TO". */
    String[] transitions();
}
