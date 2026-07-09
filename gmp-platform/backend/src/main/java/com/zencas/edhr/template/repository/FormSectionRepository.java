package com.zencas.edhr.template.repository;

import com.zencas.edhr.template.entity.FormSection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface FormSectionRepository extends JpaRepository<FormSection, Long>, JpaSpecificationExecutor<FormSection> {
}
