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
