package com.zencas.edhr.identity.repository;

import com.zencas.edhr.identity.entity.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserAccountRepository extends JpaRepository<UserAccount, Long>, JpaSpecificationExecutor<UserAccount> {
    Optional<UserAccount> findByUsername(String username);
    List<UserAccount> findByEmailIsNotNull();
    boolean existsByUsername(String username);
    boolean existsByAvatarFileId(Long avatarFileId);
}
