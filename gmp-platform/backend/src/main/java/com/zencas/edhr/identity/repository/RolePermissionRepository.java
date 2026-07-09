package com.zencas.edhr.identity.repository;

import com.zencas.edhr.identity.entity.RolePermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RolePermissionRepository extends JpaRepository<RolePermission, Long> {
    List<RolePermission> findByRoleIdIn(List<Long> roleIds);
    List<RolePermission> findByRoleId(Long roleId);
    void deleteByRoleId(Long roleId);
}
