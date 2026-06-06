package com.zencas.edhr.masterdata.repository;

import com.zencas.edhr.masterdata.entity.ProcessDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface ProcessDefinitionRepository extends JpaRepository<ProcessDefinition, Long>, JpaSpecificationExecutor<ProcessDefinition> {
}
