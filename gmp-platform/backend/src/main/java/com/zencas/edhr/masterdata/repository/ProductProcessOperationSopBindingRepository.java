package com.zencas.edhr.masterdata.repository;

import com.zencas.edhr.masterdata.entity.ProductProcessOperationSopBinding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface ProductProcessOperationSopBindingRepository extends JpaRepository<ProductProcessOperationSopBinding, Long> {
    List<ProductProcessOperationSopBinding> findByProductProcessOperationBindingIdInOrderBySortOrderAsc(Collection<Long> productProcessOperationBindingIds);
    void deleteByProductProcessOperationBindingIdIn(Collection<Long> productProcessOperationBindingIds);
}
