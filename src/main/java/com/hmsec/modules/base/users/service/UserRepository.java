package com.hmsec.modules.base.users.service;


import com.hmsec.modules.base.users.model.AppManager;
import com.hmsec.modules.base.users.model.AppUser;
import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;

@Mapper
@Repository
public interface UserRepository {
    //로그인 전용으로 password 정보를 포함한다.
    AppManager findByUserIdForLogin(String userId);

    int insert(AppUser appUser);

    int resetPassword(Integer empNo, String psswd, LocalDateTime psswdUpdDt);

    int resetPasswordCnt(Integer empNo);

    int plusPasswordCnt(AppUser appUser);

    String checkEmail(String email);

    void changePasswd(AppUser appUser);

    AppUser findByUserId(String userId);

    AppUser findByUserEmail(String email);

    int update(AppUser appUser);

    AppUser findByUserNo(Integer userNo);

    void confirm(AppUser appUser);

    List<HashMap<String, String>> findAll();

}
