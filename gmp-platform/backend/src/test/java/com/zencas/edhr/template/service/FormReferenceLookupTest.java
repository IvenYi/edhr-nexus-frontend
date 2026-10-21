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
        jdbc = new JdbcTemplate(new DriverManagerDataSource("jdbc:h2:mem:ref-" + java.util.UUID.randomUUID() + ";DB_CLOSE_DELAY=-1;NON_KEYWORDS=VALUE", "sa", ""));
        lookup = new FormReferenceLookup(jdbc);
        jdbc.execute("CREATE TABLE material(id BIGINT PRIMARY KEY, code VARCHAR, name VARCHAR, specification VARCHAR, status VARCHAR, unit VARCHAR)");
        jdbc.update("INSERT INTO material(id,code,name,specification,status) VALUES (1,'M01','导管','A','ACTIVE'),(2,'M02','接头','B','ACTIVE'),(3,'M03','停用','A','INACTIVE'),(4,'M04','百分%号','A','ACTIVE')");
    }
    @AfterEach void cleanup() { jdbc.execute("DROP ALL OBJECTS"); }
    JsonNode json(String text) throws Exception { return mapper.readTree(text); }
    JsonNode conditional(String op) throws Exception { return json("""
        {"sourceType":"material","referenceField":"code","referenceQueryConditions":[{"sourceField":"specification","operator":"%s","targetFieldId":"spec"}]}
        """.formatted(op)); }

    @Test void configuredDisplayAndSearchUseOnlyActiveRecords() throws Exception {
        assertThat(lookup.search(json("{\"sourceType\":\"material\",\"referenceField\":\"code\"}"), "M02", null)).singleElement().satisfies(row -> assertThat(row).containsAllEntriesOf(java.util.Map.of("id", "2", "name", "M02", "code", "M02", "sourceType", "material")));
        assertThat(lookup.search(json("{\"sourceType\":\"material\",\"referenceField\":\"specification\"}"), "M02", null)).singleElement()
                .satisfies(row -> assertThat(row).containsEntry("name", "B").containsEntry("code", "M02"));
        assertThat(lookup.search(json("{\"sourceType\":\"material\"}"), "停用", null)).isEmpty();
        assertThat(lookup.search(json("{\"sourceType\":\"material\"}"), "%", null)).singleElement().satisfies(row -> assertThat(row.get("id")).isEqualTo("4"));
    }
    @Test void conditionsAndValidationShareTheSameQuery() throws Exception {
        assertThat(lookup.search(conditional("eq"), "", json("{\"spec\":\"B\"}"))).singleElement().satisfies(row -> assertThat(row).containsAllEntriesOf(java.util.Map.of("id", "2", "name", "M02", "code", "M02", "sourceType", "material")));
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
        assertThat(lookup.search(json("{\"sourceType\":\"dictionary\"}"), "", null)).singleElement().satisfies(row -> assertThat(row).containsAllEntriesOf(java.util.Map.of("id", "11", "name", "件", "code", "PCS", "sourceType", "dictionary")));
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

    @Test void unifiedMaterialsShareIdentityAndApplyEveryConfiguredScopeToSearchFindAndValidation() throws Exception {
        jdbc.execute("ALTER TABLE material ADD material_type_id BIGINT");
        jdbc.execute("CREATE TABLE material_type(id BIGINT,tenant_id VARCHAR,code VARCHAR,name VARCHAR,status VARCHAR)");
        jdbc.update("INSERT INTO material_type VALUES(10,'default','FG','产成品','ACTIVE'),(20,'default','SF','半成品','ACTIVE'),(30,'default','RAW','原料','ACTIVE'),(40,'other','SECRET','其他租户','ACTIVE'),(50,'default','OLD','停用类型','INACTIVE')");
        jdbc.update("UPDATE material SET material_type_id=CASE id WHEN 1 THEN 10 WHEN 2 THEN 20 WHEN 3 THEN 10 ELSE 30 END");
        var all = json("{\"sourceType\":\"material\",\"referenceMaterialScope\":\"all\"}");
        var product = json("{\"sourceType\":\"material\",\"referenceMaterialScope\":\"product\"}");
        var raw = json("{\"sourceType\":\"material\",\"referenceMaterialScope\":\"types\",\"referenceMaterialTypeIds\":[\"30\"]}");
        assertThat(lookup.search(all, "", null)).extracting(row -> row.get("id")).containsExactly("1", "2", "4");
        assertThat(lookup.search(product, "", null)).extracting(row -> row.get("id")).containsExactly("1", "2");
        assertThat(lookup.search(raw, "", null)).singleElement().satisfies(row -> assertThat(row).containsEntry("id", "4").containsEntry("sourceType", "material").containsEntry("materialTypeName", "原料"));
        assertThat(lookup.find(product, "4", null)).isNull();
        var selected = mapper.valueToTree(lookup.search(raw, "", null).getFirst());
        lookup.validate(raw, selected, null);
        assertThatThrownBy(() -> lookup.validate(product, selected, null)).hasMessageContaining("已失效");
        ((com.fasterxml.jackson.databind.node.ObjectNode) selected).put("materialTypeName", "伪造类型");
        assertThatThrownBy(() -> lookup.validate(raw, selected, null)).hasMessageContaining("已失效");
        assertThat(lookup.search(json("{\"sourceType\":\"material\",\"referenceMaterialScope\":\"all\",\"referenceSearchFields\":[\"materialTypeName\"]}"), "半成品", null)).singleElement().satisfies(row -> assertThat(row).containsEntry("id", "2"));
        assertThat(lookup.search(json("{\"sourceType\":\"material\",\"referenceMaterialScope\":\"all\",\"referenceQueryConditions\":[{\"sourceField\":\"materialTypeName\",\"targetFieldId\":\"selected\",\"operator\":\"eq\"}]}"), "", json("{\"selected\":{\"sourceType\":\"material\",\"id\":\"4\",\"name\":\"伪造显示\",\"materialTypeName\":\"伪造类型\"}}")))
                .singleElement().satisfies(row -> assertThat(row).containsEntry("id", "4"));
        assertThat(lookup.materialTypes()).extracting(row -> row.get("id")).containsExactlyInAnyOrder("10", "20", "30");
        assertThat(lookup.search(json("{\"sourceType\":\"material\"}"), "", null).getFirst()).doesNotContainKey("materialTypeName");
        for (String scope : java.util.List.of("\"bad\"", "null", "[]")) assertThatThrownBy(() -> lookup.search(json("{\"sourceType\":\"material\",\"referenceMaterialScope\":" + scope + "}"), "", null)).hasMessageContaining("范围");
        for (String ids : java.util.List.of("[]", "[\"30\",\"40\"]", "[\"50\"]", "[\"999\"]", "[\"30 OR 1=1\"]", "[30]", "[\"30\",\"30\"]"))
            assertThatThrownBy(() -> lookup.search(json("{\"sourceType\":\"material\",\"referenceMaterialScope\":\"types\",\"referenceMaterialTypeIds\":" + ids + "}"), "", null)).hasMessageContaining("物料类型");
        jdbc.update("UPDATE material SET material_type_id=NULL,name='原料' WHERE id=1");
        assertThat(lookup.search(json("{\"sourceType\":\"material\",\"referenceMaterialScope\":\"all\",\"referenceQueryConditions\":[{\"sourceField\":\"materialTypeName\",\"targetFieldId\":\"selected\",\"operator\":\"eq\"}]}"), "", json("{\"selected\":{\"sourceType\":\"material\",\"id\":\"1\",\"name\":\"原料\"}}"))).isEmpty();
    }

    @Test void unifiedProductionObjectsRetainActualTypeWithoutWideningScopeOrAcceptingForgedMetadata() throws Exception {
        jdbc.execute("CREATE TABLE work_order(id BIGINT,tenant_id VARCHAR,order_no VARCHAR,product_id BIGINT,status VARCHAR)");
        jdbc.execute("CREATE TABLE production_object(id BIGINT,tenant_id VARCHAR,work_order_id BIGINT,object_type VARCHAR,object_no VARCHAR,status VARCHAR)");
        jdbc.update("INSERT INTO work_order VALUES(10,'default','WO-A',1,'ACTIVE'),(20,'other','SECRET',2,'ACTIVE')");
        jdbc.update("INSERT INTO production_object VALUES(101,'default',10,'BATCH','B-A','ACTIVE'),(102,'default',10,'SN','SN-A','ACTIVE'),(103,'other',20,'BATCH','SECRET','ACTIVE'),(104,'default',20,'BATCH','CROSS','ACTIVE'),(105,'default',10,'UNKNOWN','UNKNOWN','ACTIVE')");
        var all = json("{\"sourceType\":\"productionObject\"}");
        var batch = json("{\"sourceType\":\"productionObject\",\"referenceProductionScope\":\"batch\"}");
        var sn = json("{\"sourceType\":\"productionObject\",\"referenceProductionScope\":\"sn\"}");
        assertThat(lookup.search(all, "", null)).extracting(row -> row.get("id")).containsExactly("101", "102");
        assertThat(lookup.search(batch, "", null)).singleElement().satisfies(row -> assertThat(row).containsEntry("objectType", "BATCH").containsEntry("objectTypeName", "批次").containsEntry("sourceType", "productionObject"));
        assertThat(lookup.search(sn, "", null)).singleElement().satisfies(row -> assertThat(row).containsEntry("objectType", "SN").containsEntry("objectTypeName", "SN"));
        var value = mapper.valueToTree(lookup.search(sn, "", null).getFirst());
        lookup.validate(all, value, null);
        assertThat(lookup.find(batch, "102", null)).isNull();
        assertThatThrownBy(() -> lookup.validate(batch, value, null)).hasMessageContaining("已失效");
        ((com.fasterxml.jackson.databind.node.ObjectNode) value).put("objectType", "BATCH");
        assertThatThrownBy(() -> lookup.validate(sn, value, null)).hasMessageContaining("已失效");
        assertThatThrownBy(() -> lookup.search(json("{\"sourceType\":\"productionObject\",\"referenceProductionScope\":\"invalid\"}"), "", null)).hasMessageContaining("范围");
        assertThat(lookup.search(json("{\"sourceType\":\"productionBatch\"}"), "", null).getFirst()).doesNotContainKey("objectType");
    }

    @Test void explicitDictionaryScopeIsSharedBySearchFindAndValidation() throws Exception {
        jdbc.execute("CREATE TABLE business_dictionary(id BIGINT,code VARCHAR,name VARCHAR,status VARCHAR)");
        jdbc.execute("CREATE TABLE business_dictionary_item(id BIGINT,dictionary_id BIGINT,label VARCHAR,\"VALUE\" VARCHAR,status VARCHAR)");
        jdbc.update("INSERT INTO business_dictionary VALUES(1,'UNIT','单位','ACTIVE'),(2,'SHIFT','班次','ACTIVE'),(3,'OLD','旧字典','DISABLED')");
        jdbc.update("INSERT INTO business_dictionary_item VALUES(11,1,'件','PCS','ACTIVE'),(12,1,'停用','OLD','DISABLED'),(21,2,'白班','DAY','ACTIVE'),(31,3,'旧','OLD','ACTIVE')");
        var config = json("{\"sourceType\":\"dictionary\",\"referenceDictionaryId\":\"1\"}");
        var selected = lookup.search(config, "", null);
        assertThat(selected).singleElement().satisfies(row -> assertThat(row).containsEntry("id", "11"));
        lookup.validate(config, mapper.valueToTree(selected.getFirst()), null);
        assertThat(lookup.find(config, "21", null)).isNull();
        assertThatThrownBy(() -> lookup.validate(config, json("{\"id\":\"21\",\"name\":\"白班\",\"code\":\"DAY\",\"sourceType\":\"dictionary\"}"), null)).hasMessageContaining("不符合查询条件");
        assertThat(lookup.search(json("{\"sourceType\":\"dictionary\",\"referenceDictionaryId\":\"3\"}"), "", null)).isEmpty();
        assertThatThrownBy(() -> lookup.search(json("{\"sourceType\":\"dictionary\",\"referenceDictionaryId\":\"\"}"), "", null)).hasMessageContaining("具体业务字典");
        assertThatThrownBy(() -> lookup.search(json("{\"sourceType\":\"dictionary\",\"referenceDictionaryId\":\"1 OR 1=1\"}"), "", null)).hasMessageContaining("具体业务字典");
        // Old frozen configurations without a scope keep their original interpretation.
        assertThat(lookup.search(json("{\"sourceType\":\"dictionary\"}"), "", null)).hasSize(2);
        assertThat(lookup.dictionaries("unit", null)).singleElement().satisfies(row -> assertThat(row).containsEntry("id", "1").containsEntry("name", "单位"));
        assertThat(lookup.dictionaries("", null)).hasSize(2);
        assertThat(lookup.dictionaries("%", null)).isEmpty();
        assertThat(lookup.dictionaries(null, "3")).singleElement().satisfies(row -> assertThat(row).containsEntry("status", "DISABLED"));
    }

    @Test void productionSourcesSeparateBatchesSnAndTenantsWhileRetainingTheirCanonicalNumber() throws Exception {
        jdbc.execute("CREATE TABLE work_order(id BIGINT,tenant_id VARCHAR,order_no VARCHAR,product_id BIGINT,status VARCHAR)");
        jdbc.execute("CREATE TABLE production_object(id BIGINT,tenant_id VARCHAR,work_order_id BIGINT,object_type VARCHAR,object_no VARCHAR,status VARCHAR)");
        jdbc.execute("CREATE TABLE operation(id BIGINT,tenant_id VARCHAR,code VARCHAR,name VARCHAR)");
        jdbc.update("INSERT INTO work_order(id,tenant_id,order_no,product_id) VALUES(10,'default','WO-A',1),(20,'other','SECRET',2)");
        jdbc.update("INSERT INTO production_object(id,tenant_id,work_order_id,object_type,object_no) VALUES(101,'default',10,'BATCH','B-A'),(102,'default',10,'SN','SN-A'),(103,'other',20,'BATCH','SECRET'),(104,'default',20,'BATCH','CROSS-TENANT')");
        jdbc.update("INSERT INTO operation VALUES(30,'default','OP-A','加工'),(31,'other','SECRET','其他租户')");
        var batchConfig = json("{\"sourceType\":\"productionBatch\",\"referenceField\":\"workOrderNo\"}");
        assertThat(lookup.search(batchConfig, "B-A", null)).singleElement().satisfies(row -> assertThat(row).containsAllEntriesOf(java.util.Map.of("id", "101", "name", "WO-A", "code", "B-A", "sourceType", "productionBatch")));
        assertThat(lookup.search(json("{\"sourceType\":\"productionBatch\"}"), "", null)).hasSize(1);
        assertThat(lookup.search(json("{\"sourceType\":\"serialNumber\"}"), "", null)).singleElement().satisfies(row -> assertThat(row).containsEntry("code", "SN-A"));
        assertThat(lookup.search(json("{\"sourceType\":\"workOrder\"}"), "", null)).singleElement().satisfies(row -> assertThat(row).containsEntry("code", "WO-A"));
        assertThat(lookup.search(json("{\"sourceType\":\"operation\"}"), "", null)).singleElement().satisfies(row -> assertThat(row).containsEntry("name", "加工").containsEntry("code", "OP-A"));
        lookup.validate(batchConfig, json("{\"id\":\"101\",\"name\":\"WO-A\",\"code\":\"B-A\",\"sourceType\":\"productionBatch\"}"), null);
    }

    @Test void rejectsForgedMetadataButKeepsLegacyReferenceValues() throws Exception {
        var config = json("{\"sourceType\":\"material\"}");
        lookup.validate(config, json("{\"id\":\"1\",\"name\":\"导管\"}"), null);
        lookup.validate(config, json("{\"id\":\"1\",\"name\":\"导管\",\"sourceType\":\"material\",\"code\":\"M01\"}"), null);
        assertThatThrownBy(() -> lookup.validate(config, json("{\"id\":\"1\",\"name\":\"导管\",\"sourceType\":\"equipment\",\"code\":\"M01\"}"), null)).hasMessageContaining("类型或编号");
        assertThatThrownBy(() -> lookup.validate(config, json("{\"id\":\"1\",\"name\":\"导管\",\"sourceType\":\"material\",\"code\":\"FAKE\"}"), null)).hasMessageContaining("已失效");
        assertThatThrownBy(() -> lookup.validate(config, json("{\"id\":\"1\",\"name\":\"导管\",\"code\":\"M01\"}"), null)).hasMessageContaining("类型或编号");
    }

    @Test void orderedDisplayAttributesDoNotChangeSearchOrCanonicalIdentity() throws Exception {
        var config = json("""
            {"sourceType":"material","referenceField":"code","referenceDisplayFields":["specification","code","name"],"referenceSearchFields":["specification"]}
            """);
        assertThat(lookup.search(config, "M02", null)).isEmpty();
        var selected = lookup.search(config, "B", null).getFirst();
        assertThat(selected).containsEntry("id", "2").containsEntry("name", "接头").containsEntry("code", "M02").containsEntry("specification", "B");
        lookup.validate(config, mapper.valueToTree(selected), null);
        var forged = mapper.valueToTree(selected);
        ((com.fasterxml.jackson.databind.node.ObjectNode) forged).put("specification", "伪造规格");
        assertThatThrownBy(() -> lookup.validate(config, forged, null)).hasMessageContaining("已失效");
        assertThatThrownBy(() -> lookup.search(json("{\"sourceType\":\"material\",\"referenceDisplayFields\":[\"name\",\"name\"]}"), "", null)).hasMessageContaining("不能重复");
        assertThatThrownBy(() -> lookup.search(json("{\"sourceType\":\"material\",\"referenceSearchFields\":[\"name); DROP TABLE material\"]}"), "", null)).hasMessageContaining("不支持");
    }

    @Test void conditionsUseRawSelectedAttributeInsteadOfFormattedLabel() throws Exception {
        var values = json("{\"spec\":{\"id\":\"9\",\"name\":\"别的名称\",\"label\":\"M02[接头][B]\",\"specification\":\"B\"}}");
        assertThat(lookup.search(conditional("eq"), "", values)).singleElement().satisfies(row -> assertThat(row).containsEntry("id", "2"));
        var typed = json("{\"spec\":{\"id\":\"2\",\"sourceType\":\"material\",\"name\":\"接头[别的展示]\",\"specification\":\"伪造\"}}");
        assertThat(lookup.search(conditional("eq"), "", typed)).singleElement().satisfies(row -> assertThat(row).containsEntry("id", "2"));
    }

    @Test void paginatedSelectionCanReachRecordsBeyondLegacyHundredLimit() throws Exception {
        for (int i = 5; i <= 150; i++) jdbc.update("INSERT INTO material(id,code,name,status) VALUES(?,?,?,'ACTIVE')", i, "M" + i, "同名");
        var config = json("{\"sourceType\":\"material\"}");
        assertThat(lookup.search(config, "", null)).hasSize(100);
        assertThat(lookup.search(config, "", null, 0, 20)).hasSize(21);
        assertThat(lookup.search(config, "", null, 5, 20)).hasSize(21).first().satisfies(row -> assertThat(row).containsEntry("id", "102"));
        assertThat(lookup.search(config, "", null, 7, 20)).hasSize(9).last().satisfies(row -> assertThat(row).containsEntry("id", "150"));
    }

    @Test void reasonSourcesKeepTypeTenantAndActiveStatusSeparate() throws Exception {
        jdbc.execute("CREATE TABLE quality_reason(id BIGINT,tenant_id VARCHAR,reason_type VARCHAR,code VARCHAR,name VARCHAR,description VARCHAR,status VARCHAR)");
        jdbc.update("INSERT INTO quality_reason VALUES(1,'default','DEFECT','D01','划伤','表面划伤','ACTIVE'),(2,'default','SCRAP','S01','破损','报废说明','ACTIVE'),(3,'default','DEFECT','D02','停用','','INACTIVE'),(4,'other','DEFECT','D03','其他租户','','ACTIVE')");
        var defect = json("{\"sourceType\":\"defectReason\",\"referenceDisplayFields\":[\"code\",\"name\",\"description\"]}");
        assertThat(lookup.search(defect, "", null)).singleElement().satisfies(row -> assertThat(row).containsEntry("id", "1").containsEntry("description", "表面划伤"));
        assertThat(lookup.search(json("{\"sourceType\":\"scrapReason\"}"), "", null)).singleElement().satisfies(row -> assertThat(row).containsEntry("id", "2"));
        assertThatThrownBy(() -> lookup.validate(defect, json("{\"id\":\"2\",\"name\":\"破损\",\"code\":\"S01\",\"sourceType\":\"defectReason\"}"), null)).hasMessageContaining("已失效");
        JsonNode selected = mapper.valueToTree(lookup.search(defect, "", null).getFirst());
        jdbc.update("UPDATE quality_reason SET status='INACTIVE',name='更名' WHERE id=1");
        assertThat(lookup.search(defect, "", null)).isEmpty();
        lookup.validate(defect, selected, null, selected.deepCopy());
        assertThatThrownBy(() -> lookup.validate(defect, selected, null)).hasMessageContaining("已失效");
        assertThatThrownBy(() -> lookup.validate(defect, selected, null, json("{\"id\":\"99\",\"name\":\"未选过\",\"code\":\"D01\",\"sourceType\":\"defectReason\"}"))).hasMessageContaining("已失效");
        jdbc.update("DELETE FROM quality_reason WHERE id=1");
        assertThatThrownBy(() -> lookup.validate(defect, selected, null, selected.deepCopy())).hasMessageContaining("已失效");
    }

    @Test void personnelOptionsIncludeDepartmentDisambiguationWithoutExtraUserDirectoryPermission() throws Exception {
        jdbc.execute("CREATE TABLE user_account(id BIGINT,username VARCHAR,display_name VARCHAR,phone VARCHAR,email VARCHAR,status VARCHAR)");
        jdbc.execute("CREATE TABLE user_department(user_id BIGINT,department_id BIGINT)");
        jdbc.execute("CREATE TABLE department(id BIGINT,name VARCHAR)");
        jdbc.update("INSERT INTO user_account VALUES(10,'zhang01','张三','123','z@example.com','ACTIVE'),(20,'old','停用','','','INACTIVE')");
        jdbc.update("INSERT INTO department VALUES(1,'生产部'),(2,'质量部')");
        jdbc.update("INSERT INTO user_department VALUES(10,1),(10,2)");
        var config = json("{\"sourceType\":\"user\",\"referenceSearchFields\":[\"phone\"]}");
        assertThat(lookup.search(config, "zhang01", null)).isEmpty();
        assertThat(lookup.search(config, "123", null)).singleElement().satisfies(row -> {
            assertThat(row).containsEntry("id", "10").containsEntry("code", "zhang01").containsEntry("name", "张三");
            assertThat(row.get("departmentIds").split(",")).containsExactlyInAnyOrder("1", "2");
            assertThat(row.get("departmentName")).contains("生产部", "质量部");
        });
    }
}
