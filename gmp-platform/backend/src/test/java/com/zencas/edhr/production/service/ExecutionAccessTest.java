package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.controller.SignatureController;
import com.zencas.edhr.compliance.controller.FileController;
import com.zencas.edhr.compliance.entity.Signature;
import com.zencas.edhr.compliance.entity.FileObject;
import com.zencas.edhr.compliance.repository.SignatureRepository;
import com.zencas.edhr.compliance.repository.FileObjectRepository;
import com.zencas.edhr.identity.dto.SubjectResolution;
import com.zencas.edhr.identity.dto.ResolvedSubjectUser;
import com.zencas.edhr.identity.entity.UserAccount;
import com.zencas.edhr.identity.repository.UserAccountRepository;
import com.zencas.edhr.identity.service.SubjectResolver;
import org.junit.jupiter.api.*;
import org.mockito.ArgumentCaptor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import java.util.*;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;

class ExecutionAccessTest {
    final ObjectMapper mapper = new ObjectMapper();
    final SubjectResolver subjects = mock(SubjectResolver.class);
    final UserAccountRepository users = mock(UserAccountRepository.class);
    final SignatureRepository signatures = mock(SignatureRepository.class);
    final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(4);
    final ExecutionAccess access = new ExecutionAccess(subjects, users, encoder, signatures, new SnowflakeIdGenerator(1), mapper, mock(JdbcTemplate.class));
    @AfterEach void clear() { AuditContext.clear(); }

    @Test void signatureAuthenticatesCurrentUserAndStoresHashWithoutCredentials() throws Exception {
        AuditContext.setOperator("1", "操作员");
        when(users.findById(1L)).thenReturn(Optional.of(UserAccount.builder().id(1L).username("operator").displayName("操作员").status("ACTIVE").passwordHash(encoder.encode("test-secret")).build()));
        assertThatThrownBy(() -> access.sign("101", "f", "SUBMIT", mapper.createObjectNode(), "other", "test-secret")).hasMessageContaining("密码不正确");
        assertThatThrownBy(() -> access.sign("101", "f", "SUBMIT", mapper.createObjectNode(), "operator", "wrong")).hasMessageContaining("密码不正确");
        verifyNoInteractions(signatures);
        access.sign("101", "f", "SUBMIT", mapper.createObjectNode().put("temperature", 20), "operator", "test-secret");
        var captured = ArgumentCaptor.forClass(Signature.class); verify(signatures).save(captured.capture());
        Signature signed = captured.getValue();
        assertThat(signed.getSignerId()).isEqualTo("1");
        assertThat(signed.getSnapshotHash()).hasSize(64);
        assertThat(signed.getSnapshotData()).contains("temperature").doesNotContain("test-secret", "password");
    }

    @Test void capturesApprovalCandidatesOnceAndDoesNotOpenAnUnresolvedRestrictedGroup() throws Exception {
        var node = mapper.readTree("""
            {"id":"a","data":{"kind":"APPROVAL","config":{"approverSubjects":[{"type":"ROLE","id":"7"}]}}}
            """);
        ObjectNode state = mapper.createObjectNode();
        when(subjects.resolve(eq(0L), anyCollection())).thenReturn(new SubjectResolution(List.of(new ResolvedSubjectUser(1L, Set.of())), Set.of()));
        access.captureApprovers(node, state);
        when(subjects.resolve(eq(0L), anyCollection())).thenReturn(new SubjectResolution(List.of(), Set.of()));
        access.captureApprovers(node, state);
        assertThat(access.canAct(mapper.createObjectNode(), node, state, "1")).isTrue();
        assertThat(access.canAct(mapper.createObjectNode(), node, state, "2")).isFalse();
        ObjectNode unresolved = mapper.createObjectNode(); access.captureApprovers(node, unresolved);
        assertThat(access.canAct(mapper.createObjectNode(), node, unresolved, "1")).isFalse();
    }

    @Test void stableFieldOverridesAndReadOnlyConflictWin() throws Exception {
        var node = mapper.readTree("""
            {"id":"s","data":{"kind":"START","config":{"permissionGroupRules":[
              {"id":"g1","subjects":[{"type":"USER","id":"1"}],"defaultPermission":"EDIT"},
              {"id":"g2","subjects":[{"type":"USER","id":"1"}],"defaultPermission":"READ_ONLY"}]}}}
            """);
        var form = mapper.readTree("""
            {"fields":[{"id":"f","type":"text"},{"id":"sig","type":"signature"}],
             "binding":{"fieldPermissions":{"start:g2":{"editableFieldIds":["f"]},"start:g1":{"readOnlyFieldIds":["f"]}}}}
            """);
        when(subjects.resolve(eq(0L), anyCollection())).thenReturn(new SubjectResolution(List.of(new ResolvedSubjectUser(1L, Set.of())), Set.of()));
        var permissions = access.permissions(form, node, mapper.createObjectNode(), "1");
        assertThat(permissions.path("f").asText()).isEqualTo("READ_ONLY");
        assertThat(permissions.path("sig").asText()).isEqualTo("READ_ONLY");
    }

