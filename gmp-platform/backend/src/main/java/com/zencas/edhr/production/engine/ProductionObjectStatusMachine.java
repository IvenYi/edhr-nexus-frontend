package com.zencas.edhr.production.engine;

import com.zencas.edhr.workflow.engine.StateMachineDef;
import org.springframework.stereotype.Component;

@Component
@StateMachineDef(entityType = "PRODUCTION_OBJECT", transitions = {
        "CREATED->IN_PROGRESS", "IN_PROGRESS->COMPLETED", "IN_PROGRESS->EARLY_TERMINATED", "CREATED->CANCELLED"
})
public class ProductionObjectStatusMachine {}
