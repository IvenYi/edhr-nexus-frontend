package com.zencas.edhr.masterdata.repository;

import com.zencas.edhr.masterdata.entity.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, Long>, JpaSpecificationExecutor<Equipment> {
    boolean existsByEquipmentTypeId(Long equipmentTypeId);
    boolean existsByCodeAndIdNot(String code, Long id);
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select e from Equipment e where e.id = :id")
    java.util.Optional<Equipment> lockById(@org.springframework.data.repository.query.Param("id") Long id);
}
