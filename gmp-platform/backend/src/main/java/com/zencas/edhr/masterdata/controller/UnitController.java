package com.zencas.edhr.masterdata.controller;

import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.common.dto.PageResult;
import com.zencas.edhr.masterdata.entity.UnitOfMeasure;
import com.zencas.edhr.masterdata.repository.UnitOfMeasureRepository;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/master-data/units")
@RequiredArgsConstructor
public class UnitController {

    private final UnitOfMeasureRepository unitOfMeasureRepository;
    private final SnowflakeIdGenerator idGenerator;

    @GetMapping
    public ApiResponse<PageResult<UnitOfMeasure>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String order) {
        Sort.Direction direction = "asc".equalsIgnoreCase(order) ? Sort.Direction.ASC : Sort.Direction.DESC;
        PageRequest pageable = PageRequest.of(page - 1, size, Sort.by(direction, sort));
        Page<UnitOfMeasure> result = unitOfMeasureRepository.findAll(pageable);
        return ApiResponse.success(PageResult.of(
                result.getContent(), page, size, result.getTotalElements()));
    }

    @GetMapping("/{id}")
    public ApiResponse<UnitOfMeasure> getById(@PathVariable Long id) {
        return unitOfMeasureRepository.findById(id)
                .map(ApiResponse::success)
                .orElseThrow(() -> new com.zencas.edhr.common.exception.BusinessException(
                        com.zencas.edhr.common.exception.ErrorCode.GENERAL_001, "记录不存在"));
    }

    @PostMapping
    public ApiResponse<UnitOfMeasure> create(@RequestBody UnitOfMeasure entity) {
        if (entity.getId() == null) entity.setId(idGenerator.nextId());

        return ApiResponse.success(unitOfMeasureRepository.save(entity));
    }

    @PutMapping("/{id}")
    public ApiResponse<UnitOfMeasure> update(@PathVariable Long id, @RequestBody UnitOfMeasure entity) {
        entity.setId(id);
        if (entity.getId() == null) entity.setId(idGenerator.nextId());

        return ApiResponse.success(unitOfMeasureRepository.save(entity));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        unitOfMeasureRepository.deleteById(id);
        return ApiResponse.success(null);
    }
}
