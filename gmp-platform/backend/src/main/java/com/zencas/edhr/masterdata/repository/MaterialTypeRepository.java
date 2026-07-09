package com.zencas.edhr.masterdata.repository;

import com.zencas.edhr.masterdata.entity.MaterialType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface MaterialTypeRepository extends JpaRepository<MaterialType, Long>, JpaSpecificationExecutor<MaterialType> {
}
