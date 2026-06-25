package com.example.chat_app;

import com.example.chat_app.config.OllamaConfig;
import com.example.chat_app.service.OllamaService;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

class OllamaServiceTest {

    @Test
    void sendMessage_throwsException_whenServerUnreachable() {
        // Arrange: point at a port nothing is listening on
        OllamaConfig config = new OllamaConfig();
        config.setBaseUrl("http://localhost:9999");
        config.setModel("llama3.2");

        OllamaService service = new OllamaService(config);

        // Act + Assert: calling an unreachable server should throw, not silently fail
        assertThrows(Exception.class, () -> service.sendMessage("hello"));
    }
}