package com.zencas.edhr.template.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import static org.assertj.core.api.Assertions.*;

class FormReferenceLookupTest {
    final ObjectMapper mapper = new ObjectMapper();
    JdbcTemplate jdbc;
    FormReferenceLookup lookup;
    @BeforeEach void setup() {
        // Keep one database for the lifetime of each test, without relying on external master data.
        jdbc = new JdbcTemplate(new DriverManagerDataSource("jdbc:h2:mem:ref-" + java.util.UUID.randomUUID() + ";DB_CLOSE_DELAY=-1", "sa", ""));
        lookup = new FormReferenceLookup(jdbc);
        jdbc.execute("CREATE TABLE material(id BIGINT PRIMARY KEY, code VARCHAR, name VARCHAR, specification VARCHAR, status VARCHAR)");
        jdbc.update("INSERT INTO material VALUES (1,'M01','导管','A','ACTIVE'),(2,'M02','接头','B','ACTIVE'),(3,'M03','停用','A','INACTIVE'),(4,'M04','百分%号','A','ACTIVE')");
    }
    @AfterEach void cleanup() { jdbc.execute("DROP ALL OBJECTS"); }
    JsonNode json(String text) throws Exception { return mapper.readTree(text); }
    JsonNode conditional(String op) throws Exception { return json("""
        {"sourceType":"material","referenceField":"code","referenceQueryConditions":[{"sourceField":"specification","operator":"%s","targetFieldId":"spec"}]}
        """.formatted(op)); }

    @Test void configuredDisplayAndSearchUseOnlyActiveRecords() throws Exception {
        assertThat(lookup.search(json("{\"sourceType\":\"material\",\"referenceField\":\"code\"}"), "M02", null)).containsExactly(java.util.Map.of("id", "2", "name", "M02"));
        assertThat(lookup.search(json("{\"sourceType\":\"material\"}"), "停用", null)).isEmpty();
        assertThat(lookup.search(json("{\"sourceType\":\"material\"}"), "%", null)).singleElement().satisfies(row -> assertThat(row.get("id")).isEqualTo("4"));
    }
    @Test void conditionsAndValidationShareTheSameQuery() throws Exception {
        assertThat(lookup.search(conditional("eq"), "", json("{\"spec\":\"B\"}"))).containsExactly(java.util.Map.of("id", "2", "name", "M02"));
        lookup.validate(conditional("eq"), json("{\"id\":\"2\",\"name\":\"M02\"}"), json("{\"spec\":\"B\"}"));
        assertThatThrownBy(() -> lookup.validate(conditional("eq"), json("{\"id\":\"2\",\"name\":\"M02\"}"), json("{\"spec\":\"A\"}"))).hasMessageContaining("不符合查询条件");
        assertThatThrownBy(() -> lookup.validate(conditional("eq"), json("{\"id\":\"2\",\"name\":\"伪造\"}"), json("{\"spec\":\"B\"}"))).hasMessageContaining("已失效");
        assertThat(lookup.search(conditional("eq"), "", json("{}"))).isEmpty();
        assertThat(lookup.search(conditional("eq"), "", json("{\"spec\":{\"id\":\"9\",\"name\":\"B\"}}"))).hasSize(1);
        assertThat(lookup.search(conditional("ne"), "", json("{\"spec\":\"A\"}"))).hasSize(1);
        assertThat(lookup.search(conditional("contains"), "", json("{\"spec\":\"B\"}"))).hasSize(1);
        assertThat(lookup.search(conditional("notContains"), "", json("{\"spec\":\"A\"}"))).hasSize(1);
    }
    @Test void whitelistAndParametersRejectMalformedAndInjectedConfiguration() throws Exception {
        assertThatThrownBy(() -> lookup.search(json("{\"sourceType\":\"supplier\"}"), "", null)).hasMessageContaining("尚不可用");
        assertThatThrownBy(() -> lookup.search(json("{\"sourceType\":\"material\",\"referenceField\":\"name; DROP TABLE material\"}"), "", null)).hasMessageContaining("不支持");
        assertThatThrownBy(() -> lookup.search(conditional("or 1=1"), "", json("{\"spec\":\"A\"}"))).hasMessageContaining("运算符");
        assertThat(lookup.search(conditional("eq"), "", json("{\"spec\":\"' OR 1=1 --\"}"))).isEmpty();
        assertThatThrownBy(() -> lookup.search(json("{\"sourceType\":\"material\",\"referenceQueryConditions\":[{\"sourceField\":\"code\"}]}"), "", null)).hasMessageContaining("完整配置");
        assertThat(lookup.search(json("{\"sourceType\":\"material\",\"referenceQueryConditions\":[{\"sourceField\":\"\",\"targetFieldId\":\"\",\"operator\":\"eq\"}]}"), "", null)).hasSize(3);
    }
    @Test void dictionaryRequiresActiveItemAndDictionary() throws Exception {
        jdbc.execute("CREATE TABLE business_dictionary(id BIGINT,code VARCHAR,status VARCHAR)");
        jdbc.execute("CREATE TABLE business_dictionary_item(id BIGINT,dictionary_id BIGINT,label VARCHAR,\"VALUE\" VARCHAR,status VARCHAR)");
        jdbc.update("INSERT INTO business_dictionary VALUES(1,'UNIT','ACTIVE'),(2,'OLD','INACTIVE')");
        jdbc.update("INSERT INTO business_dictionary_item VALUES(11,1,'件','PCS','ACTIVE'),(12,1,'旧','OLD','INACTIVE'),(13,2,'旧','OLD','ACTIVE')");
        assertThat(lookup.search(json("{\"sourceType\":\"dictionary\"}"), "", null)).containsExactly(java.util.Map.of("id", "11", "name", "件"));
    }

    @Test void productsComeFromFinishedAndSemiFinishedMaterials() throws Exception {
        jdbc.execute("ALTER TABLE material ADD material_type_id BIGINT");
        jdbc.execute("CREATE TABLE material_type(id BIGINT,name VARCHAR)");
        jdbc.update("INSERT INTO material_type VALUES(10,'产成品'),(20,'半成品'),(30,'原料')");
        jdbc.update("UPDATE material SET material_type_id=CASE id WHEN 1 THEN 10 WHEN 2 THEN 20 WHEN 3 THEN 10 ELSE 30 END");
        assertThat(lookup.search(json("{\"sourceType\":\"product\"}"), "", null)).extracting(row -> row.get("id")).containsExactly("1", "2");
        lookup.validate(json("{\"sourceType\":\"product\"}"), json("{\"id\":\"1\",\"name\":\"导管\"}"), null);
        assertThatThrownBy(() -> lookup.validate(json("{\"sourceType\":\"product\"}"), json("{\"id\":\"4\",\"name\":\"百分%号\"}"), null)).hasMessageContaining("已失效");
    }
}
