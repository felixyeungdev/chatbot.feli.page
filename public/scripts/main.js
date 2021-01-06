var userToken;
const signInButton = document.querySelector("#signInButton");
const signInAnonymouslyButton = document.querySelector(
    "#signInAnonymouslyButton"
);
const signOutButton = document.querySelector("#signOutButton");
const signInSection = document.querySelector("#signIn");
const chatbotSection = document.querySelector("#chatbot");
const inputField = document.querySelector("#input");
const submitButton = document.querySelector("#submit");
const messagesDiv = document.querySelector("#messages");
const controlsDiv = document.querySelector(".controls");

function handleSignedIn(signedIn) {
    signInSection.style.display = signedIn ? "none" : "";
    chatbotSection.style.display = !signedIn ? "none" : "";
    signOutButton.style.display = !signedIn ? "none" : "";
    controlsDiv.style.display = !signedIn ? "none" : "";
    if (!signedIn) messagesDiv.innerHTML = "";
}

async function signIn(provider) {
    switch (provider) {
        case "anonymous":
            var result = await firebase.auth().signInAnonymously();
            break;

        case "google":
            var provider = new firebase.auth.GoogleAuthProvider();
            var result = await firebase.auth().signInWithPopup(provider);
            break;

        default:
            console.error(`${provider} not found or is not supported`);
            break;
    }
}

async function signOut() {
    await firebase.auth().signOut();
}

async function handleSubmit() {
    const message = inputField.value.trim();
    inputField.value = "";
    if (message === "") return;
    ChatBot.renderMessages(
        messagesDiv,
        [{ type: "string", content: message }],
        true
    );
    const response = await ChatBot.getResponse(message);
    ChatBot.renderMessages(messagesDiv, response.messages, false);
}

firebase.auth().onAuthStateChanged(async (user) => {
    userToken = user ? await user.getIdToken() : null;
    user ? handleSignedIn(true) : handleSignedIn(false);
});

signInButton.addEventListener("click", () => signIn("google"));
signInAnonymouslyButton.addEventListener("click", () => signIn("anonymous"));
signOutButton.addEventListener("click", signOut);

submitButton.addEventListener("click", handleSubmit);
inputField.addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        handleSubmit();
    }
});

handleSignedIn(false);
