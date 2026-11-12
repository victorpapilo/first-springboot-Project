package com.peakhospital.backend.security;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    // Role names (Spring adds the ROLE_ prefix itself for hasRole / hasAnyRole).
    private static final String ADMIN = "ADMIN";
    private static final String DOCTOR = "DOCTOR";
    private static final String RECEPTIONIST = "RECEPTIONIST";
    private static final String NURSE = "NURSE";
    private static final String PHARMACIST = "PHARMACIST";
    private static final String LAB = "LAB_TECHNICIAN";
    private static final String PATIENT = "PATIENT";

    private final AppUserDetailsService userDetailsService;
    private final JwtAuthFilter jwtAuthFilter;

    /** Comma-separated list. For the deployed site set APP_CORS_ORIGINS to your Vercel address. */
    @Value("${app.cors.allowed-origins:http://localhost:*}")
    private String allowedOrigins;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(
                Arrays.stream(allowedOrigins.split(",")).map(String::trim).filter(s -> !s.isEmpty()).toList());
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex -> ex
                        // Not signed in / expired token -> 401, so the app can send the person back to login.
                        .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
                        // Signed in but the role is not allowed -> 403 with a readable message.
                        .accessDeniedHandler((request, response, denied) -> {
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"status\":403,\"error\":\"Forbidden\","
                                    + "\"message\":\"Your role does not have permission to do that.\"}");
                        }))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // --- Public: sign in and the two self sign-ups. Staff sign-ups stay locked until approved. ---
                        .requestMatchers(HttpMethod.POST, "/api/auth/login",
                                "/api/auth/signup/patient", "/api/auth/signup/staff").permitAll()
                        .requestMatchers("/api/auth/register").hasRole(ADMIN)

                        // --- Administration ---
                        .requestMatchers("/api/users/**", "/api/audit-logs/**", "/api/staff-applications/**")
                                .hasRole(ADMIN)
                        .requestMatchers("/api/dashboard/**").hasAnyRole(ADMIN, RECEPTIONIST)
                        .requestMatchers("/api/portal-accounts/**").hasAnyRole(ADMIN, RECEPTIONIST)
                        .requestMatchers("/api/emergency/**").hasAnyRole(ADMIN, RECEPTIONIST, DOCTOR, NURSE)

                        // --- "My ..." endpoints: always scoped to the signed-in person, never to an id in the URL ---
                        .requestMatchers("/api/me/appointments").hasAnyRole(DOCTOR, PATIENT)
                        .requestMatchers("/api/me/lab-tests", "/api/me/invoices",
                                "/api/me/prescriptions", "/api/me/complete-account").hasRole(PATIENT)
                        .requestMatchers("/api/me/**").authenticated()

                        // --- Patients and doctors ---
                        .requestMatchers(HttpMethod.DELETE, "/api/patients/**").hasRole(ADMIN)
                        .requestMatchers(HttpMethod.GET, "/api/patients/**")
                                .hasAnyRole(ADMIN, RECEPTIONIST, DOCTOR, NURSE)
                        .requestMatchers("/api/patients/**").hasAnyRole(ADMIN, RECEPTIONIST)
                        .requestMatchers(HttpMethod.GET, "/api/doctors/**")
                                .hasAnyRole(ADMIN, RECEPTIONIST, DOCTOR, NURSE)
                        .requestMatchers("/api/doctors/**").hasRole(ADMIN)

                        // --- Front desk ---
                        .requestMatchers("/api/appointments/**").hasAnyRole(ADMIN, RECEPTIONIST, DOCTOR, NURSE)
                        .requestMatchers("/api/visits/**").hasAnyRole(ADMIN, RECEPTIONIST)
                        .requestMatchers("/api/invoices/**").hasAnyRole(ADMIN, RECEPTIONIST)

                        // --- Wards ---
                        .requestMatchers(HttpMethod.DELETE, "/api/wards/**").hasRole(ADMIN)
                        .requestMatchers("/api/wards/**", "/api/admissions/**")
                                .hasAnyRole(ADMIN, RECEPTIONIST, DOCTOR, NURSE)

                        // --- Clinical ---
                        .requestMatchers("/api/clinical-records/**").hasAnyRole(ADMIN, DOCTOR, NURSE)
                        .requestMatchers(HttpMethod.POST, "/api/prescriptions/**").hasAnyRole(ADMIN, DOCTOR)
                        .requestMatchers("/api/prescriptions/**").hasAnyRole(ADMIN, DOCTOR, NURSE)

                        // --- Laboratory: clinicians order, lab staff enter results ---
                        .requestMatchers(HttpMethod.POST, "/api/lab-tests/**").hasAnyRole(ADMIN, DOCTOR, NURSE)
                        .requestMatchers(HttpMethod.PUT, "/api/lab-tests/**").hasAnyRole(ADMIN, LAB)
                        .requestMatchers("/api/lab-tests/**").hasAnyRole(ADMIN, DOCTOR, NURSE, LAB)

                        // --- Pharmacy ---
                        .requestMatchers("/api/medicines/**").hasAnyRole(ADMIN, PHARMACIST)

                        .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
