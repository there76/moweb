package com.hmsec;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FullyQualifiedAnnotationBeanNameGenerator;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableCaching
@EnableAsync
@ComponentScan(basePackages = {"com.hmsec"}, nameGenerator = FullyQualifiedAnnotationBeanNameGenerator.class)
public class MowebApplication {

    public static void main(String[] args) {
        SpringApplication.run(MowebApplication.class, args);
    }

}
