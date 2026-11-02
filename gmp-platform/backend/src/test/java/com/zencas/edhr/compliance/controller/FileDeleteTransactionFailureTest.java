package com.zencas.edhr.compliance.controller;

import com.zencas.edhr.compliance.entity.FileObject;
import com.zencas.edhr.compliance.repository.FileObjectRepository;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.identity.repository.UserAccountRepository;
import com.zencas.edhr.system.repository.IconAssetRepository;
import com.zencas.edhr.system.repository.SystemSettingRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.transaction.*;
import org.springframework.transaction.support.AbstractPlatformTransactionManager;
import org.springframework.transaction.support.DefaultTransactionStatus;

import java.nio.file.*;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/** Actual synchronization lifecycle with synthetic startup/unknown outcome, not a real disconnect. */
class FileDeleteTransactionFailureTest {
    @TempDir Path directory;
    private final FileObjectRepository files = mock(FileObjectRepository.class);
    @Test void unavailableTransactionDoesNotTouchRegisteredOriginal() throws Exception {
        Path path = original();
        when(files.findById(77L)).thenReturn(Optional.of(FileObject.builder().id(77L).originalName("original.txt").storedPath(path.toString()).build()));
        var manager = mock(PlatformTransactionManager.class);
        when(manager.getTransaction(any())).thenThrow(new CannotCreateTransactionException("unavailable"));
        assertThatThrownBy(() -> controller(manager).delete(77L)).isInstanceOf(CannotCreateTransactionException.class);
        assertThat(Files.readString(path)).isEqualTo("original bytes"); verifyNoInteractions(files);
    }
    @Test void unknownCommitRetainsPossiblyRegisteredOriginal() throws Exception {
        Path path = original();
        when(files.findById(77L)).thenReturn(Optional.of(FileObject.builder().id(77L).originalName("original.txt").storedPath(path.toString()).build()));
        var manager = new AbstractPlatformTransactionManager() {
            @Override protected Object doGetTransaction() { return new Object(); }
            @Override protected void doBegin(Object transaction, TransactionDefinition definition) {}
            @Override protected void doCommit(DefaultTransactionStatus status) { throw new TransactionSystemException("commit outcome unknown"); }
            @Override protected void doRollback(DefaultTransactionStatus status) {}
        };
        assertThatThrownBy(() -> controller(manager).delete(77L)).isInstanceOf(TransactionSystemException.class).hasMessage("commit outcome unknown");
        verify(files).deleteById(77L);
        assertThat(Files.readString(path)).isEqualTo("original bytes");
    }
    private Path original() throws Exception { Path path = directory.resolve("original.txt"); Files.writeString(path, "original bytes"); return path; }
    private FileController controller(PlatformTransactionManager manager) {
        return new FileController(files, mock(IconAssetRepository.class), mock(SystemSettingRepository.class),
                mock(UserAccountRepository.class), new SnowflakeIdGenerator(1), manager);
    }
}
