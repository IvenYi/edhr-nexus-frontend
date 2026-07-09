package com.zencas.edhr.system.repository;

import com.zencas.edhr.system.entity.IconGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IconGroupRepository extends JpaRepository<IconGroup, Long> {
    List<IconGroup> findByTenantIdOrderBySortOrderAscCreatedAtAsc(String tenantId);
}
