package com.zencas.edhr.template.repository;

import com.zencas.edhr.template.entity.FieldPermissionPolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface FieldPermissionPolicyRepository extends JpaRepository<FieldPermissionPolicy, Long>, JpaSpecificationExecutor<FieldPermissionPolicy> {
}
