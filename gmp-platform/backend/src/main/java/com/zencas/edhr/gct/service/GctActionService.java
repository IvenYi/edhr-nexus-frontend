package com.zencas.edhr.gct.service;

import com.zencas.edhr.gct.dto.GctActionRequest;
import com.zencas.edhr.gct.dto.GctActionResultDto;
import com.zencas.edhr.gct.store.InMemoryGctRecordStore;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GctActionService {

    private final InMemoryGctRecordStore store;

    public GctActionResultDto executeAction(
            String pageCode,
            String recordId,
            String actionCode,
            GctActionRequest request) {
        return store.executeAction(pageCode, recordId, actionCode, request);
    }
}
