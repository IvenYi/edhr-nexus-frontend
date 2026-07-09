package com.zencas.edhr.workflow.engine;

import org.springframework.stereotype.Component;

@Component
@StateMachineDef(
    entityType = "TXN_INSTANCE",
    transitions = {
        "CREATED->RUNNING",
        "RUNNING->WAITING_TASK",
        "RUNNING->COMPLETED",
        "WAITING_TASK->RUNNING",
        "WAITING_TASK->COMPLETED"
    }
)
public class TxnInstanceStatusMachine {}