    @Test void executionSignaturesCannotBeForgedOverwrittenOrDeletedThroughGenericCrud() {
        Signature stored = Signature.builder().id(1L).targetType("PRODUCTION_EXECUTION").build();
        when(signatures.findById(1L)).thenReturn(Optional.of(stored));
        SignatureController controller = new SignatureController(signatures);
        assertThatThrownBy(() -> controller.create(stored)).hasMessageContaining("不可修改");
        assertThatThrownBy(() -> controller.create(Signature.builder().id(1L).targetType("OTHER").build())).hasMessageContaining("不可修改");
        assertThatThrownBy(() -> controller.update(1L, Signature.builder().targetType("OTHER").build())).hasMessageContaining("不可修改");
        assertThatThrownBy(() -> controller.delete(1L)).hasMessageContaining("不可修改");
        verify(signatures, never()).save(any()); verify(signatures, never()).deleteById(any());
    }

    @Test void executionAttachmentsCannotBeDeletedThroughGenericFiles() {
        var files = mock(FileObjectRepository.class);
        when(files.findById(1L)).thenReturn(Optional.of(FileObject.builder().id(1L).targetType("PRODUCTION_EXECUTION").build()));
        var controller = new FileController(files, null, null, null, null);
        assertThatThrownBy(() -> controller.delete(1L)).hasMessageContaining("追溯证据");
        verify(files, never()).deleteById(any());
    }

    @Test void referenceSearchAndValidationReachIdsBeyondFirstHundredSameNameRows() throws Exception {
        var jdbc = new JdbcTemplate(new org.springframework.jdbc.datasource.DriverManagerDataSource("jdbc:h2:mem:execution-references;DB_CLOSE_DELAY=-1", "sa", ""));
        jdbc.execute("CREATE TABLE material(id BIGINT PRIMARY KEY,name VARCHAR(128),status VARCHAR(16))");
        try {
            for (int i = 1; i <= 105; i++) jdbc.update("INSERT INTO material VALUES(?,'同名物料','ACTIVE')", i);
            var real = new ExecutionAccess(subjects, users, encoder, signatures, new SnowflakeIdGenerator(1), mapper, jdbc);
            var field = mapper.readTree("{\"id\":\"ref\",\"name\":\"物料\",\"type\":\"reference\",\"typeConfig\":{\"sourceType\":\"material\"}}");
            assertThat(real.references(field, "105")).singleElement().satisfies(item -> assertThat(item.get("id")).isEqualTo("105"));
            real.validateEvidence(field, mapper.readTree("{\"id\":\"105\",\"name\":\"同名物料\"}"), "101");
            assertThatThrownBy(() -> real.validateEvidence(field, mapper.readTree("{\"id\":\"105\",\"name\":\"伪造名称\"}"), "101")).hasMessageContaining("已失效");
        } finally { jdbc.execute("DROP TABLE material"); }
    }

    @Test void sopPdfPagePreviewRendersImageAndRejectsOutOfRange(@org.junit.jupiter.api.io.TempDir java.nio.file.Path directory) throws Exception {
        var path = directory.resolve("sop.pdf");
        try (var pdf = new org.apache.pdfbox.pdmodel.PDDocument()) { pdf.addPage(new org.apache.pdfbox.pdmodel.PDPage()); pdf.save(path.toFile()); }
        var files = mock(FileObjectRepository.class);
        when(files.findById(1L)).thenReturn(Optional.of(FileObject.builder().id(1L).storedPath(path.toString()).mimeType("application/pdf").build()));
        var controller = new FileController(files, null, null, null, null);
        var response = controller.pagePreview(1L, 1);
        assertThat(response.getHeaders().getFirst("X-Page-Count")).isEqualTo("1");
        assertThat(response.getHeaders().getContentType()).isEqualTo(org.springframework.http.MediaType.IMAGE_PNG);
        assertThat(javax.imageio.ImageIO.read(new java.io.ByteArrayInputStream((byte[]) response.getBody())).getWidth()).isGreaterThan(500);
        assertThatThrownBy(() -> controller.pagePreview(1L, 2)).hasMessageContaining("页码超出范围");
    }
}
