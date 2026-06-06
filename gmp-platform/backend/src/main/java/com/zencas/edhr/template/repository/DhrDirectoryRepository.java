package com.zencas.edhr.template.repository;

import com.zencas.edhr.template.entity.DhrDirectory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface DhrDirectoryRepository extends JpaRepository<DhrDirectory, Long>, JpaSpecificationExecutor<DhrDirectory> {
}
