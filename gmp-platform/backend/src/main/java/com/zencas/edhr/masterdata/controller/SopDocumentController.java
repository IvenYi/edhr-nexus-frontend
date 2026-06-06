package com.zencas.edhr.masterdata.controller;

import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.common.dto.PageResult;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.masterdata.entity.SopDocument;
import com.zencas.edhr.masterdata.repository.SopDocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/master-data/sop-documents")
@RequiredArgsConstructor
public class SopDocumentController {

    private final SopDocumentRepository sopDocumentRepository;
    private final SnowflakeIdGenerator idGenerator;

    @GetMapping
    public ApiResponse<PageResult<SopDocument>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String order) {
        Sort.Direction direction = "asc".equalsIgnoreCase(order) ? Sort.Direction.ASC : Sort.Direction.DESC;
        PageRequest pageable = PageRequest.of(page - 1, size, Sort.by(direction, sort));
        Page<SopDocument> result = sopDocumentRepository.findAll(pageable);
        return ApiResponse.success(PageResult.of(result.getContent(), page, size, result.getTotalElements()));
    }

    @GetMapping("/{id}")
    public ApiResponse<SopDocument> getById(@PathVariable Long id) {
        return sopDocumentRepository.findById(id)
                .map(ApiResponse::success)
                .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "记录不存在"));
    }

    @PostMapping
    public ApiResponse<SopDocument> create(@RequestBody SopDocument entity) {
        if (entity.getId() == null) entity.setId(idGenerator.nextId());
        return ApiResponse.success(sopDocumentRepository.save(entity));
    }

    @PutMapping("/{id}")
    public ApiResponse<SopDocument> update(@PathVariable Long id, @RequestBody SopDocument entity) {
        if (!sopDocumentRepository.existsById(id))
            throw new BusinessException(ErrorCode.GENERAL_001, "记录不存在");
        entity.setId(id);
        return ApiResponse.success(sopDocumentRepository.save(entity));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        sopDocumentRepository.deleteById(id);
        return ApiResponse.success(null);
    }
}
