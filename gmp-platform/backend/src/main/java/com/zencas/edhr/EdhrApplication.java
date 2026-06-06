package com.zencas.edhr;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

/** eDHR Application entry point. */
@SpringBootApplication
@EnableAsync
public class EdhrApplication {

    public static void main(String[] args) {
        SpringApplication.run(EdhrApplication.class, args);
    }
}
