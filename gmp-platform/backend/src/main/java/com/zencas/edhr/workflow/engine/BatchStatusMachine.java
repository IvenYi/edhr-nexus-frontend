package com.zencas.edhr.workflow.engine;

import org.springframework.stereotype.Component;

@Component
@StateMachineDef(
    entityType = "BATCH",
    transitions = {
        "NOT_STARTED->IN_PROGRESS",
        "IN_PROGRESS->COMPLETED"
    }
)
public class BatchStatusMachine {}
