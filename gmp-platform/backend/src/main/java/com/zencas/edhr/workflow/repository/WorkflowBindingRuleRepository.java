package com.zencas.edhr.workflow.repository;

import com.zencas.edhr.workflow.entity.WorkflowBindingRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkflowBindingRuleRepository extends JpaRepository<WorkflowBindingRule, Long>, JpaSpecificationExecutor<WorkflowBindingRule> {
    List<WorkflowBindingRule> findByBusinessTypeAndIsActiveTrue(String businessType);
    List<WorkflowBindingRule> findByDefinitionId(Long definitionId);
}
