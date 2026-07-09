package com.zencas.edhr.workflow.engine;

import org.springframework.stereotype.Component;

/** S-01: Template status state machine. */
@Component
@StateMachineDef(
    entityType = "TEMPLATE",
    transitions = {
        "DRAFT->IN_REVIEW", "DRAFT->OBSOLETE",
        "IN_REVIEW->EFFECTIVE", "IN_REVIEW->DRAFT",
        "EFFECTIVE->OBSOLETE"
    }
)
public class TemplateStatusMachine {}
