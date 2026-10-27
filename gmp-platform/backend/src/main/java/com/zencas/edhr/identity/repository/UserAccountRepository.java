package com.zencas.edhr.identity.repository;

import com.zencas.edhr.identity.entity.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserAccountRepository extends JpaRepository<UserAccount, Long>, JpaSpecificationExecutor<UserAccount> {
    Optional<UserAccount> findByUsername(String username);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select account from UserAccount account where account.username = :username")
    Optional<UserAccount> findByUsernameForUpdate(@Param("username") String username);
    List<UserAccount> findByEmailIsNotNull();
    boolean existsByUsername(String username);
    boolean existsByAvatarFileId(Long avatarFileId);
}
