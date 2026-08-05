package com.zencas.edhr.masterdata.repository;

import com.zencas.edhr.masterdata.entity.ProductProcessOperationBinding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface ProductProcessOperationBindingRepository extends JpaRepository<ProductProcessOperationBinding, Long> {
    List<ProductProcessOperationBinding> findByProductProcessVersionIdOrderBySortOrderAsc(Long productProcessVersionId);
    void deleteByProductProcessVersionId(Long productProcessVersionId);
    List<ProductProcessOperationBinding> findByProductProcessVersionIdIn(Collection<Long> productProcessVersionIds);
}
