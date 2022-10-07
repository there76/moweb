package com.hmsec.modules.base.users.service.handler;


import com.hmsec.modules.base.users.model.AppUser;
import com.hmsec.modules.base.users.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@RequiredArgsConstructor
@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    private final UserService userService;

    @Override
    public UserDetails loadUserByUsername(String userId) throws UsernameNotFoundException {
        AppUser appUser = userService.getUserForLogin(userId);
        if (appUser == null) {
            throw new UsernameNotFoundException(userId);
        }

        //spring security authorities
        List<GrantedAuthority> authorities = new ArrayList<>();
        if (appUser.getAuthorities() != null) {
            authorities.addAll(appUser.getAuthorities());
        }

        authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
        if(appUser.getUserTp() == AppUser.UserTp.ADMIN){
            authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
        }

        appUser.setAuthorities(authorities);

        return appUser;
    }
}
