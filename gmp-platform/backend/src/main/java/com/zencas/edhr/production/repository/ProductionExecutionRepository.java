package com.zencas.edhr.production.repository;

import com.zencas.edhr.production.entity.ProductionExecution;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductionExecutionRepository extends JpaRepository<ProductionExecution, Long> {
}
