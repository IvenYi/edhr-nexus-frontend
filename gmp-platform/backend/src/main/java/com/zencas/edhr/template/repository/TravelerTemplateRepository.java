package com.zencas.edhr.template.repository;

import com.zencas.edhr.template.entity.TravelerTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface TravelerTemplateRepository extends JpaRepository<TravelerTemplate, Long>, JpaSpecificationExecutor<TravelerTemplate> {
}
