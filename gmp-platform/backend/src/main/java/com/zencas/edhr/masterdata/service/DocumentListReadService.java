package com.zencas.edhr.masterdata.service;

import com.zencas.edhr.compliance.entity.FileObject;
import com.zencas.edhr.compliance.repository.FileObjectRepository;
import com.zencas.edhr.masterdata.entity.DocumentCategory;
import com.zencas.edhr.masterdata.entity.DocumentVersion;
import com.zencas.edhr.masterdata.entity.SopDocument;
import com.zencas.edhr.masterdata.repository.DocumentCategoryRepository;
import com.zencas.edhr.masterdata.repository.DocumentVersionRepository;
import com.zencas.edhr.masterdata.repository.SopDocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DocumentListReadService {
    // Bound IN parameters independently of a document's complete version history; no API page-size cap.
    private static final int ID_BATCH_SIZE = 512;
    private final SopDocumentRepository documents;
    private final DocumentVersionRepository versions;
    private final DocumentCategoryRepository categories;
    private final FileObjectRepository files;

    @Transactional(readOnly = true, isolation = Isolation.REPEATABLE_READ)
    public DocumentPage read(String normalizedCategoryId, String keyword, int page, int size) {
        int safePage = Math.max(page, 1), safeSize = Math.max(size, 1);
        boolean all = "ALL".equals(normalizedCategoryId), uncategorized = "UNCATEGORIZED".equals(normalizedCategoryId);
        long categoryId = all || uncategorized ? 0 : Long.parseLong(normalizedCategoryId);
        String pattern = StringUtils.hasText(keyword) ? "%" + keyword.trim().toLowerCase(Locale.ROOT)
                .replace("!", "!!").replace("%", "!%").replace("_", "!_") + "%" : "";
        long total = documents.countForList(all, uncategorized, categoryId, pattern);
        long offset = (long) (safePage - 1) * safeSize;
        if (offset >= total) return new DocumentPage(List.of(), Map.of(), Map.of(), Map.of(), safePage, safeSize, total);

        List<SopDocument> pageDocuments = documents.findPageForList(all, uncategorized, categoryId, pattern, safeSize, offset);
        List<DocumentVersion> pageVersions = readBatches(pageDocuments.stream().map(SopDocument::getId).toList(),
                versions::findByDocumentIdInOrderByCreatedAtDesc);
        Map<Long, List<DocumentVersion>> versionsByDocument = pageVersions.stream().collect(Collectors.groupingBy(DocumentVersion::getDocumentId));
        Map<Long, FileObject> filesById = readBatches(pageVersions.stream().map(DocumentVersion::getFileId)
                .filter(Objects::nonNull).distinct().toList(), files::findAllById).stream()
                .collect(Collectors.toMap(FileObject::getId, Function.identity()));
        Map<Long, DocumentCategory> categoriesById = readBatches(pageDocuments.stream().map(SopDocument::getCategoryId)
                .filter(Objects::nonNull).distinct().toList(), categories::findAllById).stream()
                .filter(category -> "default".equals(category.getTenantId()))
                .collect(Collectors.toMap(DocumentCategory::getId, Function.identity()));
        return new DocumentPage(pageDocuments, versionsByDocument, categoriesById, filesById, safePage, safeSize, total);
    }

    private <T> List<T> readBatches(List<Long> ids, Function<List<Long>, List<T>> read) {
        List<T> rows = new ArrayList<>();
        for (int start = 0; start < ids.size();) {
            int end = start + Math.min(ID_BATCH_SIZE, ids.size() - start);
            rows.addAll(read.apply(ids.subList(start, end)));
            start = end;
        }
        return rows;
    }

    public record DocumentPage(List<SopDocument> documents, Map<Long, List<DocumentVersion>> versionsByDocument,
                               Map<Long, DocumentCategory> categoriesById, Map<Long, FileObject> filesById,
                               int page, int size, long total) {}
}
