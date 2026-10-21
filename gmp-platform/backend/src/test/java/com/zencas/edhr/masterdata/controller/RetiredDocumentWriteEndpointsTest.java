package com.zencas.edhr.masterdata.controller;

import com.zencas.edhr.common.exception.GlobalExceptionHandler;
import com.zencas.edhr.masterdata.entity.SopDocument;
import com.zencas.edhr.masterdata.repository.SopDocumentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import java.util.Optional;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class RetiredDocumentWriteEndpointsTest {
    @Mock SopDocumentRepository documents;
    @InjectMocks SopDocumentController sop;
    @InjectMocks ProcessModelingController modeling;
    private MockMvc mvc;

    @BeforeEach void setUp() {
        mvc = MockMvcBuilders.standaloneSetup(sop, modeling)
                .setControllerAdvice(new GlobalExceptionHandler()).build();
    }

    @Test void removedLegacyWritesAreUnavailableWithoutReachingPersistence() throws Exception {
        for (String base : new String[]{"/api/v1/master-data/sop-documents", "/api/v1/master-data/process-modeling/documents"}) {
            mvc.perform(post(base).contentType("application/json").content("{\"title\":\"旧写入\"}"))
                .andExpect(status().isMethodNotAllowed()).andExpect(jsonPath("$.code").value(405));
            int absentMethodStatus = base.endsWith("sop-documents") ? 405 : 404;
            mvc.perform(put(base + "/1").contentType("application/json").content("{\"title\":\"旧编辑\"}"))
                .andExpect(status().is(absentMethodStatus)).andExpect(jsonPath("$.code").value(absentMethodStatus));
            mvc.perform(delete(base + "/1")).andExpect(status().is(absentMethodStatus))
                .andExpect(jsonPath("$.code").value(absentMethodStatus));
        }
        verifyNoInteractions(documents);
    }

    @Test void historicalSopReadRemainsAvailable() throws Exception {
        when(documents.findById(1L)).thenReturn(Optional.of(SopDocument.builder().id(1L).title("历史文档").build()));
        mvc.perform(get("/api/v1/master-data/sop-documents/1"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.data.title").value("历史文档"));
        verify(documents).findById(1L);
        verifyNoMoreInteractions(documents);
    }
}
