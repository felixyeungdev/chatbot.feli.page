var serviceAccount = process.env.DIALOGFLOW_SERVICE_ACCOUNT;
if (serviceAccount) {
    serviceAccount = JSON.parse(serviceAccount);
} else {
    serviceAccount = require("./secret/dialogflow-service-account.json");
}

const { SessionsClient } = require("dialogflow");

class DialogFlowAPI {
    static async getResponse({ sessionId, text }) {
        const sessionClient = new SessionsClient({
            credentials: serviceAccount,
        });
        const session = sessionClient.sessionPath("whatsapp-tcrmpd", sessionId);

        const request = {
            session: session,
            queryInput: {
                text: {
                    text: text,
                    languageCode: "en-US",
                },
            },
        };

        const response = await sessionClient.detectIntent(request);

        // console.log(JSON.stringify(response, null, 4));

        const result = response[0].queryResult;
        let messages = result.fulfillmentMessages;
        const reply = messages[0].text.text.join("\n");
        const action = result.action;
        const fields = result.parameters.fields;
        const allRequiredParamsPresent = result.allRequiredParamsPresent;
        // console.log(intentName)
        return { reply, action, allRequiredParamsPresent, fields };
    }
}

// async function main() {
//     let response = await DialogFlowAPI.getResponse({
//         sessionId: "foo",
//         text: "Hello",
//     });
//     console.log(response);
//     console.log(response[0].text.text.join("\n"));
// }

// main();

module.exports = { DialogFlowAPI };
