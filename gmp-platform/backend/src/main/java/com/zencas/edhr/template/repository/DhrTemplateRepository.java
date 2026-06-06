package com.zencas.edhr.template.repository;

import com.zencas.edhr.template.entity.DhrTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface DhrTemplateRepository extends JpaRepository<DhrTemplate, Long>, JpaSpecificationExecutor<DhrTemplate> {
}
