package com.zencas.edhr.identity.controller;

import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.identity.entity.UserAccount;
import com.zencas.edhr.identity.repository.UserAccountRepository;
import com.zencas.edhr.identity.repository.UserDepartmentRepository;
import com.zencas.edhr.identity.repository.UserRoleRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    @Mock private UserAccountRepository userAccountRepository;
    @Mock private UserRoleRepository userRoleRepository;
    @Mock private UserDepartmentRepository userDepartmentRepository;
    @Mock private SnowflakeIdGenerator idGenerator;
    @Mock private PasswordEncoder passwordEncoder;

    @InjectMocks private UserController controller;

    @Test
    void resetPasswordEncodesTheNewPasswordAndSavesTheUser() {
        UserAccount user = UserAccount.builder()
                .id(1L)
                .username("operator")
                .displayName("生产操作员")
                .passwordHash("old-hash")
                .status("ACTIVE")
                .build();
        when(userAccountRepository.findById(1L)).thenReturn(Optional.of(user));
        when(passwordEncoder.encode("NewPass@123")).thenReturn("encoded-password");

        controller.resetPassword(1L, new UserController.ResetPasswordRequest("NewPass@123"));

        assertThat(user.getPasswordHash()).isEqualTo("encoded-password");
        verify(userAccountRepository).save(user);
    }
}
