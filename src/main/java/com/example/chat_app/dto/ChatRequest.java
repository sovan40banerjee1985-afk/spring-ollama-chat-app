package com.example.chat_app.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

public record ChatRequest (
        @NotBlank(message = "Message Must Not Be Blank")
        String message,
        UUID conversationId
){}
