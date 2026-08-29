package com.zencas.edhr.production.engine;

import com.zencas.edhr.workflow.engine.StateMachineDef;
import org.springframework.stereotype.Component;

@Component
@StateMachineDef(entityType = "WORK_ORDER", transitions = {
        "CREATED->IN_PROCESS", "CREATED->COMPLETED", "IN_PROCESS->COMPLETED", "COMPLETED->CLOSED",
        "CREATED->CANCELLED"
})
public class WorkOrderStatusMachine {}
