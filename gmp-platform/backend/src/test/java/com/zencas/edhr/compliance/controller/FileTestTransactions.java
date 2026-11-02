package com.zencas.edhr.compliance.controller;

import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.transaction.PlatformTransactionManager;

/** Real lightweight transaction lifecycle for direct/mock-repository controller regressions. */
final class FileTestTransactions {
    private FileTestTransactions() {}
    static PlatformTransactionManager manager() {
        return new DataSourceTransactionManager(new DriverManagerDataSource("jdbc:h2:mem:file-unit-transactions", "sa", ""));
    }
}
