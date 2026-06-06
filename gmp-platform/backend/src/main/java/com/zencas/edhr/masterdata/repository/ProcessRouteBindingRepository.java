package com.zencas.edhr.masterdata.repository;

import com.zencas.edhr.masterdata.entity.ProcessRouteBinding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface ProcessRouteBindingRepository extends JpaRepository<ProcessRouteBinding, Long>, JpaSpecificationExecutor<ProcessRouteBinding> {
}
