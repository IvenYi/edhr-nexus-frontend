package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;
import org.mockito.ArgumentCaptor;
import org.springframework.jdbc.core.JdbcTemplate;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.*;
import java.security.MessageDigest;
import java.sql.Timestamp;
import java.util.*;
import java.util.zip.ZipFile;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/** Opt-in real Linux filesystem faults in a dedicated JVM temporary directory; collaborators are mocks. */
@EnabledIfSystemProperty(named="edhr.audit.archiveCleanupFaults",matches="true")
class DhrArchiveCleanupFailureTest {
    private final ObjectMapper mapper=new ObjectMapper();
    private final JdbcTemplate jdbc=mock(JdbcTemplate.class);
    private final AuditEventRepository audits=mock(AuditEventRepository.class);
    private final DhrPdfRenderer renderer=mock(DhrPdfRenderer.class);
    private final DhrPdfRenderer.Session session=mock(DhrPdfRenderer.Session.class);
    private final DhrArchiveService service=new DhrArchiveService(jdbc,mapper,mock(DhrAttachmentService.class),audits,
            mock(SnowflakeIdGenerator.class),renderer,mock(DhrFormFiles.class),mock(DhrFrozenEvidenceIntegrity.class));
    private Set<Path> before;
    private Path owned;

    @BeforeEach void setup()throws Exception{
        before=archives();
        var version=new HashMap<String,Object>();
        version.put("candidate_snapshot","[]");version.put("attachment_snapshot","[]");
        version.put("production_object_id",77L);version.put("submitted_at",Timestamp.valueOf("2026-01-02 00:00:00"));
        version.put("dhr_no","DHR-TEST");version.put("object_no","BATCH-TEST");version.put("object_type","BATCH");
        version.put("version_no",1);version.put("status","FORMALIZED");version.put("snapshot_hash","a".repeat(64));
        version.put("base_directory_snapshot","{\"directories\":[]}");version.put("overlay_directory_snapshot","[]");
        when(jdbc.queryForList(anyString(),eq(1L),eq(10L))).thenReturn(List.of(version));
        when(renderer.open()).thenReturn(session);when(session.order(any())).thenReturn(mapper.createArrayNode());
        try(var pdf=new PDDocument();var bytes=new ByteArrayOutputStream()){
            pdf.addPage(new PDPage());pdf.save(bytes);when(session.index(anyString(),anyString(),anyList())).thenReturn(bytes.toByteArray());
        }
    }

    @AfterEach void removeOnlyFixtureOwnedArtifacts()throws Exception{
        var created=archives();created.removeAll(before);
        for(Path path:created){
            if(Files.isDirectory(path)){Files.deleteIfExists(path.resolve("fixture-blocker"));Files.delete(path);}
            else Files.delete(path);
        }
    }

    @Test void renderingFailureRetainsItsIdentityWhenCleanupAlsoFails()throws Exception{
        var primary=new BusinessException(ErrorCode.GENERAL_001,"fixture frozen rendering rejected");
        when(session.order(any())).thenAnswer(call->{obstructCleanup();throw primary;});
        assertThatThrownBy(this::export).isSameAs(primary);
        assertCleanupSuppressed(primary);verifyNoInteractions(audits);verify(session).close();
    }

    @Test void auditFailureRetainsItsIdentityWhenCleanupAlsoFails(){
        var primary=new IllegalStateException("fixture export audit unavailable");
        when(audits.save(any(AuditEvent.class))).thenAnswer(call->{obstructCleanup();throw primary;});
        assertThatThrownBy(this::export).isSameAs(primary);
        assertCleanupSuppressed(primary);verify(audits).save(any(AuditEvent.class));
    }

