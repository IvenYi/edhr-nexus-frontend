package com.zencas.edhr.gct.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import com.zencas.edhr.gct.dto.GctPageSpecDto;
import com.zencas.edhr.gct.dto.GctSpecBundleDto;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class GctPageRegistry {

    private static final String SPEC_RESOURCE = "gct/gct-page-specs.json";

    private final GctSpecBundleDto bundle;
    private final Map<String, GctPageSpecDto> pagesByCode;

    public GctPageRegistry(ObjectMapper objectMapper) {
        this.bundle = loadBundle(objectMapper);
        this.pagesByCode = indexPages(bundle);
    }

    public GctSpecBundleDto getBundle() {
        return bundle;
    }

    public List<GctPageSpecDto> listPages() {
        return bundle.getPages() == null ? List.of() : Collections.unmodifiableList(bundle.getPages());
    }

    public GctPageSpecDto getPage(String pageCode) {
        return pagesByCode.get(pageCode);
    }

    public Optional<GctPageSpecDto> findPage(String pageCode) {
        return Optional.ofNullable(getPage(pageCode));
    }

    public GctPageSpecDto getPageOrThrow(String pageCode) {
        GctPageSpecDto page = getPage(pageCode);
        if (page == null) {
            throw new BusinessException(ErrorCode.GENERAL_001, "GCT page not found: " + pageCode);
        }
        return page;
    }

    private GctSpecBundleDto loadBundle(ObjectMapper objectMapper) {
        ClassPathResource resource = new ClassPathResource(SPEC_RESOURCE);
        try (InputStream inputStream = resource.getInputStream()) {
            return objectMapper.readValue(inputStream, GctSpecBundleDto.class);
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to load GCT page specs from classpath:" + SPEC_RESOURCE, ex);
        }
    }

    private Map<String, GctPageSpecDto> indexPages(GctSpecBundleDto bundle) {
        Map<String, GctPageSpecDto> index = new LinkedHashMap<>();
        if (bundle.getPages() == null) {
            return index;
        }
        for (GctPageSpecDto page : bundle.getPages()) {
            if (page.getCode() != null) {
                index.put(page.getCode(), page);
            }
        }
        return Collections.unmodifiableMap(index);
    }
}
