package com.zencas.edhr.production.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.common.config.SecurityConfig;
import com.zencas.edhr.common.exception.GlobalExceptionHandler;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.controller.FileController;
import com.zencas.edhr.compliance.entity.FileObject;
import com.zencas.edhr.compliance.repository.FileObjectRepository;
import com.zencas.edhr.identity.repository.UserAccountRepository;
import com.zencas.edhr.identity.security.JwtAuthenticationFilter;
import com.zencas.edhr.identity.security.JwtTokenProvider;
import com.zencas.edhr.production.service.DhrArchiveService;
import com.zencas.edhr.system.repository.IconAssetRepository;
import com.zencas.edhr.system.repository.SystemSettingRepository;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.liquibase.LiquibaseAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.*;
import org.springframework.core.Ordered;
import org.springframework.core.task.AsyncTaskExecutor;
import org.springframework.core.task.TaskRejectedException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.web.servlet.config.annotation.*;

import java.io.*;
import java.net.URI;
import java.net.http.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.zip.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/** Real JWT signing/filter/security/advice and Tomcat; archive generation/repositories remain isolated collaborators. */
@EnabledIfSystemProperty(named="edhr.audit.jwtHeaders",matches="true")
@ActiveProfiles("archive-jwt-headers-test")
@SpringBootTest(classes=DhrArchiveJwtHeadersTest.TestApplication.class,webEnvironment=SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties={"spring.liquibase.enabled=false","spring.jpa.open-in-view=false","server.servlet.context-path=/header-audit",
                "app.jwt.secret=synthetic-header-test-key-not-a-production-secret-256-bits",
                "app.jwt.expiration-ms=60000","logging.level.org.springframework.security=WARN"})
class DhrArchiveJwtHeadersTest {
    private static final String EXPORT="/api/v1/dhr-instances/1/summary/versions/10/export";
    @LocalServerPort int port;
    @Autowired JwtTokenProvider tokens;
    @Autowired HeaderProbe probe;
    @Autowired ControlledExecutor executor;
    @MockBean DhrArchiveService service;
    @MockBean FileObjectRepository files;
    @MockBean IconAssetRepository icons;
    @MockBean SystemSettingRepository settings;
    @MockBean UserAccountRepository users;
    @MockBean SnowflakeIdGenerator ids;
    @MockBean PlatformTransactionManager transactions;
    @TempDir Path directory;
    private HttpClient client;
    private volatile Path owned;
    private volatile byte[] expected;

    @BeforeEach void setup()throws Exception{
        client=HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();probe.reset();executor.reset();
        when(service.export(eq(1L),eq(10L),eq("FULL"),eq(Set.of()),eq(Set.of()))).thenAnswer(call->{
            var bytes=new ByteArrayOutputStream();
            try(var zip=new ZipOutputStream(bytes,StandardCharsets.UTF_8)){
                zip.putNextEntry(new ZipEntry("frozen.txt"));zip.write("JWT frozen archive fixture".getBytes(StandardCharsets.UTF_8));zip.closeEntry();
            }
            expected=bytes.toByteArray();owned=Files.createTempFile(directory,"owned-",".zip");Files.write(owned,expected);return owned;
        });
    }
    @AfterEach void cleanup()throws Exception{
        executor.queued.clear();client.close();if(owned!=null)Files.deleteIfExists(owned);
    }

