package com.zencas.edhr.masterdata.repository;

import com.zencas.edhr.masterdata.entity.SerialNumber;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface SerialNumberRepository extends JpaRepository<SerialNumber, Long>, JpaSpecificationExecutor<SerialNumber> {
}
