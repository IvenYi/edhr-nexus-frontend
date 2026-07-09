package com.zencas.edhr.template.repository;

import com.zencas.edhr.template.entity.FormReviewBlock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface FormReviewBlockRepository extends JpaRepository<FormReviewBlock, Long>, JpaSpecificationExecutor<FormReviewBlock> {
}
