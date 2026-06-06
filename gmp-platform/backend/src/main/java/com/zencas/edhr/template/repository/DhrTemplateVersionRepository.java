package com.zencas.edhr.template.repository;

import com.zencas.edhr.template.entity.DhrTemplateVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface DhrTemplateVersionRepository extends JpaRepository<DhrTemplateVersion, Long>, JpaSpecificationExecutor<DhrTemplateVersion> {
}