    @Test void renderingFailureStillDeletesTheOwnedArchiveWhenCleanupSucceeds()throws Exception{
        var primary=new BusinessException(ErrorCode.GENERAL_001,"fixture rejected frozen evidence");
        when(session.order(any())).thenAnswer(call->{owned=createdArchive();throw primary;});
        assertThatThrownBy(this::export).isSameAs(primary);
        assertThat(primary.getSuppressed()).isEmpty();assertThat(owned).doesNotExist();verifyNoInteractions(audits);
    }

    @Test void auditFailureStillDeletesTheOwnedArchiveWhenCleanupSucceeds(){
        var primary=new IllegalStateException("fixture audit failure");
        when(audits.save(any(AuditEvent.class))).thenAnswer(call->{owned=createdArchive();throw primary;});
        assertThatThrownBy(this::export).isSameAs(primary);
        assertThat(primary.getSuppressed()).isEmpty();assertThat(owned).doesNotExist();
    }

    @Test void successReturnsAReadableArchiveWithTheSameDigestAndOneAudit()throws Exception{
        owned=export();assertThat(owned).isRegularFile();
        try(var zip=new ZipFile(owned.toFile())){
            var manifest=mapper.readTree(zip.getInputStream(zip.getEntry("追溯资料/清单.json")));
            assertThat(manifest.path("scope").asText()).isEqualTo("FULL");assertThat(manifest.path("versionId").asText()).isEqualTo("10");
            assertThat(manifest.path("completeVersion").asBoolean()).isTrue();
        }
        var audit=ArgumentCaptor.forClass(AuditEvent.class);verify(audits).save(audit.capture());
        assertThat(audit.getValue().getAction()).isEqualTo("EXPORT");assertThat(audit.getValue().getEntityId()).isEqualTo("10");
        assertThat(mapper.readTree(audit.getValue().getContentAfter()).path("archiveSha256").asText())
                .isEqualTo(HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(Files.readAllBytes(owned))));
        verify(session).close();
    }

    @Test void resourceCloseAndCleanupFailuresRemainSuppressedBehindTheRenderingFailure()throws Exception{
        var primary=new BusinessException(ErrorCode.GENERAL_001,"fixture render failure");
        var closeFailure=new IllegalStateException("fixture renderer close failure");
        when(session.order(any())).thenAnswer(call->{obstructCleanup();throw primary;});doThrow(closeFailure).when(session).close();
        assertThatThrownBy(this::export).isSameAs(primary);
        assertThat(primary.getSuppressed()).hasSize(2).contains(closeFailure);
        assertThat(Arrays.stream(primary.getSuppressed()).anyMatch(DirectoryNotEmptyException.class::isInstance)).isTrue();
        verifyNoInteractions(audits);
    }

    @Test void rendererOpenIOExceptionIsNotReplacedByCleanupIOException()throws Exception{
        var primary=new IOException("fixture renderer open failed");
        when(renderer.open()).thenAnswer(call->{obstructCleanup();throw primary;});
        assertThatThrownBy(this::export).isSameAs(primary);assertCleanupSuppressed(primary);verifyNoInteractions(audits);
    }

    private Path export()throws IOException{return service.export(1L,10L,"FULL",Set.of(),Set.of());}
    private void obstructCleanup()throws IOException{
        owned=createdArchive();Files.delete(owned);Files.createDirectory(owned);Files.writeString(owned.resolve("fixture-blocker"),"owned test fixture");
    }
    private void assertCleanupSuppressed(Exception primary){
        assertThat(primary.getSuppressed()).singleElement().isInstanceOf(DirectoryNotEmptyException.class);
        assertThat(owned.resolve("fixture-blocker")).isRegularFile();
    }
    private Path createdArchive()throws IOException{
        var created=archives();created.removeAll(before);assertThat(created).hasSize(1);return created.iterator().next();
    }
    private Set<Path> archives()throws IOException{
        try(var paths=Files.list(Path.of(System.getProperty("java.io.tmpdir")))){
            return new HashSet<>(paths.filter(p->p.getFileName().toString().startsWith("dhr-archive-")&&p.getFileName().toString().endsWith(".zip")).toList());
        }
    }
}
