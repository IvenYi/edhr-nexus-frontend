package com.zencas.edhr.workflow.engine;

import org.springframework.stereotype.Component;

@Component
@StateMachineDef(
    entityType = "DHR",
    transitions = {
        "NOT_FILLED->IN_PROGRESS",
        "IN_PROGRESS->COMPLETED",
        "COMPLETED->SUMMARY_IN_PROGRESS",
        "SUMMARY_IN_PROGRESS->SUMMARIZED",
        "SUMMARIZED->RELEASED",
        "RELEASED->ARCHIVED"
    }
)
public class DhrStatusMachine {}
