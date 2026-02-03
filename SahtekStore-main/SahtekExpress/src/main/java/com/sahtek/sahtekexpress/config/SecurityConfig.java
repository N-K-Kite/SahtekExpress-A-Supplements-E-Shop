package com.sahtek.sahtekexpress.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> {})
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // ✅ AUTH & PUBLIC
                        .requestMatchers(
                                "/sahtek_db/api/auth/**",
                                "/sahtek_db/api/products/**",
                                "/sahtek_db/api/users/**",
                                "/sahtek_db/api/orders/**",
                                "/sahtek_db/api/carts/**",      // 👈 AJOUT ICI (Autorise le checkout pour test)
                                "/swagger-ui/**",
                                "/api-docs/**"
                        ).permitAll()

                        // ✅ ADMIN
                        .requestMatchers("/sahtek_db/api/admin/**").hasRole("ADMIN")

                        // 🔐 LE RESTE PROTÉGÉ
                        .anyRequest().authenticated()
                )
                .httpBasic(httpBasic -> {});

        return http.build();
    }


    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}