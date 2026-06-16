package com.zencas.edhr.compliance.repository;

import com.zencas.edhr.compliance.entity.Signature;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SignatureRepository extends JpaRepository<Signature, Long>, JpaSpecificationExecutor<Signature> {
    Optional<Signature> findFirstByTargetTypeAndTargetIdOrderBySignedAtDesc(String targetType, String targetId);
}
