package com.hmsec.config.database;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.datasource.LazyConnectionDataSourceProxy;
import org.springframework.jdbc.datasource.lookup.JndiDataSourceLookup;

import javax.sql.DataSource;
import java.sql.SQLException;

@Configuration
@Slf4j
public class DatabaseConfig {

    @Bean("hikariConfig")
    @Primary
    @ConfigurationProperties(prefix = "spring.datasource.default")
    public HikariConfig hikariConfig() {
        return new HikariConfig();

/*        HikariConfig config = new HikariConfig();
        JndiDataSourceLookup dataSourceLookup = new JndiDataSourceLookup();
        dataSourceLookup.setResourceRef(true);
        config.setDataSource(dataSourceLookup.getDataSource("jndi/mysql"));
        config.setDriverClassName("org.mariadb.jdbc.MySQLDataSource");
        config.setAutoCommit(true);*/


    }


    @Bean(name = "dataSource")
    @Primary
    public DataSource datasource() throws SQLException {

        HikariDataSource dataSource = new HikariDataSource(hikariConfig());

        log.info("spring.datasource.groupware config : {}", dataSource);
        log.info("connectionTestQuery:{}", dataSource.getConnectionTestQuery());
        log.info("connectionTimeout:{}", dataSource.getConnectionTimeout());
        log.info("maximumPoolSize:{}", dataSource.getMaximumPoolSize());
        log.info("maxLifetime:{}", dataSource.getMaxLifetime());
        log.info("minimumIdle:{}", dataSource.getMinimumIdle());
        log.info("idleTimeout:{}", dataSource.getIdleTimeout());

        return new LazyConnectionDataSourceProxy(dataSource);

    }




}
