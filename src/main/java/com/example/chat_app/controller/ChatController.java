package com.example.chat_app.controller;

import com.example.chat_app.config.OllamaConfig;
import com.example.chat_app.dto.ChatRequest;
import com.example.chat_app.dto.ChatResponse;
import com.example.chat_app.enums.Role;
import com.example.chat_app.model.ChatMessage;
import com.example.chat_app.repository.ChatMessageRepository;
import com.example.chat_app.service.OllamaService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.UUID;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/chat")
public class ChatController {
    private final OllamaService ollamaService;
    private final ChatMessageRepository chatMessageRepository;

    public ChatController(OllamaService ollamaService, ChatMessageRepository chatMessageRepository) {
        this.ollamaService = ollamaService;
        this.chatMessageRepository = chatMessageRepository;
    }

    @PostMapping
    public ChatResponse chat(@Valid @RequestBody ChatRequest chatRequest) {
        UUID conversationId = chatRequest.conversationId() != null ? chatRequest.conversationId() : UUID.randomUUID();
        // saving user message
        ChatMessage userMessage = new ChatMessage();
        userMessage.setConversationId(conversationId);
        userMessage.setRole(Role.USER);
        userMessage.setContent(chatRequest.message());
        userMessage.setCreatedAt(Instant.now());
        chatMessageRepository.save(userMessage);

        // calling anthropic
        String reply = ollamaService.sendMessage(chatRequest.message());

        // saving llm message
        ChatMessage llmMessage = new ChatMessage();
        llmMessage.setConversationId(conversationId);
        llmMessage.setContent(reply);
        llmMessage.setRole(Role.ASSISTANT);
        llmMessage.setCreatedAt(Instant.now());
        chatMessageRepository.save(llmMessage);

        return new ChatResponse(conversationId,reply,llmMessage.getCreatedAt());
    }
}
