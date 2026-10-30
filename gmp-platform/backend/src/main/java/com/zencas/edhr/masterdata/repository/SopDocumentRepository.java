package com.zencas.edhr.masterdata.repository;

import com.zencas.edhr.masterdata.entity.SopDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SopDocumentRepository extends JpaRepository<SopDocument, Long>, JpaSpecificationExecutor<SopDocument> {
    boolean existsByTenantIdAndCodeIgnoreCase(String tenantId, String code);

    String LIST_FILTER = """
            WHERE (:allCategories = true
                OR (:uncategorized = true AND d.category_id IS NULL)
                OR (:uncategorized = false AND d.category_id = :categoryId))
              AND (:pattern = '' OR LOWER(NORMALIZE(UPPER(d.title))) LIKE LOWER(NORMALIZE(UPPER(:pattern))) ESCAPE '!'
                OR EXISTS (SELECT 1 FROM document_version v
                    WHERE v.document_id = d.id AND LOWER(NORMALIZE(UPPER(v.code))) LIKE LOWER(NORMALIZE(UPPER(:pattern))) ESCAPE '!'))
            """;

    @Query(value = "SELECT COUNT(*) FROM sop_document d " + LIST_FILTER, nativeQuery = true)
    long countForList(@Param("allCategories") boolean allCategories, @Param("uncategorized") boolean uncategorized,
                      @Param("categoryId") long categoryId, @Param("pattern") String pattern);

    @Query(value = "SELECT d.* FROM sop_document d " + LIST_FILTER
            + " ORDER BY d.updated_at DESC NULLS FIRST, d.id ASC LIMIT :limit OFFSET :offset", nativeQuery = true)
    List<SopDocument> findPageForList(@Param("allCategories") boolean allCategories, @Param("uncategorized") boolean uncategorized,
                                    @Param("categoryId") long categoryId, @Param("pattern") String pattern,
                                    @Param("limit") int limit, @Param("offset") long offset);

    @Query(value = "SELECT category_id AS \"categoryId\", COUNT(*) AS \"documentCount\" FROM sop_document GROUP BY category_id", nativeQuery = true)
    List<CategoryCount> countGroupedByCategory();

    interface CategoryCount {
        Long getCategoryId();
        long getDocumentCount();
    }
}