    @Test void securityHeadersAreNotWrittenConcurrentlyByServletAndArchiveWorker()throws Exception{
        probe.enabled.set(true);HttpResponse<byte[]> response=null;Throwable exchangeFailure=null;
        try{response=send(EXPORT,"qa","GET");}catch(IOException failure){exchangeFailure=failure;}
        try{
            assertThat(probe.maxWriters.get()).as("one response must not enter its security header writer on two threads").isEqualTo(1);
            assertThat(exchangeFailure).isNull();assertThat(response).isNotNull();assertSuccessful(response);
        }finally{record("forced-header-overlap",response,exchangeFailure);}
    }
    @Test void actualJwtDownloadKeepsExactBytesHeadersAndSingleInvocation()throws Exception{
        var response=send(EXPORT,"qa","GET");try{assertSuccessful(response);}finally{record("normal",response,null);}
    }
    @Test void headUsesTheSameArchiveLifecycleWithoutAResponseBody()throws Exception{
        var response=send(EXPORT,"qa","HEAD");
        try{
            assertThat(response.statusCode()).isEqualTo(200);assertThat(response.body()).isEmpty();
            assertThat(response.headers().firstValue("content-length")).hasValue(Integer.toString(expected.length));
            assertThat(executor.started.get()).isEqualTo(1);removed();
        }finally{record("head",response,null);}
    }
    @Test void anonymousCannotGenerateAnArchive()throws Exception{denied(null,401,"anonymous");}
    @Test void invalidJwtCannotGenerateAnArchive()throws Exception{denied("invalid",401,"invalid-jwt");}
    @Test void viewOnlyJwtCannotGenerateAnArchive()throws Exception{denied("viewer",403,"view-only");}
    @Test void inlineExecutorDoesNotDeadlockAndStillCleansItsArchive()throws Exception{
        executor.mode.set(Mode.INLINE);var response=send(EXPORT,"qa","GET");
        try{assertSuccessful(response);}finally{record("inline",response,null);}
    }
    @Test void rejectedExecutorKeepsProductErrorHandlingAndCleansUnstartedArchive()throws Exception{
        executor.mode.set(Mode.REJECT);var response=send(EXPORT,"qa","GET");
        try{assertErrorResponse(response);assertThat(executor.started.get()).isZero();removed();}
        finally{record("rejected",response,null);}
    }
    @Test void queuedTimeoutKeepsProductErrorHandlingAndCleansUnstartedArchive()throws Exception{
        executor.mode.set(Mode.HOLD);var response=send(EXPORT,"qa","GET");
        try{assertErrorResponse(response);assertThat(executor.started.get()).isZero();removed();}
        finally{record("queued-timeout",response,null);}
    }
    @Test void queuedCancellationEventuallyCleansWithoutStartingTheBody()throws Exception{
        executor.mode.set(Mode.HOLD);var future=client.sendAsync(request(EXPORT,"qa","GET"),HttpResponse.BodyHandlers.ofByteArray());
        try{
            org.awaitility.Awaitility.await().atMost(Duration.ofSeconds(5)).until(()->owned!=null&&executor.submitted.get()==1);
            assertThat(future.cancel(true)).isTrue();assertThat(executor.started.get()).isZero();removed();
        }finally{record("client-cancelled",null,null);}
    }
    @Test void authenticatedInlinePreviewRetainsPrivateCacheAndSecurityHeaders()throws Exception{
        png();var response=send("/api/v1/files/42/preview","qa","GET");
        try{previewHeaders(response);assertThat(response.body()).isEqualTo(Files.readAllBytes(directory.resolve("preview.png")));}
        finally{record("private-preview",response,null);}
    }
    @Test void anonymousPublicPreviewRetainsItsOriginalCacheAndEligibility()throws Exception{
        png();when(icons.existsByFileId(42L)).thenReturn(true);var response=send("/api/v1/files/42/public-preview",null,"GET");
        try{previewHeaders(response);assertThat(response.body()).isEqualTo(Files.readAllBytes(directory.resolve("preview.png")));verify(icons).existsByFileId(42L);}
        finally{record("public-preview",response,null);}
    }
    @Test void actualPdfPagePreviewRetainsPrivateCacheAndPngOutput()throws Exception{
        Path pdf=directory.resolve("preview.pdf");
        try(var document=new org.apache.pdfbox.pdmodel.PDDocument()){
            document.addPage(new org.apache.pdfbox.pdmodel.PDPage());document.save(pdf.toFile());
        }
        when(files.findById(43L)).thenReturn(Optional.of(FileObject.builder().id(43L).mimeType("application/pdf").storedPath(pdf.toString()).originalName("preview.pdf").build()));
        var response=send("/api/v1/files/43/page-preview","qa","GET");
        try{
            assertThat(response.statusCode()).isEqualTo(200);cacheHeaders(response);
            assertThat(response.headers().firstValue("content-type")).hasValue("image/png");
            assertThat(response.headers().firstValue("x-page-count")).hasValue("1");
            assertThat(javax.imageio.ImageIO.read(new ByteArrayInputStream(response.body()))).isNotNull();
        }finally{record("pdf-page-preview",response,null);}
    }
    private void png()throws Exception{
        Path p=directory.resolve("preview.png");
        javax.imageio.ImageIO.write(new java.awt.image.BufferedImage(2,2,java.awt.image.BufferedImage.TYPE_INT_RGB),"png",p.toFile());
        when(files.findById(42L)).thenReturn(Optional.of(FileObject.builder().id(42L).mimeType("image/png").storedPath(p.toString()).originalName("preview.png").targetType("ICON_ASSET").build()));
    }
    private void assertSuccessful(HttpResponse<byte[]> response)throws IOException{
        assertThat(response.statusCode()).isEqualTo(200);assertThat(response.body()).isEqualTo(expected);
        assertThat(response.headers().firstValue("content-type")).hasValue("application/zip");
        assertThat(response.headers().firstValue("content-disposition").orElseThrow()).contains("DHR-1-V10-complete.zip");
        assertThat(response.headers().firstValue("x-content-type-options")).hasValue("nosniff");
        assertThat(response.headers().firstValue("x-frame-options")).hasValue("DENY");
        assertThat(executor.submitted.get()).isEqualTo(1);assertThat(executor.started.get()).isEqualTo(1);verify(service,times(1)).export(anyLong(),anyLong(),anyString(),anySet(),anySet());removed();
    }
    private void denied(String identity,int status,String label)throws Exception{
        var response=send(EXPORT,identity,"GET");
        try{assertThat(response.statusCode()).isEqualTo(status);verifyNoInteractions(service);assertThat(owned).isNull();assertThat(executor.submitted.get()).isZero();}
        finally{record(label,response,null);}
    }
    private void previewHeaders(HttpResponse<byte[]> response){
        assertThat(response.statusCode()).isEqualTo(200);cacheHeaders(response);
        assertThat(response.headers().firstValue("x-content-type-options")).hasValue("nosniff");
        assertThat(response.headers().firstValue("content-security-policy").orElseThrow()).contains("sandbox");
    }
    private void cacheHeaders(HttpResponse<byte[]> response){
        assertThat(response.headers().firstValue("cache-control")).hasValue("private, max-age=300");
        assertThat(response.headers().firstValue("pragma")).isEmpty();assertThat(response.headers().firstValue("expires")).isEmpty();
    }
    private void assertErrorResponse(HttpResponse<byte[]> response)throws IOException{
        assertThat(response.statusCode()).isEqualTo(500);
        assertThat(response.headers().firstValue("content-type").orElseThrow()).startsWith("application/json");
        assertThat(response.headers().firstValue("content-disposition")).hasValue("inline");
        assertThat(new ObjectMapper().readTree(response.body()).path("code").asInt()).isEqualTo(500);
    }
    private void removed(){org.awaitility.Awaitility.await().atMost(Duration.ofSeconds(6)).untilAsserted(()->assertThat(owned).doesNotExist());}
    private HttpResponse<byte[]> send(String path,String user,String method)throws Exception{return client.send(request(path,user,method),HttpResponse.BodyHandlers.ofByteArray());}
    private HttpRequest request(String path,String user,String method){
        var b=HttpRequest.newBuilder(URI.create("http://127.0.0.1:"+port+"/header-audit"+path)).timeout(Duration.ofSeconds(10)).method(method,HttpRequest.BodyPublishers.noBody());
        if(user!=null)b.header("Authorization","Bearer "+("invalid".equals(user)?"invalid":tokens.generateToken("7001",user,"synthetic",1,
                "viewer".equals(user)?List.of("dhr.instances.view"):List.of("dhr.instances.view","dhr.summaries.export"))));
        return b.build();
    }
    private void record(String name,HttpResponse<byte[]> response,Throwable failure)throws IOException{
        Path out=Path.of(System.getProperty("edhr.audit.jwtHeadersOutput"));Files.createDirectories(out);
        var data=new LinkedHashMap<String,Object>();data.put("name",name);data.put("httpStatus",response==null?null:response.statusCode());
        data.put("responseBytes",response==null?null:response.body().length);data.put("headers",response==null?null:response.headers().map());
        data.put("submitted",executor.submitted.get());data.put("started",executor.started.get());data.put("maxConcurrentHeaderWriters",probe.maxWriters.get());
        data.put("headerWriterThreads",probe.threads);data.put("initialRequests",probe.requests.get());
        data.put("ownedExistsBeforeFixtureTeardown",owned!=null&&Files.exists(owned));data.put("exchangeFailure",failure==null?null:failure.getClass().getName());
        data.put("scope","actual SecurityConfig/JWT signing+filter/Controller/GlobalExceptionHandler+Tomcat; synthetic claims/key, mocked archive generator/repos; overlap probe only forces timing, not production latency");
        new ObjectMapper().writerWithDefaultPrettyPrinter().writeValue(out.resolve(name+".json").toFile(),data);
    }
    static class HeaderProbe{
        final AtomicBoolean enabled=new AtomicBoolean();final AtomicInteger active=new AtomicInteger(),maxWriters=new AtomicInteger(),requests=new AtomicInteger();
        final Set<String> threads=ConcurrentHashMap.newKeySet();volatile CountDownLatch workerHeader=new CountDownLatch(1),twoWriters=new CountDownLatch(2);
        void reset(){enabled.set(false);active.set(0);maxWriters.set(0);requests.set(0);threads.clear();workerHeader=new CountDownLatch(1);twoWriters=new CountDownLatch(2);}
        void beforeHeader(){
            int n=active.incrementAndGet();maxWriters.accumulateAndGet(n,Math::max);threads.add(Thread.currentThread().getName());
            if(Thread.currentThread().getName().equals("archive-jwt-worker"))workerHeader.countDown();twoWriters.countDown();
            try{twoWriters.await(700,TimeUnit.MILLISECONDS);}catch(InterruptedException ex){Thread.currentThread().interrupt();}
        }
    }
    enum Mode{NORMAL,INLINE,REJECT,HOLD}
    static class ControlledExecutor implements AsyncTaskExecutor,org.springframework.beans.factory.DisposableBean{
        final HeaderProbe probe;final AtomicReference<Mode> mode=new AtomicReference<>(Mode.NORMAL);
        final AtomicInteger submitted=new AtomicInteger(),started=new AtomicInteger();final Queue<Runnable> queued=new ConcurrentLinkedQueue<>();
        final ExecutorService worker=Executors.newCachedThreadPool(task->{var t=new Thread(task,"archive-jwt-worker");t.setDaemon(true);return t;});
        ControlledExecutor(HeaderProbe probe){this.probe=probe;}
        void reset(){mode.set(Mode.NORMAL);submitted.set(0);started.set(0);queued.clear();}
        @Override public void execute(Runnable task){
            submitted.incrementAndGet();if(mode.get()==Mode.REJECT)throw new TaskRejectedException("synthetic JWT executor rejection");
            if(mode.get()==Mode.HOLD){queued.add(task);return;}
            Runnable counted=()->{started.incrementAndGet();task.run();};
            if(mode.get()==Mode.INLINE)counted.run();else{
                worker.execute(counted);
                if(probe.enabled.get())try{probe.workerHeader.await(700,TimeUnit.MILLISECONDS);}catch(InterruptedException ex){Thread.currentThread().interrupt();}
            }
        }
        @Override public void destroy(){queued.clear();worker.shutdownNow();}
    }
    @Configuration(proxyBeanMethods=false)
    @Profile("archive-jwt-headers-test")
    @EnableAutoConfiguration(exclude={DataSourceAutoConfiguration.class,HibernateJpaAutoConfiguration.class,LiquibaseAutoConfiguration.class})
    @Import({SecurityConfig.class,JwtAuthenticationFilter.class,JwtTokenProvider.class,DhrArchiveController.class,FileController.class,GlobalExceptionHandler.class})
    static class TestApplication{
        @Bean HeaderProbe headerProbe(){return new HeaderProbe();}
        @Bean ControlledExecutor controlledExecutor(HeaderProbe probe){return new ControlledExecutor(probe);}
        @Bean WebMvcConfigurer asyncConfigurer(ControlledExecutor executor){return new WebMvcConfigurer(){
            @Override public void configureAsyncSupport(AsyncSupportConfigurer c){c.setTaskExecutor(executor).setDefaultTimeout(3000);}
        };}
        @Bean FilterRegistrationBean<Filter> headerObservation(HeaderProbe probe){
            Filter filter=(request,response,chain)->{
                var http=(HttpServletRequest)request;var res=(HttpServletResponse)response;
                boolean archive=http.getRequestURI().equals(http.getContextPath()+EXPORT);
                if(archive&&http.getDispatcherType()==DispatcherType.REQUEST)probe.requests.incrementAndGet();
                if(!probe.enabled.get()||!archive){chain.doFilter(request,response);return;}
                var wrapper=new HttpServletResponseWrapper(res){
                    @Override public void setHeader(String name,String value){
                        if(!name.equalsIgnoreCase("X-Content-Type-Options")){super.setHeader(name,value);return;}
                        probe.beforeHeader();try{super.setHeader(name,value);}finally{probe.active.decrementAndGet();}
                    }
                    @Override public void addHeader(String name,String value){
                        if(!name.equalsIgnoreCase("X-Content-Type-Options")){super.addHeader(name,value);return;}
                        probe.beforeHeader();try{super.addHeader(name,value);}finally{probe.active.decrementAndGet();}
                    }
                };
                chain.doFilter(request,wrapper);
            };
            var registration=new FilterRegistrationBean<>(filter);registration.setOrder(Ordered.HIGHEST_PRECEDENCE);registration.setAsyncSupported(true);return registration;
        }
    }
}
