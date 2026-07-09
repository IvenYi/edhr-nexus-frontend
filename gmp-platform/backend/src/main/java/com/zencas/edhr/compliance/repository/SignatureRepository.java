package com.zencas.edhr.compliance.repository;

import com.zencas.edhr.compliance.entity.Signature;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SignatureRepository extends JpaRepository<Signature, Long>, JpaSpecificationExecutor<Signature> {
    Optional<Signature> findFirstByTargetTypeAndTargetIdOrderBySignedAtDesc(String targetType, String targetId);

    @Query("""
            select s from Signature s
            where s.targetType = :targetType
              and s.targetId in :targetIds
              and s.signedAt = (
                  select max(s2.signedAt)
                  from Signature s2
                  where s2.targetType = s.targetType
                    and s2.targetId = s.targetId
              )
            """)
    List<Signature> findLatestByTargetTypeAndTargetIdIn(String targetType, List<String> targetIds);
}
