function scrollToBottom(element, smooth = true) {
    element.scrollTo({
        top: element.scrollHeight,
        behavior: smooth ? "smooth" : undefined,
    });
}

class ChatBot {
    static async getResponse(message) {
        const response = await fetch("/api/chatBot", {
            method: "POST",
            body: JSON.stringify({
                message,
                auth: userToken,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        });
        const json = await response.json();
        return json;
    }
    static async renderMessages(
        messagesDiv = document.querySelector("#messages"),
        messages = [],
        fromClient
    ) {
        console.log(messages);
        for (var message of messages) {
            const { type, content } = message;
            const messageDiv = document.createElement("div");
            messageDiv.classList.add("message");
            messageDiv.classList.add(fromClient ? "client" : "bot");
            switch (type) {
                case "string":
                    const span = document.createElement("span");
                    span.innerText = content;
                    messageDiv.append(span);
                    break;

                case "image":
                    const image = document.createElement("img");
                    image.src = content;
                    messageDiv.append(image);
                    break;

                default:
                    break;
            }
            messageDiv.classList.add("hidden");
            messagesDiv.append(messageDiv);
            setTimeout(() => {
                messageDiv.classList.remove("hidden");
            }, 100);
        }
        scrollToBottom(messagesDiv.parentNode);
    }
}
