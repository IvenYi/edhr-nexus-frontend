package com.zencas.edhr.workflow.engine;

import org.springframework.stereotype.Component;

@Component
@StateMachineDef(
    entityType = "CHANGE",
    transitions = {
        "DRAFT->SUBMITTED",
        "SUBMITTED->IN_REVIEW",
        "SUBMITTED->DRAFT",
        "IN_REVIEW->APPROVED",
        "IN_REVIEW->SUBMITTED",
        "APPROVED->APPLIED"
    }
)
public class ChangeStatusMachine {}
