package com.zencas.edhr.identity.repository;

import com.zencas.edhr.identity.entity.ProductionLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductionLineRepository extends JpaRepository<ProductionLine, Long>, JpaSpecificationExecutor<ProductionLine> {
}
