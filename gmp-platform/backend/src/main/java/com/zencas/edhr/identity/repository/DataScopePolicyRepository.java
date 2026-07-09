package com.zencas.edhr.identity.repository;

import com.zencas.edhr.identity.entity.DataScopePolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface DataScopePolicyRepository extends JpaRepository<DataScopePolicy, Long>, JpaSpecificationExecutor<DataScopePolicy> {
}
