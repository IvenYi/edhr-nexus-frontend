package com.zencas.edhr.identity.security;

import com.zencas.edhr.identity.entity.Role;
import com.zencas.edhr.identity.entity.UserAccount;
import com.zencas.edhr.identity.repository.RoleRepository;
import com.zencas.edhr.identity.repository.UserAccountRepository;
import com.zencas.edhr.identity.repository.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserAccountRepository userAccountRepository;
    private final UserRoleRepository userRoleRepository;
    private final RoleRepository roleRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UserAccount account = userAccountRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("用户不存在: " + username));

        if ("DISABLED".equals(account.getStatus())) {
            return new User(account.getUsername(), account.getPasswordHash(),
                    false, true, true, true, Collections.emptyList());
        }

        return new User(account.getUsername(), account.getPasswordHash(),
                true, true, true, true, Collections.emptyList());
    }
}
