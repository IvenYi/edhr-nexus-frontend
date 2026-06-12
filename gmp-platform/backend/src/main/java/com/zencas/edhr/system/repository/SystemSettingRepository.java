package com.zencas.edhr.system.repository;

import com.zencas.edhr.system.entity.SystemSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SystemSettingRepository extends JpaRepository<SystemSetting, Long> {
    Optional<SystemSetting> findByTenantId(String tenantId);

    boolean existsBySystemLogoFileIdOrBrowserIconFileId(Long systemLogoFileId, Long browserIconFileId);
}
