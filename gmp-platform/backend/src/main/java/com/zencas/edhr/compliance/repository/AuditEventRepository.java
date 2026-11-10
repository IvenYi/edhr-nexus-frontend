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
              and (:action = '' or
                (case when upper(cast(function('regexp_replace', event.entityType,
                  '^[\\x01-\\x20]+|[\\x01-\\x20]+$', '', 'g') as string)) in ('WORK_ORDER','PRODUCTION_OBJECT')
                  then case when upper(cast(function('regexp_replace', event.action,
                    '^[\\x09-\\x0D\\x1C-\\x20\\u1680\\u2000-\\u2006\\u2008-\\u200A\\u2028\\u2029\\u205F\\u3000]+|[\\x09-\\x0D\\x1C-\\x20\\u1680\\u2000-\\u2006\\u2008-\\u200A\\u2028\\u2029\\u205F\\u3000]+$', '', 'g') as string)) = 'CREATE'
                    then 'create' else 'update' end
                  else lower(event.action) end) = lower(:action))
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
