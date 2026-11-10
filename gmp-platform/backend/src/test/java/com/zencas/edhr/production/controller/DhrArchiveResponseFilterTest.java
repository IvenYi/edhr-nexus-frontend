package com.zencas.edhr.production.controller;

import com.zencas.edhr.production.service.DhrArchiveService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;
import org.junit.jupiter.api.io.TempDir;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.async.WebAsyncUtils;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.*;
import java.time.Duration;
import java.util.Set;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

/** Direct filter/ownership interleavings, not a network timeout test. */
@EnabledIfSystemProperty(named="edhr.audit.jwtHeaders",matches="true")
class DhrArchiveResponseFilterTest {
    @TempDir Path directory;

    @ParameterizedTest @ValueSource(strings={"GET","HEAD"})
    void exportUnderContextPathHoldsOneRequestLocalMonitor(String method)throws Exception{
        var request=request(method,"/api/v1/dhr-instances/1/summary/versions/10/export");
        var response=new MockHttpServletResponse();
        new DhrArchiveResponseFilter().doFilter(request,response,(r,s)->{
            var web=new ServletWebRequest(request,response);Object monitor=DhrArchiveResponseFilter.responseMonitor(web);
            assertThat(Thread.holdsLock(monitor)).isTrue();
            assertThat(DhrArchiveResponseFilter.responseMonitor(web)).isSameAs(monitor);
        });
    }
    @Test void unrelatedPreviewDoesNotInstallTheArchiveGate()throws Exception{
        var request=request("GET","/api/v1/files/42/preview");var response=new MockHttpServletResponse();
        new DhrArchiveResponseFilter().doFilter(request,response,(r,s)->{
            Object monitor=DhrArchiveResponseFilter.responseMonitor(new ServletWebRequest(request,response));
            assertThat(Thread.holdsLock(monitor)).isFalse();
        });
    }
    @Test void completionWhileWorkerWaitsCanCleanAndRejectTheLateBody()throws Exception{
        Path zip=directory.resolve("owned.zip");Files.writeString(zip,"owned fixture");
        var service=mock(DhrArchiveService.class);when(service.export(1L,10L,"FULL",Set.of(),Set.of())).thenReturn(zip);
        var request=request("GET","/api/v1/dhr-instances/1/summary/versions/10/export");var response=new MockHttpServletResponse();
        var worker=new AtomicReference<Thread>();var failure=new AtomicReference<Throwable>();var bytes=new ByteArrayOutputStream();
        try{
            new DhrArchiveResponseFilter().doFilter(request,response,(r,s)->{
                var web=new ServletWebRequest(request,response);var result=new DhrArchiveController(service).export(1L,10L,"FULL","","",web);
                Thread thread=new Thread(()->{try{result.getBody().writeTo(bytes);}catch(Throwable ex){failure.set(ex);}},"archive-gate-waiter");
                worker.set(thread);thread.start();
                org.awaitility.Awaitility.await().atMost(Duration.ofSeconds(3)).until(()->thread.getState()==Thread.State.BLOCKED);
                try{WebAsyncUtils.getAsyncManager(web).getCallableInterceptor(DhrArchiveController.class).afterCompletion(web,()->null);}
                catch(Exception ex){throw new IOException(ex);}
                assertThat(zip).doesNotExist();assertThat(bytes.size()).isZero();
            });
            worker.get().join(3000);assertThat(worker.get().isAlive()).isFalse();
            assertThat(failure.get()).isInstanceOf(IOException.class).hasMessageContaining("请求已结束");assertThat(bytes.size()).isZero();
        }finally{if(worker.get()!=null){worker.get().interrupt();worker.get().join(3000);}}
    }
    @Test void failedUnstartedResponseRejectsTheBodyAndStillAllowsCompletionCleanup()throws Exception{
        Path zip=directory.resolve("failed.zip");Files.writeString(zip,"owned fixture");
        var service=mock(DhrArchiveService.class);when(service.export(1L,10L,"FULL",Set.of(),Set.of())).thenReturn(zip);
        var request=request("GET","/api/v1/dhr-instances/1/summary/versions/10/export");var response=new MockHttpServletResponse();
        new DhrArchiveResponseFilter().doFilter(request,response,(r,s)->{
            var web=new ServletWebRequest(request,response);var result=new DhrArchiveController(service).export(1L,10L,"FULL","","",web);
            assertThat(DhrArchiveResponseFilter.responseMonitor(web).failBeforeBody()).isTrue();var out=new ByteArrayOutputStream();
            assertThatThrownBy(()->result.getBody().writeTo(out)).isInstanceOf(IOException.class).hasMessageContaining("请求已结束");
            assertThat(out.size()).isZero();assertThat(zip).isRegularFile();
            try{WebAsyncUtils.getAsyncManager(web).getCallableInterceptor(DhrArchiveController.class).afterCompletion(web,()->null);}
            catch(Exception ex){throw new IOException(ex);}
            assertThat(zip).doesNotExist();
        });
    }
    private MockHttpServletRequest request(String method,String path){
        var request=new MockHttpServletRequest(method,"/header-audit"+path);request.setContextPath("/header-audit");request.setServletPath(path);return request;
    }
}
