package com.zencas.edhr.template.repository;

import com.zencas.edhr.template.entity.FormSignatureBlock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface FormSignatureBlockRepository extends JpaRepository<FormSignatureBlock, Long>, JpaSpecificationExecutor<FormSignatureBlock> {
}
