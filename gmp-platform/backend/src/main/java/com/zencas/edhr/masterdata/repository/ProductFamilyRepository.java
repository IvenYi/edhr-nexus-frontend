package com.zencas.edhr.masterdata.repository;

import com.zencas.edhr.masterdata.entity.ProductFamily;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductFamilyRepository extends JpaRepository<ProductFamily, Long>, JpaSpecificationExecutor<ProductFamily> {
}
