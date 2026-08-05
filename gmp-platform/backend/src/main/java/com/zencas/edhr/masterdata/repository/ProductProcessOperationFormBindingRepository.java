package com.zencas.edhr.masterdata.repository;

import com.zencas.edhr.masterdata.entity.ProductProcessOperationFormBinding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface ProductProcessOperationFormBindingRepository extends JpaRepository<ProductProcessOperationFormBinding, Long> {
    List<ProductProcessOperationFormBinding> findByProductProcessOperationBindingIdInOrderBySortOrderAsc(Collection<Long> productProcessOperationBindingIds);
    void deleteByProductProcessOperationBindingIdIn(Collection<Long> productProcessOperationBindingIds);
}
