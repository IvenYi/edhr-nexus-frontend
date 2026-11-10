package com.zencas.edhr.production.controller;

import com.zencas.edhr.production.service.DhrArchiveService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.async.WebAsyncUtils;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;
import org.springframework.http.ResponseEntity;
import org.slf4j.LoggerFactory;
import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;

import java.io.*;
import java.nio.file.*;
import java.util.Set;
import java.util.zip.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

/** Direct Spring callback ownership checks, distinct from the embedded HTTP tests. */
@EnabledIfSystemProperty(named="edhr.audit.archiveAsync",matches="true")
class DhrArchiveAsyncOwnershipTest {
    @TempDir Path directory;
    private final ServletWebRequest request=new ServletWebRequest(new MockHttpServletRequest(),new MockHttpServletResponse());

    @Test void completionBeforeBodyDeletesTheArchiveAndRejectsALateBody()throws Exception{
        Path zip=archive();var response=response(zip);complete();assertThat(zip).doesNotExist();
        var out=new ByteArrayOutputStream();
        assertThatThrownBy(()->response.getBody().writeTo(out)).isInstanceOf(IOException.class).hasMessageContaining("请求已结束");
        assertThat(out.size()).isZero();
    }

    @Test void completionDuringCopyDoesNotDeleteAnArchiveClaimedByTheBody()throws Exception{
        Path zip=archive();byte[] expected=Files.readAllBytes(zip);var response=response(zip);var copied=new ByteArrayOutputStream();
        OutputStream out=new OutputStream(){
            @Override public void write(int value){
                assertThatCode(()->complete()).doesNotThrowAnyException();assertThat(zip).isRegularFile();copied.write(value);
            }
        };
        response.getBody().writeTo(out);assertThat(copied.toByteArray()).isEqualTo(expected);assertThat(zip).doesNotExist();complete();
    }

    @Test void repeatedCompletionDoesNotDeleteAReplacementAfterOwnershipWasConsumed()throws Exception{
        Path zip=archive();var response=response(zip);complete();Files.writeString(zip,"new test-owned replacement");complete();
        assertThat(Files.readString(zip)).isEqualTo("new test-owned replacement");
        assertThatThrownBy(()->response.getBody().writeTo(new ByteArrayOutputStream())).isInstanceOf(IOException.class);
        assertThat(Files.readString(zip)).isEqualTo("new test-owned replacement");
    }

    @Test void completionCleanupFailureIsLoggedWithOwnedPathAndDoesNotEscapeTheHook()throws Exception{
        Path zip=archive();var response=response(zip);Files.delete(zip);Files.createDirectory(zip);Files.writeString(zip.resolve("owned-blocker"),"fixture");
        Logger logger=(Logger)LoggerFactory.getLogger(DhrArchiveController.class);var appender=new ListAppender<ILoggingEvent>();
        appender.setContext(logger.getLoggerContext());appender.start();logger.addAppender(appender);
        try{
            assertThatCode(()->complete()).doesNotThrowAnyException();
            assertThat(appender.list).anySatisfy(event->{
                assertThat(event.getLevel()).isEqualTo(Level.ERROR);assertThat(event.getFormattedMessage()).contains(zip.toString());
                assertThat(event.getThrowableProxy().getClassName()).isEqualTo(DirectoryNotEmptyException.class.getName());
            });
            assertThat(zip.resolve("owned-blocker")).isRegularFile();
            assertThatThrownBy(()->response.getBody().writeTo(new ByteArrayOutputStream())).isInstanceOf(IOException.class);
        }finally{logger.detachAppender(appender);appender.stop();}
    }

    @Test void synchronousMetadataFailureRemovesOnlyItsOwnPathAndKeepsTheIOException()throws Exception{
        Path zip=archive();Files.delete(zip);Files.createSymbolicLink(zip,zip.getFileName());
        assertThatThrownBy(()->response(zip)).isInstanceOf(IOException.class);
        assertThat(Files.exists(zip,LinkOption.NOFOLLOW_LINKS)).isFalse();complete();
    }

    private ResponseEntity<StreamingResponseBody> response(Path zip)throws IOException{
        var service=mock(DhrArchiveService.class);when(service.export(1L,10L,"FULL",Set.of(),Set.of())).thenReturn(zip);
        return new DhrArchiveController(service).export(1L,10L,"FULL","","",request);
    }
    private void complete()throws Exception{
        var interceptor=WebAsyncUtils.getAsyncManager(request).getCallableInterceptor(DhrArchiveController.class);
        assertThat(interceptor).isNotNull();interceptor.afterCompletion(request,()->null);
    }
    private Path archive()throws IOException{
        Path zip=directory.resolve("owned.zip");
        try(var out=new ZipOutputStream(Files.newOutputStream(zip))){
            out.putNextEntry(new ZipEntry("payload.txt"));out.write("owned frozen archive".getBytes(java.nio.charset.StandardCharsets.UTF_8));out.closeEntry();
        }
        return zip;
    }
}
