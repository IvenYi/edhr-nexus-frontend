package com.zencas.edhr.masterdata.repository;

import com.zencas.edhr.masterdata.entity.ProductFamilyMember;
import com.zencas.edhr.masterdata.entity.ProductProcess;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Import;
import org.springframework.core.io.ClassPathResource;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.InvalidDataAccessApiUsageException;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import java.util.List;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DataJpaTest(properties = {
        "spring.liquibase.enabled=false",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.url=jdbc:h2:mem:product-family-member;MODE=PostgreSQL;DB_CLOSE_DELAY=-1"
})
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(ProductFamilyMemberRepositoryTest.JpaConfiguration.class)
class ProductFamilyMemberRepositoryTest {

    @Autowired
    private ProductFamilyMemberRepository productFamilyMemberRepository;

    @Autowired
    private ProductProcessRepository productProcessRepository;

    @Test
    void findsMembershipByProductAndListsMembersForFamilyWithinTenant() {
        productFamilyMemberRepository.saveAll(List.of(
                member(101L, "tenant-a", 11L, 1001L, LocalDateTime.of(2026, 8, 11, 10, 0)),
                member(102L, "tenant-a", 11L, 1002L, LocalDateTime.of(2026, 8, 11, 11, 0)),
                member(103L, "tenant-b", 12L, 1001L, LocalDateTime.of(2026, 8, 11, 12, 0))
        ));

        assertThat(productFamilyMemberRepository.findByTenantIdAndProductId("tenant-a", 1001L))
                .hasValueSatisfying(member -> assertThat(member.getProductFamilyId()).isEqualTo(11L));
        assertThat(productFamilyMemberRepository.findByTenantIdAndProductFamilyIdOrderByCreatedAtDesc("tenant-a", 11L))
                .extracting(ProductFamilyMember::getProductId)
                .containsExactly(1002L, 1001L);
    }

    @Test
    void rejectsAssigningOneProductToTwoFamiliesWithinTheSameTenant() {
        productFamilyMemberRepository.saveAndFlush(member(101L, "tenant-a", 11L, 1001L, LocalDateTime.of(2026, 8, 11, 10, 0)));

        assertThatThrownBy(() -> productFamilyMemberRepository.saveAndFlush(member(102L, "tenant-a", 12L, 1001L, LocalDateTime.of(2026, 8, 11, 11, 0))))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void supportsLegacyProductLookupAndProductFamilyProcessOwnerLookup() {
        ProductProcess legacyProductProcess = productProcessRepository.saveAndFlush(ProductProcess.builder()
                .id(201L)
                .tenantId("tenant-a")
                .productVersionId(1001L)
                .build());
        ProductProcess familyProcess = productProcessRepository.saveAndFlush(ProductProcess.builder()
                .id(202L)
                .tenantId("tenant-a")
                .ownerType("PRODUCT_FAMILY")
                .ownerId(11L)
                .build());

        assertThat(productProcessRepository.findByTenantIdAndProductVersionId("tenant-a", 1001L))
                .contains(legacyProductProcess);
        assertThat(productProcessRepository.findByTenantIdAndOwnerTypeAndOwnerId("tenant-a", "PRODUCT_FAMILY", 11L))
                .contains(familyProcess);
        assertThat(familyProcess.getProductVersionId()).isNull();

        assertThatThrownBy(() -> productProcessRepository.saveAndFlush(ProductProcess.builder()
                .id(203L)
                .tenantId("tenant-a")
                .ownerType("PRODUCT_FAMILY")
                .ownerId(11L)
                .build()))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void rejectsUnsupportedProcessOwnerType() {
        assertThatThrownBy(() -> productProcessRepository.saveAndFlush(ProductProcess.builder()
                .id(204L)
                .tenantId("tenant-a")
                .ownerType("MATERIAL")
                .ownerId(1002L)
                .productVersionId(1002L)
                .build()))
                .isInstanceOf(InvalidDataAccessApiUsageException.class)
                .hasMessage("Invalid owner type");
    }

    @Test
    void rejectsProductFamilyOwnerWithProductVersion() {
        assertThatThrownBy(() -> productProcessRepository.saveAndFlush(ProductProcess.builder()
                .id(205L)
                .tenantId("tenant-a")
                .ownerType("PRODUCT_FAMILY")
                .ownerId(11L)
                .productVersionId(1001L)
                .build()))
                .isInstanceOf(InvalidDataAccessApiUsageException.class)
                .hasMessage("Product family owner cannot have product version");
    }

    @Test
    void migrationDefinesMemberForeignKeysAndCompatibleOwnerConstraints() throws IOException {
        String master = readResource("db/changelog/db.changelog-master.yaml");
        String migration = readResource("db/changelog/0053-product-family-process-owner.sql");
        String normalizedMigration = migration.replaceAll("\\s+", " ");

        assertThat(master).contains("0053-product-family-process-owner.sql");
        assertThat(normalizedMigration).contains("CREATE TABLE IF NOT EXISTS product_family_member");
        assertThat(normalizedMigration).contains("FOREIGN KEY (product_family_id) REFERENCES product_family(id)");
        assertThat(normalizedMigration).contains("FOREIGN KEY (product_id) REFERENCES material(id)");
        assertThat(normalizedMigration).contains("uk_product_family_member_tenant_family_product");
        assertThat(normalizedMigration).contains("uk_product_family_member_tenant_product");
        assertThat(normalizedMigration).contains("ADD COLUMN IF NOT EXISTS owner_type VARCHAR(32)");
        assertThat(normalizedMigration).contains("SET owner_type = 'PRODUCT'");
        assertThat(normalizedMigration).contains("ALTER COLUMN owner_type SET NOT NULL");
        assertThat(normalizedMigration).contains("ALTER COLUMN owner_id SET NOT NULL");
        assertThat(normalizedMigration).contains("ALTER COLUMN product_version_id DROP NOT NULL");
        assertThat(normalizedMigration).contains("uk_product_process_owner");
        assertThat(normalizedMigration).contains("ck_product_process_owner_type");
        assertThat(normalizedMigration).contains("CHECK (owner_type IN ('PRODUCT', 'PRODUCT_FAMILY'))");
        assertThat(normalizedMigration).contains("--changeset edhr:0053-product-process-owner-type-check splitStatements:false");
        assertThat(normalizedMigration).doesNotContain("endDelimiter:$$");
        assertThat(normalizedMigration).contains("DO $$ BEGIN");
        assertThat(normalizedMigration).contains("END; $$;");
    }

    private ProductFamilyMember member(Long id, String tenantId, Long productFamilyId, Long productId, LocalDateTime createdAt) {
        return ProductFamilyMember.builder()
                .id(id)
                .tenantId(tenantId)
                .productFamilyId(productFamilyId)
                .productId(productId)
                .createdAt(createdAt)
                .build();
    }

    private String readResource(String path) throws IOException {
        return new String(new ClassPathResource(path).getInputStream().readAllBytes(), StandardCharsets.UTF_8);
    }

    @TestConfiguration(proxyBeanMethods = false)
    @EntityScan(basePackageClasses = {ProductFamilyMember.class, ProductProcess.class})
    @EnableJpaRepositories(basePackageClasses = {ProductFamilyMemberRepository.class, ProductProcessRepository.class})
    static class JpaConfiguration {
    }
}
