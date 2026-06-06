package com.zencas.edhr.masterdata.repository;

import com.zencas.edhr.masterdata.entity.RouteOperation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface RouteOperationRepository extends JpaRepository<RouteOperation, Long>, JpaSpecificationExecutor<RouteOperation> {
}
