package com.zencas.edhr.production.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.production.service.DhrArchiveService;
import jakarta.servlet.DispatcherType;
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
import org.springframework.context.annotation.*;
import org.springframework.core.task.AsyncTaskExecutor;
import org.springframework.core.task.TaskRejectedException;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.ObjectPostProcessor;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.header.HeaderWriterFilter;
import org.springframework.web.servlet.config.annotation.*;
import org.springframework.test.context.ActiveProfiles;

import java.io.ByteArrayOutputStream;
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

/** Real embedded Tomcat/MVC; synthetic Basic users and mocked ZIP generation, not the product JWT/DB chain. */
@EnabledIfSystemProperty(named="edhr.audit.archiveAsync",matches="true")
@ActiveProfiles("archive-async-http-test")
@SpringBootTest(classes=DhrArchiveAsyncLifecycleTest.TestApplication.class,webEnvironment=SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties={"spring.liquibase.enabled=false","spring.jpa.open-in-view=false","server.error.include-message=never"})
class DhrArchiveAsyncLifecycleTest {
    @LocalServerPort int port;
    @Autowired ControlledExecutor executor;
    @MockBean DhrArchiveService service;
    @TempDir Path directory;
    private HttpClient client;
    private volatile Path owned;
    private volatile byte[] expected;

    @BeforeEach void setup()throws Exception{
        client=HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();executor.reset();
        when(service.export(eq(1L),eq(10L),eq("FULL"),eq(Set.of()),eq(Set.of()))).thenAnswer(call->{
            var bytes=new ByteArrayOutputStream();
            try(var zip=new ZipOutputStream(bytes,StandardCharsets.UTF_8)){
                zip.putNextEntry(new ZipEntry("frozen.txt"));zip.write("frozen async archive fixture".getBytes(StandardCharsets.UTF_8));zip.closeEntry();
            }
            expected=bytes.toByteArray();owned=Files.createTempFile(directory,"owned-",".zip");Files.write(owned,expected);return owned;
        });
    }
    @AfterEach void removeOnlyFixtureResources()throws Exception{
        executor.queued.clear();if(client!=null)client.close();if(owned!=null)Files.deleteIfExists(owned);
    }

    @Test void normalHttpStreamReturnsExactBytesAndDeletesOwnedArchive()throws Exception{
        var response=get("qa");
        try{
            assertThat(response.statusCode()).isEqualTo(200);assertThat(response.body()).isEqualTo(expected);
            assertThat(response.headers().firstValue("content-type")).hasValue("application/zip");
            assertThat(response.headers().firstValue("content-disposition").orElseThrow()).contains("DHR-1-V10-complete.zip");
            assertThat(executor.started.get()).isEqualTo(1);assertEventuallyRemoved();
        }finally{record("normal",response);}
    }

    @Test void rejectedAsyncSubmissionReleasesArchiveEvenThoughBodyNeverStarts()throws Exception{
        executor.mode.set(Mode.REJECT);var response=get("qa");
        try{
            assertThat(response.statusCode()).isEqualTo(500);assertThat(executor.submitted.get()).isEqualTo(1);
            assertThat(executor.started.get()).isZero();assertThat(owned).isNotNull();assertEventuallyRemoved();
        }finally{record("rejected",response);}
    }

    @Test void queuedTaskTimeoutReleasesArchiveWithoutExecutingTheBody()throws Exception{
        executor.mode.set(Mode.HOLD);var response=get("qa");
        try{
            assertThat(response.statusCode()).isEqualTo(503);assertThat(executor.submitted.get()).isEqualTo(1);
            assertThat(executor.started.get()).isZero();assertThat(owned).isNotNull();assertEventuallyRemoved();
        }finally{record("queued-timeout",response);}
    }

    @Test void viewPermissionAloneCannotCreateAnExportArchive()throws Exception{
        var response=get("viewer");
        try{
            assertThat(response.statusCode()).isEqualTo(403);verifyNoInteractions(service);
            assertThat(owned).isNull();assertThat(executor.submitted.get()).isZero();
        }finally{record("forbidden",response);}
    }

    @Test void clientCancellationWhileQueuedDoesNotLeaveTheGeneratedArchive()throws Exception{
        executor.mode.set(Mode.HOLD);
        var response=client.sendAsync(request("qa"),HttpResponse.BodyHandlers.ofByteArray());
        try{
            org.awaitility.Awaitility.await().atMost(Duration.ofSeconds(5)).until(()->owned!=null&&executor.submitted.get()==1);
            assertThat(response.cancel(true)).isTrue();assertThat(executor.started.get()).isZero();assertEventuallyRemoved();
        }finally{
            Path out=Path.of(System.getProperty("edhr.audit.archiveAsyncOutput"));Files.createDirectories(out);
            new ObjectMapper().writerWithDefaultPrettyPrinter().writeValue(out.resolve("client-cancelled.json").toFile(),Map.of(
                    "clientFutureCancelled",response.isCancelled(),"submitted",executor.submitted.get(),"started",executor.started.get(),
                    "ownedExistsBeforeFixtureTeardown",owned!=null&&Files.exists(owned),
                    "scope","real client cancellation while queued; eventual request completion may be error or timeout, not an immediate-cancel attribution"));
        }
    }

