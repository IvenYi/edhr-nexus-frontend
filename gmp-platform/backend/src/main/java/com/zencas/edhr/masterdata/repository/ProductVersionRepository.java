package com.zencas.edhr.masterdata.repository;

import com.zencas.edhr.masterdata.entity.ProductVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductVersionRepository extends JpaRepository<ProductVersion, Long>, JpaSpecificationExecutor<ProductVersion> {
}
