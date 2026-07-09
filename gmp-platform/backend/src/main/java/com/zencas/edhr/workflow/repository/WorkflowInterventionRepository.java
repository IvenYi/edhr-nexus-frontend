package com.zencas.edhr.workflow.repository;

import com.zencas.edhr.workflow.entity.WorkflowIntervention;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface WorkflowInterventionRepository extends JpaRepository<WorkflowIntervention, Long>, JpaSpecificationExecutor<WorkflowIntervention> {
}
