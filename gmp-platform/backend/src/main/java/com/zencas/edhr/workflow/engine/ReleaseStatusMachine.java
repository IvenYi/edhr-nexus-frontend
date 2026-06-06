package com.zencas.edhr.workflow.engine;

import org.springframework.stereotype.Component;

@Component
@StateMachineDef(
    entityType = "RELEASE",
    transitions = {
        "NOT_RELEASED->RELEASE_IN_PROGRESS",
        "RELEASE_IN_PROGRESS->RELEASED",
        "RELEASED->ARCHIVED"
    }
)
public class ReleaseStatusMachine {}
