package com.zencas.edhr.masterdata.repository;

import com.zencas.edhr.masterdata.entity.ProductProcessOperationDocumentBinding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface ProductProcessOperationDocumentBindingRepository extends JpaRepository<ProductProcessOperationDocumentBinding, Long> {
    List<ProductProcessOperationDocumentBinding> findByProductProcessOperationBindingIdInOrderBySortOrderAsc(Collection<Long> operationBindingIds);
    void deleteByProductProcessOperationBindingIdIn(Collection<Long> operationBindingIds);
    long countByDocumentVersionId(Long documentVersionId);
}
