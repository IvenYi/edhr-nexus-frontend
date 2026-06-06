package com.zencas.edhr.identity.repository;

import com.zencas.edhr.identity.entity.UserDepartment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface UserDepartmentRepository extends JpaRepository<UserDepartment, Long>, JpaSpecificationExecutor<UserDepartment> {
}
