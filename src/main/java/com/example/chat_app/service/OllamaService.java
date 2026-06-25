package com.example.chat_app.service;

import com.example.chat_app.config.OllamaConfig;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Service
public class OllamaService {

    private final RestClient restClient;
    private final OllamaConfig ollamaConfig;

    public OllamaService(OllamaConfig ollamaConfig) {
        this.ollamaConfig = ollamaConfig;
        this.restClient = RestClient.builder()
                .baseUrl(ollamaConfig.getBaseUrl())
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    public String sendMessage(String userMessage) {

        Map<String, Object> requestBody = Map.of(
                "model", ollamaConfig.getModel(),
                "prompt", userMessage,
                "stream", false
        );

        Map<String, Object> response = restClient.post()
                .uri("/api/generate")
                .body(requestBody)
                .retrieve()
                .body(Map.class);

        return extractTextFromResponse(response);
    }

    private String extractTextFromResponse(Map<String, Object> response) {
        return (String) response.get("response");
    }
}