package com.zencas.edhr.masterdata.repository;

import com.zencas.edhr.masterdata.entity.SopDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface SopDocumentRepository extends JpaRepository<SopDocument, Long>, JpaSpecificationExecutor<SopDocument> {
}
