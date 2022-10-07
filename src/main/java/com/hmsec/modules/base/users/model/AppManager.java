package com.hmsec.modules.base.users.model;

import lombok.Data;
import lombok.EqualsAndHashCode;
import org.apache.ibatis.type.Alias;

@EqualsAndHashCode(callSuper = true)
@Alias("AppManager")
@Data
public class AppManager extends AppUser {
    public int getMngrNo(){
        return super.getUserNo();
    }
}
