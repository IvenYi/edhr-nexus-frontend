package com.zencas.edhr.compliance.repository;

import com.zencas.edhr.compliance.entity.AuditEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface AuditEventRepository extends JpaRepository<AuditEvent, Long>, JpaSpecificationExecutor<AuditEvent> {
    @Query("""
            select event from AuditEvent event
            where (:entityType = '' or lower(event.entityType) = lower(:entityType))
              and (:entityId = '' or event.entityId = :entityId)
              and (:action = '' or lower(event.action) = lower(:action))
              and (:operatorName = '' or lower(coalesce(event.operatorName, '')) like lower(concat('%', :operatorName, '%')))
              and (:operatorAccount = '' or lower(coalesce(event.operatorAccount, '')) like lower(concat('%', :operatorAccount, '%')))
              and (:moduleName = '' or lower(coalesce(event.moduleName, '')) like lower(concat('%', :moduleName, '%')))
              and (:menuName = '' or lower(coalesce(event.menuName, '')) like lower(concat('%', :menuName, '%')))
              and (:dataKeyword = '' or lower(coalesce(event.dataSummary, '')) like lower(concat('%', :dataKeyword, '%')))
            """)
    Page<AuditEvent> search(
            @Param("entityType") String entityType,
            @Param("entityId") String entityId,
            @Param("action") String action,
            @Param("operatorName") String operatorName,
            @Param("operatorAccount") String operatorAccount,
            @Param("moduleName") String moduleName,
            @Param("menuName") String menuName,
            @Param("dataKeyword") String dataKeyword,
            Pageable pageable);

    List<AuditEvent> findByEntityTypeAndEntityIdIn(String entityType, Collection<String> entityIds);
}
