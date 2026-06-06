package com.zencas.edhr.template.repository;

import com.zencas.edhr.template.entity.FormTable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface FormTableRepository extends JpaRepository<FormTable, Long>, JpaSpecificationExecutor<FormTable> {
}
