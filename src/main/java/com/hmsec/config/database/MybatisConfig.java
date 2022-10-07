package com.hmsec.config.database;

import org.apache.ibatis.io.Resources;
import org.apache.ibatis.mapping.VendorDatabaseIdProvider;
import org.apache.ibatis.session.Configuration;
import lombok.extern.slf4j.Slf4j;
import org.apache.ibatis.session.SqlSessionFactory;
import org.apache.ibatis.type.Alias;
import org.apache.ibatis.type.TypeAliasRegistry;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.mybatis.spring.SqlSessionTemplate;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.core.io.support.ResourcePatternResolver;
import org.springframework.core.type.ClassMetadata;
import org.springframework.core.type.classreading.CachingMetadataReaderFactory;
import org.springframework.core.type.classreading.MetadataReaderFactory;
import org.springframework.util.ClassUtils;
import org.springframework.util.StringUtils;

import javax.sql.DataSource;
import java.io.IOException;
import java.util.HashSet;
import java.util.Objects;
import java.util.Properties;
import java.util.Set;


@Slf4j
@org.springframework.context.annotation.Configuration
public class MybatisConfig extends Configuration {
    private static final ResourcePatternResolver RESOURCE_PATTERN_RESOLVER = new PathMatchingResourcePatternResolver();
    private static final MetadataReaderFactory METADATA_READER_FACTORY = new CachingMetadataReaderFactory();

    @Bean
    public SqlSessionFactory sqlSessionFactory(DataSource datasource, ApplicationContext applicationContext,
                                               VendorDatabaseIdProvider vendorDatabaseIdProvider) throws Exception {

        SqlSessionFactoryBean sqlSessionFactory = new SqlSessionFactoryBean();
        sqlSessionFactory.setDataSource(datasource);
        sqlSessionFactory.setConfiguration(new MybatisConfig());
        sqlSessionFactory.setDatabaseIdProvider(vendorDatabaseIdProvider);
        sqlSessionFactory.setMapperLocations(applicationContext.getResources("classpath*:/mapper/**/*.xml"));

        return sqlSessionFactory.getObject();
    }

    @Bean
    public SqlSessionTemplate sqlSession(SqlSessionFactory sqlSessionFactory) {
        return new SqlSessionTemplate(sqlSessionFactory);
    }

    public MybatisConfig() throws IOException {
        /*
        this.setCacheEnabled(true); // mybatis cache 사용여부
        this.setLazyLoadingEnabled(true); // 지연로딩 사용여부
        this.setMultipleResultSetsEnabled(true); // 한 개의 구문에서 여러 개의 ResultSet을 허용할지 여부
        this.setUseColumnLabel(true); // 컬럼명 대신 컬럼 라벨을 사용
        this.setUseGeneratedKeys(true); // 생성키에 대한 JDBC 지원 허용 여부
        this.setAutoMappingBehavior(PARTIAL); // mybatis가 컬럼을 필드/프로퍼티에 자동으로 매핑할지와 방법에 대한 명시(PARTIAL은 중첩되지 않은 것들을 매핑
        this.setDefaultExecutorType(SIMPLE); // 디폴트 Executor 설정(SIMPLE은 특별히 동작하는 것은 업음)
        this.setDefaultStatementTimeout(10); // DB 응답 타임아웃 설정
        this.setSafeRowBoundsEnabled(false); // 중첩구문내 RowBound 사용 허용여부
        this.setLocalCacheScope(SESSION); // 로컬캐시 사용여부(SESSION: 세션을 사용해서 모든쿼리를 캐시)
        this.setJdbcTypeForNull(null); // mybatis로 넘어오는 parameter가 null인 경우, jdbcType을 Setting
        this.setLazyLoadTriggerMethods(new HashSet<>(Arrays.asList("equals", "clone", "hashCode", "toString"))); // 지연로딩을 야기하는 객체의 메소드를 명시
        this.setCallSettersOnNulls(true); // 가져온 값이 null일때 setter나 맵의 put 메소드를 호출할지를 명시 (false일경우, null인 field는 제거되어 나타남 : default는 false
        */

        this.setMapUnderscoreToCamelCase(true); // 전통적 DB 컴럼명을 JAVA의 Camel표기법으로 자동 매핑 설정


        this.typeAliasesScan("com.hmsec", null); // @Alias 설정된 클래스들을 typeAlias로 등록함
    }

    public void typeAliasesScan(String typeAliasesPackage, Class<?> typeAliasesSuperType) throws IOException {
        if (StringUtils.hasLength(typeAliasesPackage)) {
            TypeAliasRegistry typeAliasRegistry = this.getTypeAliasRegistry();
            Objects.requireNonNull(typeAliasRegistry);

            scanClasses(typeAliasesPackage, typeAliasesSuperType).stream()
                    .filter((clazz) -> clazz.getAnnotation(Alias.class) != null)
                    .filter((clazz) -> !clazz.isAnonymousClass())
                    .filter((clazz) -> !clazz.isInterface())
                    .filter((clazz) -> !clazz.isMemberClass())
                    .forEach(typeAliasRegistry::registerAlias);
        }
    }

    private Set<Class<?>> scanClasses(String packagePatterns, Class<?> assignableType) throws IOException {
        Set<Class<?>> classes = new HashSet<>();
        String[] packagePatternArray = StringUtils.tokenizeToStringArray(packagePatterns, ",; \t\n");

        for (String packagePattern : packagePatternArray) {
            Resource[] resources = RESOURCE_PATTERN_RESOLVER.getResources("classpath*:" + ClassUtils.convertClassNameToResourcePath(packagePattern) + "/**/*.class");

            for (Resource resource : resources) {
                try {
                    ClassMetadata classMetadata = METADATA_READER_FACTORY.getMetadataReader(resource).getClassMetadata();
                    Class<?> clazz = Resources.classForName(classMetadata.getClassName());
                    if (clazz.getAnnotation(Alias.class) != null && (assignableType == null || assignableType.isAssignableFrom(clazz))) {
                        classes.add(clazz);
                    }
                } catch (Throwable ex) {
                    log.warn("Cannot load the '" + resource + "'. Cause by " + ex.toString());
                }
            }
        }

        return classes;
    }

    @Bean
    public VendorDatabaseIdProvider vendorDatabaseIdProvider() {
        VendorDatabaseIdProvider databaseIdProvider = new VendorDatabaseIdProvider();
        Properties properties = new Properties();
        properties.put("Oracle","oracle");
        properties.put("MySQL","mysql");
        properties.put("MariaDB","mysql");
        properties.put("SQL Server","sqlserver");
        databaseIdProvider.setProperties(properties);
        return databaseIdProvider;
    }


}
