package com.zencas.edhr.masterdata.repository;

import com.zencas.edhr.masterdata.entity.EquipmentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface EquipmentTypeRepository extends JpaRepository<EquipmentType, Long>, JpaSpecificationExecutor<EquipmentType> {
    boolean existsByTenantIdAndCodeAndIdNot(String tenantId, String code, Long id);
    boolean existsByCategoryId(Long categoryId);
    long countByCategoryIdAndTenantId(Long categoryId, String tenantId);
    java.util.Optional<EquipmentType> findByIdAndTenantId(Long id, String tenantId);
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select t from EquipmentType t where t.id = :id and t.tenantId = 'default'")
    java.util.Optional<EquipmentType> lockById(@org.springframework.data.repository.query.Param("id") Long id);
}
