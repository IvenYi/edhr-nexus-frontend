package com.zencas.edhr.compliance.controller;

import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.common.dto.PageResult;
import com.zencas.edhr.compliance.entity.Signature;
import com.zencas.edhr.compliance.repository.SignatureRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/signatures")
@RequiredArgsConstructor
public class SignatureController {

    private final SignatureRepository signatureRepository;

    @GetMapping
    public ApiResponse<PageResult<Signature>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String order) {
        Sort.Direction direction = "asc".equalsIgnoreCase(order) ? Sort.Direction.ASC : Sort.Direction.DESC;
        PageRequest pageable = PageRequest.of(page - 1, size, Sort.by(direction, sort));
        Page<Signature> result = signatureRepository.findAll(pageable);
        return ApiResponse.success(PageResult.of(
                result.getContent(), page, size, result.getTotalElements()));
    }

    @GetMapping("/{id}")
    public ApiResponse<Signature> getById(@PathVariable Long id) {
        return signatureRepository.findById(id)
                .map(ApiResponse::success)
                .orElseThrow(() -> new com.zencas.edhr.common.exception.BusinessException(
                        com.zencas.edhr.common.exception.ErrorCode.GENERAL_001, "记录不存在"));
    }

    @PostMapping
    public ApiResponse<Signature> create(@RequestBody Signature entity) {
        protectExecutionSignature(entity);
        if (entity.getId() != null) signatureRepository.findById(entity.getId()).ifPresent(this::protectExecutionSignature);
        return ApiResponse.success(signatureRepository.save(entity));
    }

    @PutMapping("/{id}")
    public ApiResponse<Signature> update(@PathVariable Long id, @RequestBody Signature entity) {
        protectExecutionSignature(entity);
        signatureRepository.findById(id).ifPresent(this::protectExecutionSignature);
        entity.setId(id);
        return ApiResponse.success(signatureRepository.save(entity));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        signatureRepository.findById(id).ifPresent(this::protectExecutionSignature);
        signatureRepository.deleteById(id);
        return ApiResponse.success(null);
    }

    private void protectExecutionSignature(Signature signature) {
        if ("PRODUCTION_EXECUTION".equals(signature.getTargetType()))
            throw new com.zencas.edhr.common.exception.BusinessException(
                com.zencas.edhr.common.exception.ErrorCode.GENERAL_003, "生产执行签名只能由执行动作生成，且不可修改或删除");
    }
}
