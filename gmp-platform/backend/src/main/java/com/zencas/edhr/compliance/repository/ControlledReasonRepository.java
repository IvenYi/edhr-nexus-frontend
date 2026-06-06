package com.zencas.edhr.compliance.repository;

import com.zencas.edhr.compliance.entity.ControlledReason;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface ControlledReasonRepository extends JpaRepository<ControlledReason, Long>, JpaSpecificationExecutor<ControlledReason> {
}
