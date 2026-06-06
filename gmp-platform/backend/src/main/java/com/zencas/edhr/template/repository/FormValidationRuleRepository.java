package com.zencas.edhr.template.repository;

import com.zencas.edhr.template.entity.FormValidationRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface FormValidationRuleRepository extends JpaRepository<FormValidationRule, Long>, JpaSpecificationExecutor<FormValidationRule> {
}
