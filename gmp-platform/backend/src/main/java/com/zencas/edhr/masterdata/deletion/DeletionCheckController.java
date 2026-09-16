package com.zencas.edhr.masterdata.deletion;

import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Set;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/master-data/deletion-check")
public class DeletionCheckController {
    private static final Set<String> TARGETS = Set.of("material", "product_family", "product_process_version",
            "operation", "operation_category", "route", "route_version", "sop_document", "document_version",
            "document_category", "form_template", "form_template_version", "dhr_template", "dhr_template_version",
            "template_category", "dhr_directory", "dhr_template_item", "equipment_category", "equipment_type",
            "equipment", "workshop", "unit_of_measure");
    private final DeletionProtectionService protection;

    public record Result(boolean allowed, DeletionImpact impact) {}

    @GetMapping("/{type}/{id}")
    @Transactional
    public ApiResponse<Result> check(@PathVariable String type, @PathVariable long id) {
        if (!TARGETS.contains(type)) throw new BusinessException(ErrorCode.GENERAL_001, "不支持的删除检查类型");
        try {
            protection.check(type, id);
            return ApiResponse.success(new Result(true, null));
        } catch (DeletionBlockedException ex) {
            return ApiResponse.success(new Result(false, ex.getImpact()));
        }
    }
}
