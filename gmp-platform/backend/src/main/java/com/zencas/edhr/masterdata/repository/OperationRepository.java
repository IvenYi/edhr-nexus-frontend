package com.zencas.edhr.masterdata.repository;

import com.zencas.edhr.masterdata.entity.Operation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OperationRepository extends JpaRepository<Operation, Long>, JpaSpecificationExecutor<Operation> {
    List<Operation> findByTenantIdAndCodeIgnoreCase(String tenantId, String code);
}
