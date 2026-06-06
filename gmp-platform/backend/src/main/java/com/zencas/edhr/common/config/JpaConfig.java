package com.zencas.edhr.common.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/** JPA configuration with auditing support. */
@Configuration
@EnableJpaAuditing
public class JpaConfig {
}
