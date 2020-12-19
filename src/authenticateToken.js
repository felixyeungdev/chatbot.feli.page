var admin = require("firebase-admin");

const serviceAccount = require("./secret/firebaseServiceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://feli-page.firebaseio.com",
});

async function decodeIDToken(req, res, next) {
    const { auth } = req.body;
    if (auth) {
        try {
            const decodedToken = await admin.auth().verifyIdToken(auth);
            req["currentUser"] = decodedToken;
        } catch (err) {
            console.log(err);
        }
    }

    next();
}
module.exports = decodeIDToken;
