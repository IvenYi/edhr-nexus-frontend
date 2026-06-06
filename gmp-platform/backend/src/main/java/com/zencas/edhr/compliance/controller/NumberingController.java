package com.zencas.edhr.compliance.controller;

import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.common.dto.PageResult;
import com.zencas.edhr.compliance.entity.NumberingRule;
import com.zencas.edhr.compliance.repository.NumberingRuleRepository;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/numbering-rules")
@RequiredArgsConstructor
public class NumberingController {

    private final NumberingRuleRepository numberingRuleRepository;
    private final SnowflakeIdGenerator idGenerator;

    @GetMapping
    public ApiResponse<PageResult<NumberingRule>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String order) {
        Sort.Direction direction = "asc".equalsIgnoreCase(order) ? Sort.Direction.ASC : Sort.Direction.DESC;
        PageRequest pageable = PageRequest.of(page - 1, size, Sort.by(direction, sort));
        Page<NumberingRule> result = numberingRuleRepository.findAll(pageable);
        return ApiResponse.success(PageResult.of(
                result.getContent(), page, size, result.getTotalElements()));
    }

    @GetMapping("/{id}")
    public ApiResponse<NumberingRule> getById(@PathVariable Long id) {
        return numberingRuleRepository.findById(id)
                .map(ApiResponse::success)
                .orElseThrow(() -> new com.zencas.edhr.common.exception.BusinessException(
                        com.zencas.edhr.common.exception.ErrorCode.GENERAL_001, "记录不存在"));
    }

    @PostMapping
    public ApiResponse<NumberingRule> create(@RequestBody NumberingRule entity) {
        if (entity.getId() == null) entity.setId(idGenerator.nextId());

        return ApiResponse.success(numberingRuleRepository.save(entity));
    }

    @PutMapping("/{id}")
    public ApiResponse<NumberingRule> update(@PathVariable Long id, @RequestBody NumberingRule entity) {
        entity.setId(id);
        if (entity.getId() == null) entity.setId(idGenerator.nextId());

        return ApiResponse.success(numberingRuleRepository.save(entity));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        numberingRuleRepository.deleteById(id);
        return ApiResponse.success(null);
    }
}
