package com.zencas.edhr.gct.service;

import com.zencas.edhr.gct.dto.GctAuditEntryDto;
import com.zencas.edhr.gct.store.InMemoryGctRecordStore;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GctAuditService {

    private final InMemoryGctRecordStore store;

    public List<GctAuditEntryDto> listAudit(String pageCode, String recordId) {
        return store.listAudit(pageCode, recordId);
    }
}
