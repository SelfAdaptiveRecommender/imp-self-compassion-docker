package com.ip5.mindfulselfcompassionapp.dtos;

import java.util.List;

public record LoginResponse(
    String token,
    String role
) {
}
