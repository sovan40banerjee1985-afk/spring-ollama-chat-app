package com.example.chat_app.dto;

import java.time.Instant;
import java.util.UUID;

public record ChatResponse(
   UUID conversationId,
   String reply,
   Instant createdAt
) {}
