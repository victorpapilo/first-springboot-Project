package com.peakhospital.backend.security;

import com.peakhospital.backend.model.ApprovalStatus;
import com.peakhospital.backend.model.User;
import com.peakhospital.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AppUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("No user with username: " + username));

        // A temporary account nobody claimed in time stops working until an admin resets it.
        boolean expired = user.isMustChangePassword()
                && user.getExpiresAt() != null
                && user.getExpiresAt().isBefore(LocalDateTime.now());

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getUsername())
                .password(user.getPassword())
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())))
                .disabled(!user.isActive() || user.getApprovalStatus() != ApprovalStatus.APPROVED)
                .accountExpired(expired)
                .build();
    }
}
