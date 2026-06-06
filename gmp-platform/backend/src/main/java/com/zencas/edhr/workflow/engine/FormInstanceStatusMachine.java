package com.zencas.edhr.workflow.engine;

import org.springframework.stereotype.Component;

@Component
@StateMachineDef(
    entityType = "FORM_INSTANCE",
    transitions = {
        "OPEN->SUBMITTED",
        "SUBMITTED->IN_REVIEW",
        "SUBMITTED->OPEN",
        "IN_REVIEW->COMPLETED",
        "IN_REVIEW->SUBMITTED",
        "COMPLETED->IN_REVIEW"
    }
)
public class FormInstanceStatusMachine {}
