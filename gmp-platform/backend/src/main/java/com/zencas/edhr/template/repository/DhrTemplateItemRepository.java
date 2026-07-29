package com.zencas.edhr.template.repository;

import com.zencas.edhr.template.entity.DhrTemplateItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface DhrTemplateItemRepository extends JpaRepository<DhrTemplateItem, Long>, JpaSpecificationExecutor<DhrTemplateItem> {
    List<DhrTemplateItem> findByDirectoryIdInOrderBySortOrderAscIdAsc(Collection<Long> directoryIds);

    List<DhrTemplateItem> findByDirectoryIdOrderBySortOrderAscIdAsc(Long directoryId);

    boolean existsByDirectoryIdAndFormTemplateId(Long directoryId, Long formTemplateId);
}
