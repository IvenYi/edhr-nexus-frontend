package com.zencas.edhr.template.repository;

import com.zencas.edhr.template.entity.DhrTemplateItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface DhrTemplateItemRepository extends JpaRepository<DhrTemplateItem, Long>, JpaSpecificationExecutor<DhrTemplateItem> {
}
