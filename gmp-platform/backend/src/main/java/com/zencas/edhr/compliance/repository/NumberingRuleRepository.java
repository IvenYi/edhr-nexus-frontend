package com.zencas.edhr.compliance.repository;

import com.zencas.edhr.compliance.entity.NumberingRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface NumberingRuleRepository extends JpaRepository<NumberingRule, Long> {
    Optional<NumberingRule> findByBusinessTypeAndIsActiveTrue(String businessType);
}
