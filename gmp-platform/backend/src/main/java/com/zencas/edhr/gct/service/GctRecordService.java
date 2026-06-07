package com.zencas.edhr.gct.service;

import com.zencas.edhr.common.dto.PageResult;
import com.zencas.edhr.gct.dto.GctRecordDto;
import com.zencas.edhr.gct.dto.GctRecordMutationRequest;
import com.zencas.edhr.gct.dto.GctRecordQueryRequest;
import com.zencas.edhr.gct.store.InMemoryGctRecordStore;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GctRecordService {

    private final InMemoryGctRecordStore store;

    public PageResult<GctRecordDto> query(String pageCode, GctRecordQueryRequest request) {
        return store.query(pageCode, request);
    }

    public GctRecordDto find(String pageCode, String recordId) {
        return store.find(pageCode, recordId);
    }

    public GctRecordDto create(String pageCode, GctRecordMutationRequest request) {
        return store.create(pageCode, request);
    }

    public GctRecordDto update(String pageCode, String recordId, GctRecordMutationRequest request) {
        return store.update(pageCode, recordId, request);
    }

    public GctRecordDto delete(String pageCode, String recordId) {
        return store.delete(pageCode, recordId);
    }
}
