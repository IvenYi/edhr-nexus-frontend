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
import java.time.LocalDateTime;
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

    @Test void buttonSignatureAuthenticatesNamedSignerAndRetainsSessionWithoutCredentials() throws Exception {
        AuditContext.setOperator("1", "操作员");
        UserAccount signer = signer("reviewer");
        certification(signer);
        assertThatThrownBy(() -> access.authenticateButtonSigner("other", "login-secret")).hasMessageContaining("密码不正确");
        assertThatThrownBy(() -> access.authenticateButtonSigner("reviewer", "login-secret")).hasMessageContaining("电子签名密码错误");
        var authenticated = access.authenticateButtonSigner(" reviewer ", "sign-secret");
        access.sign("101", "f", "SUBMIT", mapper.createObjectNode().put("temperature", 20), authenticated);
        var captured = ArgumentCaptor.forClass(Signature.class); verify(signatures).save(captured.capture());
        Signature signed = captured.getValue();
        assertThat(signed.getSignerId()).isEqualTo("2");
        assertThat(signed.getAuthMethod()).isEqualTo("SIGNATURE_PASSWORD");
        assertThat(signed.getAuthEventRef()).isEqualTo("900");
        assertThat(mapper.readTree(signed.getSnapshotData()).path("sessionOperatorId").asText()).isEqualTo("1");
        assertThat(AuditContext.getOperatorId()).isEqualTo("1");
        assertThat(signed.getSnapshotHash()).hasSize(64);
        assertThat(signed.getSnapshotData()).contains("temperature").doesNotContain("sign-secret", "login-secret", "passwordHash");
    }

    @Test void unavailableUncertifiedExpiredAndUnsetSignersAreBlocked() {
        AuditContext.setOperator("1", "操作员");
        var user = signer("reviewer");
        assertThatThrownBy(() -> access.authenticateButtonSigner("reviewer", "sign-secret")).hasMessageContaining("尚未完成");
        var cert = certification(user);
        cert.setExpiresAt(LocalDateTime.now().minusSeconds(1));
        assertThatThrownBy(() -> access.authenticateButtonSigner("reviewer", "sign-secret")).hasMessageContaining("已过期");
        cert.setExpiresAt(LocalDateTime.now().plusDays(1)); cert.setSignaturePasswordHash(null);
        assertThatThrownBy(() -> access.authenticateButtonSigner("reviewer", "sign-secret")).hasMessageContaining("尚未设置");
        user.setStatus("INACTIVE");
        assertThatThrownBy(() -> access.authenticateButtonSigner("reviewer", "sign-secret")).hasMessageContaining("不可用");
        user.setStatus("ACTIVE"); user.setLockedUntil(LocalDateTime.now().plusHours(1));
        assertThatThrownBy(() -> access.authenticateButtonSigner("reviewer", "sign-secret")).hasMessageContaining("不可用");
        verify(signatures, never()).save(any());
    }

    @Test void onlyInternalAdminUsesLoginPasswordAndSignatureFieldsRemainCurrentUserOnly() {
        AuditContext.setOperator("1", "操作员");
        var admin = signer("admin");
        assertThat(access.authenticateButtonSigner("admin", "login-secret").authMethod()).isEqualTo("ADMIN_LOGIN_PASSWORD");
        assertThatThrownBy(() -> access.authenticateButtonSigner("admin", "sign-secret")).hasMessageContaining("密码不正确");
        signer("customer-admin");
        assertThatThrownBy(() -> access.authenticateButtonSigner("customer-admin", "login-secret")).hasMessageContaining("尚未完成");
        signer("ADMIN");
        assertThatThrownBy(() -> access.authenticateButtonSigner("ADMIN", "login-secret")).hasMessageContaining("尚未完成");
        when(users.findById(1L)).thenReturn(Optional.of(admin));
        assertThatThrownBy(() -> access.signField(mapper.createObjectNode(), "login-secret")).hasMessageContaining("完成电子签名认证");
        verify(signatures).findFirstByTargetTypeAndTargetIdOrderBySignedAtDesc("USER_PROFILE", "1");
        verify(signatures, never()).save(any());
    }

    private UserAccount signer(String username) {
        var user = UserAccount.builder().id(2L).username(username).displayName("签署人B").status("ACTIVE")
                .passwordHash(encoder.encode("login-secret")).build();
        when(users.findByUsername(username)).thenReturn(Optional.of(user));
        return user;
    }

    private Signature certification(UserAccount user) {
        var cert = Signature.builder().id(900L).targetType("USER_PROFILE").targetId(user.getId().toString())
                .signaturePasswordHash(encoder.encode("sign-secret")).expiresAt(LocalDateTime.now().plusDays(1)).build();
        when(signatures.findFirstByTargetTypeAndTargetIdOrderBySignedAtDesc("USER_PROFILE", user.getId().toString())).thenReturn(Optional.of(cert));
        return cert;
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

    @Test void transferKeepsTheFrozenApprovalBoundaryAndOnlyAssigneeCanAct() throws Exception {
        var node = mapper.readTree("""
            {"id":"a","data":{"kind":"APPROVAL","config":{}}}
            """);
        ObjectNode state = mapper.createObjectNode();
        state.putObject("restrictedApprovers").put("a", true);
        state.putObject("approvers").putArray("a").add("1").add("2").add("4").add("5");
        state.putObject("transferAssignees").put("a", "2");
        when(users.findById(2L)).thenReturn(Optional.of(UserAccount.builder().id(2L).username("reviewer2").displayName("复核员2").status("ACTIVE").build()));
        when(users.findById(3L)).thenReturn(Optional.of(UserAccount.builder().id(3L).username("reviewer3").displayName("复核员3").status("ACTIVE").build()));
        when(users.findById(4L)).thenReturn(Optional.of(UserAccount.builder().id(4L).username("inactive").displayName("已停用").status("INACTIVE").build()));
        when(users.findById(5L)).thenReturn(Optional.of(UserAccount.builder().id(5L).username("locked").displayName("已锁定").status("ACTIVE").lockedUntil(LocalDateTime.now().plusHours(1)).build()));

        assertThat(access.canAct(mapper.createObjectNode(), node, state, "1")).isFalse();
        assertThat(access.canAct(mapper.createObjectNode(), node, state, "2")).isTrue();
        assertThat(access.requireTransferTarget(node, state, "1", "2").getDisplayName()).isEqualTo("复核员2");
        assertThatThrownBy(() -> access.requireTransferTarget(node, state, "1", "1")).hasMessageContaining("当前处理人");
        assertThatThrownBy(() -> access.requireTransferTarget(node, state, "1", "3")).hasMessageContaining("授权范围");
        assertThatThrownBy(() -> access.requireTransferTarget(node, state, "1", "4")).hasMessageContaining("停用");
        assertThatThrownBy(() -> access.requireTransferTarget(node, state, "1", "5")).hasMessageContaining("锁定");
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

    @Test void personalSignatureCredentialsCannotBeForgedOrExposedThroughGenericCrud() throws Exception {
        Signature certification = Signature.builder().id(900L).targetType("USER_PROFILE").signaturePasswordHash("private-hash").build();
        when(signatures.findById(900L)).thenReturn(Optional.of(certification));
        SignatureController controller = new SignatureController(signatures);
        assertThatThrownBy(() -> controller.create(certification)).hasMessageContaining("认证流程");
        assertThatThrownBy(() -> controller.update(900L, Signature.builder().targetType("OTHER").build())).hasMessageContaining("认证流程");
        assertThatThrownBy(() -> controller.delete(900L)).hasMessageContaining("认证流程");
        assertThat(mapper.writeValueAsString(certification)).doesNotContain("private-hash", "signaturePasswordHash");
        verify(signatures, never()).save(any()); verify(signatures, never()).deleteById(any());
    }

    @Test void referenceSearchAndValidationReachIdsBeyondFirstHundredSameNameRows() throws Exception {
        var jdbc = new JdbcTemplate(new org.springframework.jdbc.datasource.DriverManagerDataSource("jdbc:h2:mem:execution-references;DB_CLOSE_DELAY=-1", "sa", ""));
        jdbc.execute("CREATE TABLE material(id BIGINT PRIMARY KEY,code VARCHAR(128),name VARCHAR(128),status VARCHAR(16))");
        try {
            for (int i = 1; i <= 105; i++) jdbc.update("INSERT INTO material VALUES(?,?,'同名物料','ACTIVE')", i, "MAT-" + i);
            var real = new ExecutionAccess(subjects, users, encoder, signatures, new SnowflakeIdGenerator(1), mapper, jdbc);
            var field = mapper.readTree("{\"id\":\"ref\",\"name\":\"物料\",\"type\":\"reference\",\"typeConfig\":{\"sourceType\":\"material\"}}");
            assertThat(real.references(field, "105")).singleElement().satisfies(item -> assertThat(item)
                    .containsEntry("id", "105").containsEntry("code", "MAT-105").containsEntry("sourceType", "material"));
            real.validateEvidence(field, mapper.readTree("{\"id\":\"105\",\"name\":\"同名物料\"}"), "101");
            real.validateEvidence(field, mapper.readTree("{\"id\":\"105\",\"name\":\"同名物料\",\"sourceType\":\"material\",\"code\":\"MAT-105\"}"), "101");
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
