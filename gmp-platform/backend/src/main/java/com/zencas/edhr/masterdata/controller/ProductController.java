package com.zencas.edhr.masterdata.controller;

import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.common.dto.PageResult;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.masterdata.entity.ProductFamily;
import com.zencas.edhr.masterdata.repository.ProductFamilyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/master-data/product-families")
@RequiredArgsConstructor
public class ProductController {

    private final ProductFamilyRepository productFamilyRepository;
    private final SnowflakeIdGenerator idGenerator;

    @GetMapping
    public ApiResponse<PageResult<ProductFamily>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String order) {
        Sort.Direction direction = "asc".equalsIgnoreCase(order) ? Sort.Direction.ASC : Sort.Direction.DESC;
        PageRequest pageable = PageRequest.of(page - 1, size, Sort.by(direction, sort));
        Page<ProductFamily> result = productFamilyRepository.findAll(pageable);
        return ApiResponse.success(PageResult.of(
                result.getContent(), page, size, result.getTotalElements()));
    }

    @GetMapping("/{id}")
    public ApiResponse<ProductFamily> getById(@PathVariable Long id) {
        return productFamilyRepository.findById(id)
                .map(ApiResponse::success)
                .orElseThrow(() -> new com.zencas.edhr.common.exception.BusinessException(
                        com.zencas.edhr.common.exception.ErrorCode.GENERAL_001, "记录不存在"));
    }

    @PostMapping
    public ApiResponse<ProductFamily> create(@RequestBody ProductFamily entity) {
        if (entity.getId() == null) entity.setId(idGenerator.nextId());
        return ApiResponse.success(productFamilyRepository.save(entity));
    }

    @PutMapping("/{id}")
    public ApiResponse<ProductFamily> update(@PathVariable Long id, @RequestBody ProductFamily entity) {
        if (!productFamilyRepository.existsById(id)) {
            throw new com.zencas.edhr.common.exception.BusinessException(
                    com.zencas.edhr.common.exception.ErrorCode.GENERAL_001, "记录不存在");
        }
        entity.setId(id);
        return ApiResponse.success(productFamilyRepository.save(entity));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        productFamilyRepository.deleteById(id);
        return ApiResponse.success(null);
    }
}
