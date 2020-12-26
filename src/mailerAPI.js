const nodemailer = require("nodemailer");
var credentials = process.env.NOREPLY_FELI_PAGE_EMAIL_CREDENTIALS;
if (credentials) {
    credentials = JSON.parse(credentials);
} else {
    credentials = require("./secret/noreply@feli.page-credentials.json");
}
// console.log(credentials);

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: credentials,
});

var mailOptions = (to, subject, text) => {
    return { from: "Feli Page <noreply@feli.page>", to, subject, text };
};

class MailerAPI {
    static async sendEmail(recipient, subject, message) {
        return new Promise((resolve, reject) => {
            transporter.sendMail(
                mailOptions(recipient, subject, message),
                function (error, info) {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(info.response);
                    }
                }
            );
        });
    }
}

module.exports = { MailerAPI };
