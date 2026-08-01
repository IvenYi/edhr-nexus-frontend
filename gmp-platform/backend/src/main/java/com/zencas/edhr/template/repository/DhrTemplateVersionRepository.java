package com.zencas.edhr.template.repository;

import com.zencas.edhr.template.entity.DhrTemplateVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface DhrTemplateVersionRepository extends JpaRepository<DhrTemplateVersion, Long>, JpaSpecificationExecutor<DhrTemplateVersion> {
    List<DhrTemplateVersion> findByDhrTemplateIdOrderByVersionNumberDesc(Long dhrTemplateId);

    List<DhrTemplateVersion> findByDhrTemplateIdInOrderByDhrTemplateIdAscVersionNumberDesc(Collection<Long> dhrTemplateIds);

    Optional<DhrTemplateVersion> findByIdAndDhrTemplateId(Long id, Long dhrTemplateId);

    List<DhrTemplateVersion> findByDhrTemplateIdAndVersionLabelIgnoreCase(Long dhrTemplateId, String versionLabel);

    List<DhrTemplateVersion> findByCodeIgnoreCase(String code);
}
