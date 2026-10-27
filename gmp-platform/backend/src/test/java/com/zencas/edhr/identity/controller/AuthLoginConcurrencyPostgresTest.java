package com.zencas.edhr.identity.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.identity.repository.LoginLogRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

@EnabledIfSystemProperty(named="auth.audit.url", matches="jdbc:postgresql:.*edhr_auth_audit_.*")
@SpringBootTest(properties={
        "spring.datasource.url=${auth.audit.url}", "spring.datasource.username=${auth.audit.user:postgres}", "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=validate", "spring.jpa.show-sql=false", "logging.level.org.hibernate.SQL=OFF",
        "logging.level.org.springframework.security=ERROR", "logging.level.com.zencas.edhr=INFO"
})
@AutoConfigureMockMvc
class AuthLoginConcurrencyPostgresTest {
    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;
    @Autowired ObjectMapper mapper;
    @SpyBean PasswordEncoder passwords;
    @SpyBean LoginLogRepository logs;
    static final AtomicLong sequence=new AtomicLong(-System.currentTimeMillis());
    static final String VALID="Audit-Valid-Passw0rd!";
    long id;
    String username;
    String hash;

    @BeforeEach void seed() {
        id=sequence.decrementAndGet(); username="auth-audit-"+id; hash=passwords.encode(VALID);
        jdbc.update("INSERT INTO user_account(id,tenant_id,username,password_hash,display_name,status,failed_login_attempts,password_changed_at) VALUES (?,0,?,?,'隔离审计用户','ACTIVE',0,CURRENT_TIMESTAMP)",id,username,hash);
        jdbc.update("INSERT INTO system_setting(id,tenant_id,system_name,browser_title,password_failure_lock_threshold,password_failure_lock_minutes) VALUES (?,'default','隔离系统','隔离系统',2,30) ON CONFLICT (tenant_id) DO UPDATE SET password_failure_lock_threshold=2,password_failure_lock_minutes=30",id);
        assertThat(jdbc.queryForObject("SELECT password_failure_lock_threshold FROM system_setting WHERE tenant_id='default'",Integer.class)).isEqualTo(2);
    }
    @AfterEach void restoreSpies() { reset(passwords,logs); }
    int login(String account,String password) throws Exception {
        return mvc.perform(post("/api/v1/auth/login").contentType("application/json")
                .content(mapper.writeValueAsString(Map.of("username",account,"password",password))))
                .andReturn().getResponse().getStatus();
    }
    int attempts() { return jdbc.queryForObject("SELECT failed_login_attempts FROM user_account WHERE id=?",Integer.class,id); }

    @Test void overlappingFailuresReachConfiguredThresholdWithoutBlockingOtherAccounts() throws Exception {
        long other=sequence.decrementAndGet();String otherUsername="auth-audit-"+other;
        jdbc.update("INSERT INTO user_account(id,tenant_id,username,password_hash,display_name,status,failed_login_attempts) VALUES (?,0,?,?,'其他隔离用户','ACTIVE',0)",other,otherUsername,passwords.encode(VALID));
        CountDownLatch firstAtCheck=new CountDownLatch(1), release=new CountDownLatch(1), secondAtCheck=new CountDownLatch(1);
        var first=new java.util.concurrent.atomic.AtomicBoolean(true);
        doAnswer(invocation -> {
            if(first.compareAndSet(true,false)) {
                firstAtCheck.countDown();
                if(!release.await(10,TimeUnit.SECONDS)) throw new IllegalStateException("test gate timed out");
            } else secondAtCheck.countDown();
            return invocation.callRealMethod();
        }).when(passwords).matches(eq("wrong-password"),eq(hash));
        try(var pool=Executors.newFixedThreadPool(3)) {
            var a=pool.submit(() -> login(username,"wrong-password"));
            try {
                assertThat(firstAtCheck.await(5,TimeUnit.SECONDS)).isTrue();
                var b=pool.submit(() -> login(username,"wrong-password"));
                // Old code reaches this point after loading the same stale counter; locked code waits at the row.
                secondAtCheck.await(500,TimeUnit.MILLISECONDS);
                assertThat(pool.submit(() -> login(otherUsername,"wrong-password")).get(5,TimeUnit.SECONDS)).isEqualTo(401);
                release.countDown();
                assertThat(a.get(10,TimeUnit.SECONDS)).isEqualTo(401);
                assertThat(b.get(10,TimeUnit.SECONDS)).isEqualTo(401);
            } finally { release.countDown(); }
        }
        assertThat(attempts()).isEqualTo(2);
        assertThat(jdbc.queryForObject("SELECT locked_until>CURRENT_TIMESTAMP FROM user_account WHERE id=?",Boolean.class,id)).isTrue();
        assertThat(login(username,VALID)).isEqualTo(403);
        assertThat(jdbc.queryForObject("SELECT failed_login_attempts FROM user_account WHERE id=?",Integer.class,other)).isEqualTo(1);
    }

    @Test void persistedFailureAndExpiredLockClearOnlyOnSuccessfulLogin() throws Exception {
        assertThat(login(username,"wrong-password")).isEqualTo(401);
        assertThat(attempts()).isEqualTo(1);
        jdbc.update("UPDATE user_account SET locked_until=CURRENT_TIMESTAMP-INTERVAL '1 minute' WHERE id=?",id);
        assertThat(login(username,VALID)).isEqualTo(200);
        assertThat(attempts()).isZero();
        assertThat(jdbc.queryForObject("SELECT locked_until IS NULL AND last_login_at IS NOT NULL FROM user_account WHERE id=?",Boolean.class,id)).isTrue();
        assertThat(jdbc.queryForObject("SELECT count(*) FROM login_log WHERE operator_id=? AND event_type='LOGIN'",Integer.class,id)).isEqualTo(1);
    }

    @Test void disabledAccountCannotLoginOrAccumulatePasswordFailures() throws Exception {
        jdbc.update("UPDATE user_account SET status='DISABLED' WHERE id=?",id);
        assertThat(login(username,VALID)).isEqualTo(403);
        assertThat(attempts()).isZero();
        assertThat(jdbc.queryForObject("SELECT count(*) FROM login_log WHERE operator_id=?",Integer.class,id)).isZero();
    }

    @Test void technicalLoginLogFailureDoesNotPublishSuccessfulState() throws Exception {
        jdbc.update("UPDATE user_account SET failed_login_attempts=1 WHERE id=?",id);
        doThrow(new IllegalStateException("synthetic login log failure")).when(logs).save(argThat(log -> log!=null && username.equals(log.getUsername())));
        assertThat(login(username,VALID)).isEqualTo(500);
        assertThat(attempts()).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT last_login_at IS NULL FROM user_account WHERE id=?",Boolean.class,id)).isTrue();
        assertThat(jdbc.queryForObject("SELECT count(*) FROM login_log WHERE operator_id=?",Integer.class,id)).isZero();
    }
}
