package com.zencas.edhr.workflow.repository;

import com.zencas.edhr.workflow.entity.WorkflowDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;

@Repository
public interface WorkflowDefinitionRepository extends JpaRepository<WorkflowDefinition, Long>, JpaSpecificationExecutor<WorkflowDefinition> {
    List<WorkflowDefinition> findByType(String type);
    Page<WorkflowDefinition> findByType(String type, Pageable pageable);
    List<WorkflowDefinition> findByTypeAndBusinessTypeAndStatusOrderByNameAsc(
            String type, String businessType, String status);

    interface CandidateVersion {
        Long getDefinitionId();
        Long getVersionId();
        String getName();
        String getCode();
        Integer getVersionNumber();
        String getBusinessType();
        String getVersionStatus();
    }

    @Query("""
            select definition.id as definitionId, version.id as versionId,
                   definition.name as name, definition.code as code,
                   version.versionNumber as versionNumber,
                   definition.businessType as businessType, version.status as versionStatus
            from WorkflowDefinition definition
            join WorkflowDefinitionVersion version
              on version.definitionId = definition.id and version.isCurrent = true
            where definition.type = :type and definition.businessType = :businessType
              and definition.status = :status
            order by definition.name asc
            """)
    List<CandidateVersion> findCandidateVersions(@Param("type") String type,
                                                @Param("businessType") String businessType,
                                                @Param("status") String status);

    @Query("""
            select definition from WorkflowDefinition definition
            where definition.type = :type
              and (:businessType is null or definition.businessType = :businessType)
              and (:keyword is null or :keyword = ''
                or lower(definition.name) like lower(concat('%', :keyword, '%'))
                or lower(coalesce(definition.code, '')) like lower(concat('%', :keyword, '%')))
            """)
    Page<WorkflowDefinition> findReviewTemplates(@Param("type") String type,
                                                  @Param("businessType") String businessType,
                                                  @Param("keyword") String keyword,
                                                  Pageable pageable);

    @Query("""
            select definition from WorkflowDefinition definition
            where definition.type = :type
              and (
                :keyword is null or :keyword = ''
                or lower(definition.name) like lower(concat('%', :keyword, '%'))
                or lower(coalesce(definition.code, '')) like lower(concat('%', :keyword, '%'))
              )
            """)
    Page<WorkflowDefinition> findWorkTemplates(
            @Param("type") String type,
            @Param("keyword") String keyword,
            Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select definition from WorkflowDefinition definition where definition.id = :id")
    java.util.Optional<WorkflowDefinition> findByIdForUpdate(@Param("id") Long id);
}
