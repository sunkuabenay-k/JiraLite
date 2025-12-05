	package com.app.jiraLite.config;
	
	import com.app.jiraLite.entity.Role;
	import com.app.jiraLite.entity.User;
	import com.app.jiraLite.repository.RoleRepository;
	import com.app.jiraLite.repository.UserRepository;
	import lombok.RequiredArgsConstructor;
	import org.springframework.boot.CommandLineRunner;
	import org.springframework.security.crypto.password.PasswordEncoder;
	import org.springframework.stereotype.Component;
	import org.springframework.transaction.annotation.Transactional;
	
	import java.util.Collections;
	import java.util.HashSet;
	import java.util.Optional;
	
	@Component
	@RequiredArgsConstructor
	public class DataInitializer implements CommandLineRunner {
	
	    private final RoleRepository roleRepository;
	    private final UserRepository userRepository;
	    private final PasswordEncoder passwordEncoder;
	
	    @Override
	    @Transactional
	    public void run(String... args) throws Exception {
	        // 1. Ensure Roles Exist
	        Role adminRole = createRoleIfNotFound("ADMIN");
	        Role userRole = createRoleIfNotFound("USER");
	
	        // 2. Check if Admin User Exists
	        if (userRepository.findByUsername("admin").isEmpty()) {
	            User admin = new User();
	            admin.setUsername("admin");
	            admin.setEmail("admin@jiralite.com");
	            admin.setPassword(passwordEncoder.encode("admin123")); // Default Password
	            admin.setRoles(new HashSet<>(Collections.singletonList(adminRole)));
	            
	            userRepository.save(admin);
	            System.out.println(">>> DEFAULT ADMIN USER CREATED: username='admin', password='admin123'");
	        }
	    }
	
	    private Role createRoleIfNotFound(String name) {
	        Optional<Role> role = roleRepository.findByName(name);
	        if (role.isPresent()) {
	            return role.get();
	        }
	        Role newRole = new Role();
	        newRole.setName(name);
	        return roleRepository.save(newRole);
	    }
	}