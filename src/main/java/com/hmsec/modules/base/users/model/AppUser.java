package com.hmsec.modules.base.users.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import org.apache.ibatis.type.Alias;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

@Alias("AppUser")
@Data
public class AppUser implements UserDetails {
    @JsonIgnore
    private Collection<? extends GrantedAuthority> authorities;
    private Set<String> rolesSet;

    Integer userNo;
    UserTp userTp;
    String userId;

    @JsonIgnore
    String userPw;
    String userKey;
    String userNm;
    String phone;
    String email;
    String zipCd;
    String addr;
    String addr2;

    @JsonIgnore
    Integer pwErrCnt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    LocalDateTime pwUpdDt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    LocalDateTime regDt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    LocalDateTime updDt;

    UserStat stat;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    LocalDateTime statDt;

    String cmpnyNm;

    @JsonIgnore
    private String requestIp;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    public void setAuthorities(Collection<? extends GrantedAuthority> authorities) {
        if (authorities != null) {
            this.authorities = authorities;
            this.rolesSet = new HashSet<>();
            new ArrayList<GrantedAuthority>(authorities).forEach(grantedAuthority -> rolesSet.add(grantedAuthority.getAuthority()));
        }
    }

    public boolean hasAnyRole(String... roles) {
        if (rolesSet == null) {
            return false;
        }

        for (String role : roles) {
            if (rolesSet.contains("ROLE_" + role) || rolesSet.contains(role)) {
                return true;
            }
        }
        return false;
    }

    @JsonIgnore
    @Override
    public String getPassword() {
        return userPw;
    }

    public void setPassword(String password){
        this.userPw = password;
    }

    @Override
    public String getUsername() {
        return userId;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    public int getCmpnyNo() {
        return 1;
    }


    public enum UserTp {
        USER("회원 사용자"),
        ANONYMOUS("미회원 사용자"),
        ADMIN("어드민");

        private final String label;

        UserTp(String label) {
            this.label = label;
        }

        public String getLabel() {
            return this.label;
        }
    }

    public enum UserStat {
        UN_CONFIRM("확인"),
        JOINED("가입"),
        WITHDRAWAL("탈퇴");

        private final String label;

        UserStat(String label) {
            this.label = label;
        }

        public String getLabel() {
            return this.label;
        }
    }

    public String getUserTpNm() {
        return this.userTp == null ? "" : this.userTp.getLabel();
    }

    public String getStatNm() {
        return this.stat == null ? "" : this.stat.getLabel();
    }
}