    private HttpResponse<byte[]> get(String user)throws Exception{
        return client.send(request(user),HttpResponse.BodyHandlers.ofByteArray());
    }
    private HttpRequest request(String user){
        String basic=Base64.getEncoder().encodeToString((user+":synthetic-only").getBytes(StandardCharsets.UTF_8));
        return HttpRequest.newBuilder(URI.create("http://127.0.0.1:"+port+"/api/v1/dhr-instances/1/summary/versions/10/export"))
                .header("Authorization","Basic "+basic).timeout(Duration.ofSeconds(10)).GET().build();
    }
    private void assertEventuallyRemoved(){
        assertThatCode(()->org.awaitility.Awaitility.await().atMost(Duration.ofSeconds(5)).untilAsserted(()->assertThat(owned).doesNotExist()))
                .as("completed request must release its generated but unclaimed ZIP").doesNotThrowAnyException();
    }
    private void record(String name,HttpResponse<byte[]> response)throws Exception{
        Path out=Path.of(System.getProperty("edhr.audit.archiveAsyncOutput"));Files.createDirectories(out);
        var data=new LinkedHashMap<String,Object>();data.put("name",name);data.put("httpStatus",response.statusCode());
        data.put("responseBytes",response.body().length);data.put("submitted",executor.submitted.get());data.put("started",executor.started.get());
        data.put("ownedPath",owned==null?null:owned.toString());data.put("ownedExistsBeforeFixtureTeardown",owned!=null&&Files.exists(owned));
        data.put("scope","real embedded Tomcat and MVC; independent synthetic Basic security and mock archive generator, not product JWT/database/PDF");
        new ObjectMapper().writerWithDefaultPrettyPrinter().writeValue(out.resolve(name+".json").toFile(),data);
    }

    enum Mode{NORMAL,REJECT,HOLD}
    static class ControlledExecutor implements AsyncTaskExecutor,org.springframework.beans.factory.DisposableBean{
        final AtomicReference<Mode> mode=new AtomicReference<>(Mode.NORMAL);
        final AtomicInteger submitted=new AtomicInteger(),started=new AtomicInteger();
        final Queue<Runnable> queued=new ConcurrentLinkedQueue<>();
        final ExecutorService worker=Executors.newCachedThreadPool(task->{var thread=new Thread(task,"archive-async-test");thread.setDaemon(true);return thread;});
        void reset(){mode.set(Mode.NORMAL);submitted.set(0);started.set(0);queued.clear();}
        @Override public void execute(Runnable task){
            submitted.incrementAndGet();
            if(mode.get()==Mode.REJECT)throw new TaskRejectedException("fixture async executor rejected submission");
            if(mode.get()==Mode.HOLD){queued.add(task);return;}
            worker.execute(()->{started.incrementAndGet();task.run();});
        }
        @Override public void destroy(){queued.clear();worker.shutdownNow();}
    }

    @Configuration(proxyBeanMethods=false)
    @Profile("archive-async-http-test")
    @EnableAutoConfiguration(exclude={DataSourceAutoConfiguration.class,HibernateJpaAutoConfiguration.class,LiquibaseAutoConfiguration.class})
    @EnableMethodSecurity
    @Import(DhrArchiveController.class)
    static class TestApplication{
        @Bean ControlledExecutor controlledExecutor(){return new ControlledExecutor();}
        @Bean WebMvcConfigurer asyncConfiguration(ControlledExecutor executor){return new WebMvcConfigurer(){
            @Override public void configureAsyncSupport(AsyncSupportConfigurer config){config.setTaskExecutor(executor).setDefaultTimeout(250);}
        };}
        @Bean UserDetailsService users(){return new InMemoryUserDetailsManager(
                User.withUsername("qa").password("{noop}synthetic-only").authorities("dhr.instances.view","dhr.summaries.export").build(),
                User.withUsername("viewer").password("{noop}synthetic-only").authorities("dhr.instances.view").build());}
        @Bean SecurityFilterChain security(HttpSecurity http)throws Exception{
            return http.authorizeHttpRequests(auth->auth.dispatcherTypeMatchers(DispatcherType.ERROR,DispatcherType.ASYNC).permitAll().anyRequest().authenticated())
                    // Isolate ZIP ownership from the default lazy-header writer's servlet/worker race.
                    // This synthetic Basic chain is not the product JWT/cache-response policy.
                    .headers(headers->headers.withObjectPostProcessor(new ObjectPostProcessor<HeaderWriterFilter>(){
                        @Override public <O extends HeaderWriterFilter> O postProcess(O filter){
                            filter.setShouldWriteHeadersEagerly(true);return filter;
                        }
                    }))
                    .httpBasic(Customizer.withDefaults()).build();
        }
    }
}
