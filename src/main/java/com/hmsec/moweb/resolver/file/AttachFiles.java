package com.hmsec.moweb.resolver.file;

import com.hmsec.common.file.model.AttachDivCd;

import java.lang.annotation.*;

@Target({ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface AttachFiles {

    String name() default "file";

    AttachDivCd attachDivCd() default AttachDivCd.ETC;

    String workType() default "INSERT";

    String attachDivCdParamName() default "";

    String dscParamName() default "";
}
