package com.zencas.edhr.workflow.engine;

import org.springframework.stereotype.Component;

@Component
@StateMachineDef(
    entityType = "FORM_INSTANCE",
    transitions = {
        "OPEN->SUBMITTED",
        "OPEN->COMPLETED",
        "SUBMITTED->IN_REVIEW",
        "SUBMITTED->OPEN",
        "IN_REVIEW->COMPLETED",
        "IN_REVIEW->SUBMITTED"
    }
)
public class FormInstanceStatusMachine {}
