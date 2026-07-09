package com.zencas.edhr.masterdata.controller;

import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.common.dto.PageResult;
import com.zencas.edhr.masterdata.entity.Route;
import com.zencas.edhr.masterdata.repository.RouteRepository;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/master-data/routes")
@RequiredArgsConstructor
public class RouteController {

    private final RouteRepository routeRepository;
    private final SnowflakeIdGenerator idGenerator;

    @GetMapping
    public ApiResponse<PageResult<Route>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String order) {
        Sort.Direction direction = "asc".equalsIgnoreCase(order) ? Sort.Direction.ASC : Sort.Direction.DESC;
        PageRequest pageable = PageRequest.of(page - 1, size, Sort.by(direction, sort));
        Page<Route> result = routeRepository.findAll(pageable);
        return ApiResponse.success(PageResult.of(
                result.getContent(), page, size, result.getTotalElements()));
    }

    @GetMapping("/{id}")
    public ApiResponse<Route> getById(@PathVariable Long id) {
        return routeRepository.findById(id)
                .map(ApiResponse::success)
                .orElseThrow(() -> new com.zencas.edhr.common.exception.BusinessException(
                        com.zencas.edhr.common.exception.ErrorCode.GENERAL_001, "记录不存在"));
    }

    @PostMapping
    public ApiResponse<Route> create(@RequestBody Route entity) {
        if (entity.getId() == null) entity.setId(idGenerator.nextId());

        return ApiResponse.success(routeRepository.save(entity));
    }

    @PutMapping("/{id}")
    public ApiResponse<Route> update(@PathVariable Long id, @RequestBody Route entity) {
        entity.setId(id);
        if (entity.getId() == null) entity.setId(idGenerator.nextId());

        return ApiResponse.success(routeRepository.save(entity));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        routeRepository.deleteById(id);
        return ApiResponse.success(null);
    }
}
