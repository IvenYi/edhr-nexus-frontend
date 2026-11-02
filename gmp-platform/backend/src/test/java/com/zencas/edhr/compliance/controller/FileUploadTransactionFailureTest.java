package com.zencas.edhr.compliance.controller;

import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.FileObject;
import com.zencas.edhr.compliance.repository.FileObjectRepository;
import com.zencas.edhr.identity.repository.UserAccountRepository;
import com.zencas.edhr.system.repository.IconAssetRepository;
import com.zencas.edhr.system.repository.SystemSettingRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.*;
import org.springframework.transaction.support.AbstractPlatformTransactionManager;
import org.springframework.transaction.support.DefaultTransactionStatus;

import java.nio.file.DirectoryNotEmptyException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/** Deterministic transaction-start/unknown-result faults; not a real database disconnect test. */
class FileUploadTransactionFailureTest {
    @TempDir Path directory;
    private final FileObjectRepository files = mock(FileObjectRepository.class);

    @Test void transactionStartFailureCleansOnlyTheNewFileBeforeAnyRepositoryCall() throws Exception {
        var manager = mock(PlatformTransactionManager.class);
        when(manager.getTransaction(any())).thenThrow(new CannotCreateTransactionException("unavailable"));
        Files.writeString(directory.resolve("existing-original"), "keep");
        assertThatThrownBy(() -> upload(manager)).isInstanceOf(CannotCreateTransactionException.class).hasMessage("unavailable");
        try (var paths = Files.list(directory)) {
            assertThat(paths.map(path -> path.getFileName().toString()).toList()).containsExactly("existing-original");
        }
        verifyNoInteractions(files);
    }

    @Test void unknownCommitOutcomeNeverDeletesAPossiblyCommittedOriginal() throws Exception {
        var manager = new AbstractPlatformTransactionManager() {
            @Override protected Object doGetTransaction() { return new Object(); }
            @Override protected void doBegin(Object transaction, TransactionDefinition definition) {}
            @Override protected void doCommit(DefaultTransactionStatus status) { throw new TransactionSystemException("commit outcome unknown"); }
            @Override protected void doRollback(DefaultTransactionStatus status) {}
        };
        assertThatThrownBy(() -> upload(manager)).isInstanceOf(TransactionSystemException.class).hasMessage("commit outcome unknown");
        var captured = org.mockito.ArgumentCaptor.forClass(FileObject.class);
        verify(files).save(captured.capture());
        assertThat(Files.readString(Path.of(captured.getValue().getStoredPath()))).isEqualTo("original");
    }

    @Test void failedStartupCleanupKeepsTheOriginalFailureAndCleanupEvidence() throws Exception {
        var manager = mock(PlatformTransactionManager.class);
        when(manager.getTransaction(any())).thenAnswer(call -> {
            Path path = directory.resolve("88_fault.txt");
            Files.delete(path); Files.createDirectory(path); Files.writeString(path.resolve("child"), "fault");
            throw new CannotCreateTransactionException("unavailable");
        });
        assertThatThrownBy(() -> upload(manager)).isInstanceOf(CannotCreateTransactionException.class)
                .hasMessage("unavailable").satisfies(error -> assertThat(error.getSuppressed()).singleElement()
                        .isInstanceOf(DirectoryNotEmptyException.class));
        verifyNoInteractions(files);
    }

    private void upload(PlatformTransactionManager manager) throws Exception {
        var ids = mock(SnowflakeIdGenerator.class); when(ids.nextId()).thenReturn(88L);
        var controller = new FileController(files, mock(IconAssetRepository.class), mock(SystemSettingRepository.class),
                mock(UserAccountRepository.class), ids, manager);
        ReflectionTestUtils.setField(controller, "storagePath", directory.toString());
        controller.upload(new MockMultipartFile("file", "fault.txt", "text/plain", "original".getBytes()), null, null);
    }
}
