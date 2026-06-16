package com.zencas.edhr.system.repository;

import com.zencas.edhr.system.entity.BusinessDictionaryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface BusinessDictionaryItemRepository extends JpaRepository<BusinessDictionaryItem, Long>, JpaSpecificationExecutor<BusinessDictionaryItem> {
    boolean existsByDictionaryId(Long dictionaryId);
    boolean existsByDictionaryIdAndValue(Long dictionaryId, String value);
    List<BusinessDictionaryItem> findByDictionaryIdOrderBySortOrderAscCreatedAtAsc(Long dictionaryId);
    List<BusinessDictionaryItem> findByDictionaryIdIn(List<Long> dictionaryIds);
}
