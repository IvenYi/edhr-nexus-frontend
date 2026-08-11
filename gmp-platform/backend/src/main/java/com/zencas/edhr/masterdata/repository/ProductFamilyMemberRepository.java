package com.zencas.edhr.masterdata.repository;

import com.zencas.edhr.masterdata.entity.ProductFamilyMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductFamilyMemberRepository extends JpaRepository<ProductFamilyMember, Long> {
    Optional<ProductFamilyMember> findByTenantIdAndProductId(String tenantId, Long productId);

    List<ProductFamilyMember> findByTenantIdAndProductIdIn(String tenantId, Collection<Long> productIds);

    List<ProductFamilyMember> findByTenantIdAndProductFamilyIdOrderByCreatedAtDesc(String tenantId, Long productFamilyId);

    long countByTenantIdAndProductFamilyId(String tenantId, Long productFamilyId);

    boolean existsByTenantIdAndProductId(String tenantId, Long productId);

    void deleteByTenantIdAndProductFamilyIdAndProductId(String tenantId, Long productFamilyId, Long productId);
}
