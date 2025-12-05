package com.app.jiraLite.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.app.jiraLite.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long>  {
    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    // Use this in your UserDetailsService to load user + roles in one query
    @Query("select u from User u left join fetch u.roles where u.username = :username")
    Optional<User> findByUsernameWithRoles(@Param("username") String username);
    
 // inside UserRepository
    @Query(
      value = "select u from Issue i join i.watchers u where i.id = :issueId",
      countQuery = "select count(u) from Issue i join i.watchers u where i.id = :issueId"
    )
    Page<User> findWatchersByIssueId(@Param("issueId") Long issueId, Pageable pageable);

}
