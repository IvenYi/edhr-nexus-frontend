package com.zencas.edhr.identity.repository;

import com.zencas.edhr.identity.entity.UserDepartment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserDepartmentRepository extends JpaRepository<UserDepartment, Long>, JpaSpecificationExecutor<UserDepartment> {
    List<UserDepartment> findByUserId(Long userId);
    List<UserDepartment> findByUserIdIn(List<Long> userIds);
    void deleteByUserId(Long userId);
}
