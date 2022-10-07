package com.hmsec.modules.base.users.service;


import com.hmsec.modules.base.users.model.AppUser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;

@RequiredArgsConstructor
@Slf4j
@Service
@Transactional
public class UserService {
    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public AppUser getUserForLogin(String userId) {
        return userRepository.findByUserIdForLogin(userId);
    }

    public int insert(AppUser appUser) {
        if (appUser.getPassword() == null) {
            appUser.setPassword(appUser.getUsername());
        }

        String password = passwordEncoder.encode(appUser.getPassword());
        appUser.setPassword(password);
        return userRepository.insert(appUser);
    }

    public int resetUserPassword(Integer empNo, String password) {
        String encPassword = passwordEncoder.encode(password);
        LocalDateTime now = LocalDateTime.now();
        return userRepository.resetPassword(empNo, encPassword, now);
    }

    public String checkEmail(String email) {
        return userRepository.checkEmail(email);
    }

    public void changePasswd(AppUser appUser) {
        String encPassword = passwordEncoder.encode(appUser.getPassword());
        appUser.setPassword(encPassword);
        userRepository.changePasswd(appUser);
    }


    public AppUser findByUserId(String userId) {
        return userRepository.findByUserId(userId);
    }

    public AppUser findByUserEmail(String email) {
        return userRepository.findByUserEmail(email);
    }

    public int update(AppUser appUser) {

        if (appUser.getPassword() != null) {
            String password = passwordEncoder.encode(appUser.getPassword());
            appUser.setPassword(password);
        }

        return userRepository.update(appUser);

    }

    public AppUser findByUserNo(Integer userNo) {
        return userRepository.findByUserNo(userNo);
    }

    public void confirm(AppUser appUser) {
        userRepository.confirm(appUser);
    }

    public List<HashMap<String,String>> findAll() {
        return userRepository.findAll();
    }

}
