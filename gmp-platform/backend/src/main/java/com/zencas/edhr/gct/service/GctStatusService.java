package com.zencas.edhr.gct.service;

import com.zencas.edhr.gct.dto.GctStatusHistoryDto;
import com.zencas.edhr.gct.store.InMemoryGctRecordStore;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GctStatusService {

    private final InMemoryGctRecordStore store;

    public List<GctStatusHistoryDto> listStatusHistory(String pageCode, String recordId) {
        return store.listStatusHistory(pageCode, recordId);
    }
}
