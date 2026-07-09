package com.zencas.edhr.template.repository;

import com.zencas.edhr.template.entity.FormField;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface FormFieldRepository extends JpaRepository<FormField, Long>, JpaSpecificationExecutor<FormField> {
}
