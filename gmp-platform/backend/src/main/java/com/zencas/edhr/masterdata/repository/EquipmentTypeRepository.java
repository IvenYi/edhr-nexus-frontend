package com.zencas.edhr.masterdata.repository;

import com.zencas.edhr.masterdata.entity.EquipmentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface EquipmentTypeRepository extends JpaRepository<EquipmentType, Long>, JpaSpecificationExecutor<EquipmentType> {
}
