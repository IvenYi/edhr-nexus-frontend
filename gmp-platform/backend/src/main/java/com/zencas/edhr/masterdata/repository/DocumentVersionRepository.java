package com.zencas.edhr.masterdata.repository;

import com.zencas.edhr.masterdata.entity.DocumentVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentVersionRepository extends JpaRepository<DocumentVersion, Long> {
    List<DocumentVersion> findByDocumentIdOrderByCreatedAtDesc(Long documentId);
    List<DocumentVersion> findByDocumentIdInOrderByCreatedAtDesc(Collection<Long> documentIds);
    Optional<DocumentVersion> findByDocumentIdAndId(Long documentId, Long id);
    boolean existsByDocumentIdAndVersionIgnoreCase(Long documentId, String version);
}
