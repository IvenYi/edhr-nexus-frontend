package com.zencas.edhr.masterdata.repository;

import com.zencas.edhr.masterdata.entity.ProcessDefinitionVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface ProcessDefinitionVersionRepository extends JpaRepository<ProcessDefinitionVersion, Long>, JpaSpecificationExecutor<ProcessDefinitionVersion> {
}
