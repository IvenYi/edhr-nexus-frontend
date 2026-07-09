package com.zencas.edhr.compliance.repository;

import com.zencas.edhr.compliance.entity.FileObject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface FileObjectRepository extends JpaRepository<FileObject, Long>, JpaSpecificationExecutor<FileObject> {
}
