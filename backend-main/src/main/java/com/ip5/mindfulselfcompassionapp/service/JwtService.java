package com.ip5.mindfulselfcompassionapp.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Collection;
import java.util.Date;

@Service
public class JwtService {
    private final int expiration = 1000 * 7200;
    private final UserService userService;

    @Value("${security.jwt.secret}")
    private String secretKey;

    public JwtService(UserService userService) {
        this.userService = userService;
    }

    public String createToken(String email) throws RuntimeException {
        UserDetails user = userService.loadUserByUsername(email);
        String role = user.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse("ROLE_USER");

        long issued = System.currentTimeMillis();

        return Jwts.builder()
                .setIssuedAt(new Date(issued))
                .setExpiration(new Date(issued + expiration))
                .setId(email)
                .claim("role", role)
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean isTokenValid(String token) {
        Jwts.parserBuilder()
                .setSigningKey(getKey())
                .build()
                .parseClaimsJws(token);

        return true;
    }

    private Key getKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

}
