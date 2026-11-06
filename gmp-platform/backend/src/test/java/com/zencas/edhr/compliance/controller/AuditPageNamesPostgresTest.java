package com.zencas.edhr.compliance.controller;

import com.zencas.edhr.compliance.dto.AuditLogItem;
import org.hibernate.engine.spi.SessionFactoryImplementor;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.dao.IncorrectResultSizeDataAccessException;

import java.util.ArrayList;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.*;

class AuditPageNamesPostgresTest extends AuditReadPostgresSupport {
    static Stream<Arguments> scales() {
        return Stream.of("shared", "distinct", "missing", "blank")
                .flatMap(axis -> Stream.of(100, 1000, 5000).map(n -> Arguments.of(axis, n)));
    }

    @ParameterizedTest @MethodSource("scales")
    void namesDependOnTheReturnedPageRatherThanMatchingHistory(String axis, int count) throws Exception {
        seed(count, axis, 0);
        var result = observe("names_" + axis + "_" + count, () -> list(1, 20, null, null, null, null));
        assertThat(result.getTotalElements()).isEqualTo(count);
        assertThat(result.getContent()).extracting(AuditLogItem::getId)
                .containsExactlyElementsOf(java.util.stream.LongStream.iterate(count, n -> n - 1).limit(20).boxed().toList());
        assertThat(result.getContent().getFirst().getOperatorDisplayName()).isEqualTo(
                axis.equals("blank") ? "-" : axis.equals("missing") ? "历史姓名" + count
                        : axis.equals("shared") ? "当前姓名1" : "当前姓名" + count);
        assertQueries(2);
        long people = axis.equals("shared") ? 1 : axis.equals("distinct") ? 20 : 0;
        assertThat(factory.unwrap(SessionFactoryImplementor.class).getStatistics().getEntityLoadCount())
                .isEqualTo(count + people);
    }

    @Test void largePagesReadEveryAccountAcrossBoundedBatchesAndContinue() throws Exception {
        seed(1205, "distinct", 0);
        var first = observe("names_large_first", () -> list(1, 1100, null, null, null, null));
        assertThat(first.getContent()).hasSize(1100);
        assertThat(first.getTotalElements()).isEqualTo(1205);
        assertThat(first.getContent().getFirst().getOperatorDisplayName()).isEqualTo("当前姓名1205");
        assertThat(first.getContent().getLast().getOperatorDisplayName()).isEqualTo("当前姓名106");
        assertQueries(4);
        var second = observe("names_large_second", () -> list(2, 1100, null, null, null, null));
        assertThat(second.getTotalElements()).isEqualTo(1205);
        assertQueries(2);
        var all = new ArrayList<>(first.getContent()); all.addAll(second.getContent());
        assertThat(all).extracting(AuditLogItem::getId).containsExactlyElementsOf(
                java.util.stream.LongStream.iterate(1205, n -> n - 1).limit(1205).boxed().toList());
        for (AuditLogItem item : all) assertThat(item.getOperatorDisplayName()).isEqualTo("当前姓名" + item.getId());
    }

    @Test void noNamesAreLoadedForFilteredOutRowsOrBeyondTheLastPage() throws Exception {
        seed(1000, "shared", 0);
        var filtered = observe("names_filtered_empty", () -> list(1, 20, null, null, "不存在的菜单", null));
        assertThat(filtered.getContent()).isEmpty(); assertThat(filtered.getTotalElements()).isZero(); assertQueries(1);
        var beyond = observe("names_beyond_end", () -> list(100, 20, null, null, null, null));
        assertThat(beyond.getContent()).isEmpty(); assertThat(beyond.getTotalElements()).isEqualTo(1000); assertQueries(1);
    }

    @Test void historicalNameFilterIsAppliedBeforeCurrentNameEnrichment() throws Exception {
        seed(1000, "shared", 0);
        var result = observe("names_historical_filter", () -> controller.list(1,20,"createdAt","desc",
                null,null,null,"历史姓名1000",null,null,null,null).getData());
        assertThat(result.getContent()).extracting(AuditLogItem::getId).containsExactly(1000L);
        assertThat(result.getContent().getFirst().getOperatorDisplayName()).isEqualTo("当前姓名1"); assertQueries(2);
        var current = observe("names_current_filter_empty", () -> controller.list(1,20,"createdAt","desc",
                null,null,null,"当前姓名1",null,null,null,null).getData());
        assertThat(current.getTotalElements()).isZero(); assertQueries(1);
    }

    @Test void currentBlankNamesAndLegacyAccountFallbacksArePreserved() throws Exception {
        seed(5, "shared", 0);
        jdbc.update("UPDATE user_account SET display_name=' ' WHERE username='probe-1'");
        jdbc.update("UPDATE audit_event SET operator_name='历史1' WHERE id=1");
        jdbc.update("UPDATE audit_event SET operator_name='probe-1' WHERE id=2");
        jdbc.update("UPDATE audit_event SET operator_account=NULL,operator_name='老账号' WHERE id=3");
        jdbc.update("UPDATE audit_event SET operator_account=NULL,operator_name=NULL WHERE id=4");
        jdbc.update("UPDATE audit_event SET operator_account=NULL,operator_name=NULL,operator_id=NULL WHERE id=5");
        jdbc.update("INSERT INTO user_account(id,tenant_id,username,password_hash,display_name,status) VALUES(920005,0,'-','synthetic','系统触发账号','DISABLED')");
        var result = observe("names_fallbacks", () -> list(1,20,null,null,null,null));
        assertThat(result.getContent()).extracting(AuditLogItem::getOperatorDisplayName)
                .containsExactly("系统触发账号","historical-id","老账号","probe-1","历史1");
        assertQueries(2);
    }

    @Test void duplicateAccountOnThePageIsNotSilentlyResolvedToAnArbitraryUser() {
        seed(2,"shared",0);
        jdbc.update("INSERT INTO user_account(id,tenant_id,username,password_hash,display_name,status) VALUES(920001,1,'probe-1','synthetic','另一账户','ACTIVE')");
        assertThatThrownBy(() -> list(1,20,null,null,null,null)).isInstanceOf(IncorrectResultSizeDataAccessException.class);
    }

    @Test void offPageAccountsAreNotEnriched() {
        seed(50,"distinct",0);
        jdbc.update("INSERT INTO user_account(id,tenant_id,username,password_hash,display_name,status) VALUES(920001,1,'probe-1','synthetic','另一账户','ACTIVE')");
        assertThatCode(() -> {
            var result = observe("names_off_page", () -> list(1,20,null,null,null,null));
            assertThat(result.getContent()).hasSize(20);
            assertThat(result.getContent().getFirst().getOperatorDisplayName()).isEqualTo("当前姓名50");
            assertQueries(2);
        }).doesNotThrowAnyException();
    }

    private void assertQueries(long expected) {
        assertThat(factory.unwrap(SessionFactoryImplementor.class).getStatistics().getPrepareStatementCount())
                .as("event read plus bounded current-page name batches").isEqualTo(expected);
    }
}
