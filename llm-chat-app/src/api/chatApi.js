const API_BASE_URL = "http://localhost:8080/api/chat";

export async function sendChatMessage(message, conversationId) {
    const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            message,
            conversationId: conversationId ?? null,
        }),
    });

    if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
    }

    return response.json();
}