var firebaseConfig = {
    apiKey: "AIzaSyAp2x4GhQ6t8SPkOMKc_pBbhjxAAGCxgOI",
    authDomain: "auth.feli.page",
    databaseURL: "https://feli-page.firebaseio.com",
    projectId: "feli-page",
    storageBucket: "feli-page.appspot.com",
    messagingSenderId: "140818689378",
    appId: "1:140818689378:web:4034d2e3b6c80fd90e903b",
    measurementId: "G-RQVNZYBZN7",
};
firebase.initializeApp(firebaseConfig);
firebase.analytics();

var firebaseUIConfig = {
    callbacks: {
        signInSuccessWithAuthResult: () => false,
    },
    signInFlow: "popup",
    signInOptions: [
        {
            provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            providerName: "Google",
            customParameters: {
                prompt: "select_account",
            },
            clientId:
                "140818689378-mpshne3ukb006rksmal25gam5pro3cin.apps.googleusercontent.com",
        },
        firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID,
    ],
    credentialHelper: firebaseui.auth.CredentialHelper.GOOGLE_YOLO,
};

var ui = new firebaseui.auth.AuthUI(firebase.auth());

function startFirebaseUI() {
    ui.start("#firebaseui-auth-container", firebaseUIConfig);
}
