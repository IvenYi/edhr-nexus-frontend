package com.zencas.edhr.compliance.entity;

import com.zencas.edhr.common.audit.*;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.identity.controller.AuthController;
import com.zencas.edhr.identity.entity.UserAccount;
import com.zencas.edhr.system.controller.SystemSettingsController;
import org.aspectj.lang.ProceedingJoinPoint;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.util.AopTestUtils;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class AuditEventHashCompatibilityPostgresTest extends AuditEventPostgresSupport {
    @Autowired AuditEventRepository audits;
    @Autowired SystemSettingsController settings;
    @Autowired AuditAspect aspect;
    @Autowired AuthController auth;
    @AfterEach void clearContext() { AuditContext.clear(); }

    @ParameterizedTest @ValueSource(strings = {"object", "duplicate", "unicode", "bigint", "exponent", "fraction", "depth", "name", "array", "scalar", "jsonnull"})
    void nativeJsonbValuesKeepV2HashAfterSeparateCommittedRead(String axis) throws Exception {
        String json = switch (axis) {
            case "object" -> "{\"z\":1.00,\"a\":{\"d\":2.0,\"b\":false}}";
            case "duplicate" -> "{\"a\":0,\"a\":2}";
            case "unicode" -> "{\"text\":\"\\u4e2d\\u6587\\ud83d\\ude00\"}";
            case "bigint" -> "1" + "0".repeat(1310);
            case "exponent" -> "1e10000";
            case "fraction" -> "0." + "0".repeat(1310) + "1";
            case "depth" -> "[".repeat(2500) + "0" + "]".repeat(2500);
            case "name" -> "{\"" + "k".repeat(50001) + "\":true}";
            case "array" -> "[true,null,\"0\",0,{\"b\":2,\"a\":1.00}]";
            case "scalar" -> "\"text\"";
            case "jsonnull" -> "null";
            default -> throw new IllegalArgumentException(axis);
        };
        var event = event(3).contentBefore("{\"before\":1}").contentAfter(json)
                .createdAt(LocalDateTime.parse("2026-11-06T23:59:59.999999999")).build();
        var read = roundTrip("boundary_" + axis, event);
        assertThat(read.getSnapshotHashVersion()).isEqualTo("audit-event-v2");
        assertThat(read.getCreatedAt()).isEqualTo(LocalDateTime.parse("2026-11-06T23:59:59.999999"));
        assertThat(read.computeSnapshotHash()).isEqualTo(read.getSnapshotHash());
    }

    @Test void existingAndExternallyProvidedHashesRemainUnmarkedAndUntouched() throws Exception {
        jdbc.update("INSERT INTO audit_event(id,entity_type,entity_id,action,content_after,snapshot_hash) VALUES(4,'LEGACY','42','UPDATE','{\"z\":1}',?)", "b".repeat(64));
        var legacy = audits.findById(4L).orElseThrow(); assertThat(legacy.getSnapshotHash()).isEqualTo("b".repeat(64)); assertThat(legacy.getSnapshotHashVersion()).isNull();
        var supplied = roundTrip("provided", event(5).snapshotHash("a".repeat(64)).build());
        assertThat(supplied.getSnapshotHash()).isEqualTo("a".repeat(64)); assertThat(supplied.getSnapshotHashVersion()).isNull();
        assertThat(jdbc.queryForObject("SELECT snapshot_hash FROM audit_event WHERE id=4", String.class)).isEqualTo("b".repeat(64));
    }
    @Test void unknownPersistedVersionIsReadableButDoesNotGuessHashAlgorithm() {
        jdbc.update("INSERT INTO audit_event(id,entity_type,entity_id,action,snapshot_hash,snapshot_hash_version) VALUES(6,'FUTURE','42','UPDATE',?,'future-v999')", "c".repeat(64));
        var unknown = audits.findById(6L).orElseThrow();
        assertThatThrownBy(unknown::computeSnapshotHash).isInstanceOf(IllegalStateException.class).hasMessageContaining("Unsupported audit hash version");
        assertThat(jdbc.queryForObject("SELECT snapshot_hash FROM audit_event WHERE id=6", String.class)).isEqualTo("c".repeat(64));
    }
    @Test void genuineChangedContentDoesNotValidateAgainstStoredV2Hash() throws Exception {
        var original = roundTrip("tamper", event(7).contentAfter("{\"value\":1}").build());
        jdbc.update("UPDATE audit_event SET content_after='{\"value\":2}' WHERE id=7");
        var changed = audits.findById(7L).orElseThrow();
        assertThat(changed.getSnapshotHash()).isEqualTo(original.getSnapshotHash()); assertThat(changed.computeSnapshotHash()).isNotEqualTo(changed.getSnapshotHash());
    }
    @Test void jpaUpdatesStillFailAndFlushedOuterRollbackKeepsNoAuditRow() throws Exception {
        var saved = roundTrip("immutable", event(8).build());
        assertThatThrownBy(() -> new TransactionTemplate(transactions).executeWithoutResult(status -> {
            var row = entityManager.find(AuditEvent.class, 8L); row.setReason("attempted update"); entityManager.flush();
        })).hasStackTraceContaining("immutable snapshots");
        assertThat(audits.findById(8L).orElseThrow().getSnapshotHash()).isEqualTo(saved.getSnapshotHash());
        new TransactionTemplate(transactions).executeWithoutResult(status -> { entityManager.persist(event(9).build()); entityManager.flush(); status.setRollbackOnly(); });
        assertThat(audits.findById(9L)).isEmpty();
    }

    @Test void realConfigurationControllerAndRepositoriesPersistRecomputableEvent() {
        AuditContext.setOperator("7", "审查人员", "audit-probe");
        var request = new com.fasterxml.jackson.databind.ObjectMapper().convertValue(java.util.Map.of("systemName", "核验系统", "browserTitle", "审计探针"), SystemSettingsController.UpdateSettingsRequest.class);
        new TransactionTemplate(transactions).executeWithoutResult(status -> { jdbc.execute("SET LOCAL application_name='audit_hash_settings_write'"); settings.updateSettings(request); entityManager.flush(); });
        var event = onlyEvent(); assertThat(event.getEntityType()).isEqualTo("SYSTEM_SETTING"); assertThat(event.getContentAfter()).contains("核验系统");
    }
    @Test void realAspectAndAuditRepositoryPersistEventWithoutInventingChangeContent() throws Throwable {
        AuditContext.setOperator("7", "审查人员", "audit-probe");
        var join = mock(ProceedingJoinPoint.class); var annotation = mock(Auditable.class);
        when(join.proceed()).thenReturn("result"); when(join.getArgs()).thenReturn(new Object[]{42L});
        when(annotation.entityIdExpr()).thenReturn("#id"); when(annotation.entityType()).thenReturn("ASPECT_PROBE"); when(annotation.action()).thenReturn("UPDATE");
        new TransactionTemplate(transactions).executeWithoutResult(status -> {
            jdbc.execute("SET LOCAL application_name='audit_hash_aspect_write'");
            try { assertThat(aspect.audit(join, annotation)).isEqualTo("result"); } catch (Throwable failure) { throw new RuntimeException(failure); }
            entityManager.flush();
        });
        var event = onlyEvent(); assertThat(event.getEntityType()).isEqualTo("ASPECT_PROBE"); assertThat(event.getContentBefore()).isNull(); assertThat(event.getContentAfter()).isNull();
    }
    @Test void actualSignatureAuditProducerUsesNewAuditHashWithoutChangingSignatureEvidence() {
        // Invoke the real producer + repository/JPA; this is not full password/image/HTTP certification.
        var signedAt = LocalDateTime.parse("2026-11-06T12:00:00.123456789");
        var signature = Signature.builder().id(88L).snapshotData("{ \"z\":1.00, \"a\":2 }").snapshotHash("d".repeat(64)).signedAt(signedAt).build();
        var user = UserAccount.builder().id(42L).username("signer").displayName("签署人").build();
        new TransactionTemplate(transactions).executeWithoutResult(status -> {
            jdbc.execute("SET LOCAL application_name='audit_hash_signature_write'");
            ReflectionTestUtils.invokeMethod((Object) AopTestUtils.getUltimateTargetObject(auth), "writeSignatureAudit", user, signature, signature.getSnapshotData(), new MockHttpServletRequest()); entityManager.flush();
        });
        var event = onlyEvent(); assertThat(event.getAction()).isEqualTo("SIGN"); assertThat(event.getCreatedAt().getNano()).isEqualTo(123456000);
        assertThat(signature.getSnapshotHash()).isEqualTo("d".repeat(64)); assertThat(signature.getSignedAt()).isEqualTo(signedAt);
        assertThat(signature.getSnapshotData()).isEqualTo("{ \"z\":1.00, \"a\":2 }");
    }
    private AuditEvent onlyEvent() {
        var events = audits.findAll(); assertThat(events).hasSize(1); var event = events.getFirst();
        assertThat(event.getSnapshotHashVersion()).isEqualTo("audit-event-v2"); assertThat(event.computeSnapshotHash()).isEqualTo(event.getSnapshotHash()); return event;
    }
}
