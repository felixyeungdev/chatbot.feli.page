const { AnimalPhotosAPI } = require("./animalPhotosAPI");
const { CovidAPI } = require("./covidAPI");
const { DateFormat } = require("./dateFormat");
const { DialogFlowAPI } = require("./dialogflow");
const { HomeworkAPI, LessonsAPI } = require("./homeworkLessonAPI");
const { LyricsAPI } = require("./lyricsAPI");
const { MathsAPI } = require("./mathsAPI");
const { ReminderAPI } = require("./reminderAPI");
const { TimeAPI } = require("./timeAPI");
const { UserAPI } = require("./userAPI");
const { WeatherAPI } = require("./weatherAPI");
const { WordsAPI } = require("./wordsAPI");
const { YeelightAPI } = require("./yeelightAPI");

const randomElementFromArray = (items) => {
    var item = items[Math.floor(Math.random() * items.length)];
    return item;
};

class ChatBot {
    static async handleRequest(message, userId) {
        const result = [];
        function addMessageReply(message) {
            result.push({
                type: "string",
                content: message,
            });
        }
        if (!userId) {
            return [
                {
                    type: "string",
                    content: "You're not signed in",
                },
            ];
        }
        if (!message) {
            return [
                {
                    type: "string",
                    content: "Hmm",
                },
            ];
        }
        // console.log({ message, userId });
        let {
            reply,
            action,
            allRequiredParamsPresent,
            fields,
        } = await DialogFlowAPI.getResponse({
            sessionId: `firebase-${userId}`,
            text: message,
        });
        addMessageReply(reply);
        switch (action) {
            case "page.feli.bot.creator.where":
                addMessageReply("This feature is not available on web yet");
                break;
            case "page.feli.bot.creator.tell":
                addMessageReply("This feature is not available on web yet");
                break;
            case "page.feli.smarthome.lights.toggle.flash":
                var allowAction =
                    (await UserAPI.checkUserPermission(
                        userId,
                        "SMARTHOME_CONTROL"
                    )) ||
                    (await UserAPI.checkUserPermission(
                        userId,
                        "SMARTHOME_FLASH"
                    ));
                if (!allowAction) {
                    addMessageReply(
                        "You don't the permission to perform this action"
                    );
                    break;
                }
                var lightsNum = await YeelightAPI.flashLights();
                addMessageReply(
                    `Flashing ${lightsNum} light${lightsNum > 1 ? "s" : ""}`
                );

                break;
            case "page.feli.smarthome.lights.switch.on":
                var allowAction = await UserAPI.checkUserPermission(
                    userId,
                    "SMARTHOME_CONTROL"
                );
                if (!allowAction) {
                    addMessageReply(
                        "You don't the permission to perform this action"
                    );
                    break;
                }

                var lightsNum = await YeelightAPI.turnAllLightsOn();
                addMessageReply(
                    `Turning ${lightsNum} light${lightsNum > 1 ? "s" : ""} on`
                );

                break;
            case "page.feli.smarthome.lights.switch.off":
                var allowAction = await UserAPI.checkUserPermission(
                    userId,
                    "SMARTHOME_CONTROL"
                );
                if (!allowAction) {
                    addMessageReply(
                        "You don't the permission to perform this action"
                    );
                    break;
                }

                var lightsNum = await YeelightAPI.turnAllLightsOff();
                addMessageReply(
                    `Turning ${lightsNum} light${lightsNum > 1 ? "s" : ""} off`
                );

                break;

            case "set_user_name":
                if (!allRequiredParamsPresent) break;

                var userName = fields["given-name"].stringValue;
                UserAPI.setUserName(userId, userName);

                break;

            case "send_user_name":
                var userName = await UserAPI.getUserName(userId);
                var returnMessage;
                if (userName) {
                    let returnMessages = [
                        "Your name is ${userName}!",
                        "You are ${userName}!",
                    ];
                    returnMessage = randomElementFromArray(returnMessages);
                    returnMessage = returnMessage.replace(
                        "${userName}",
                        userName
                    );
                } else {
                    let returnMessages = [
                        "I don't know your name",
                        "I don't know... what's your name?",
                    ];
                    returnMessage = randomElementFromArray(returnMessages);
                }

                addMessageReply(returnMessage);
                break;

            case "reminder_set":
                if (!allRequiredParamsPresent) break;

                var reminderContent = fields["reminder"].stringValue;
                var time =
                    fields["date-time"].stringValue ||
                    fields["date-time"].structValue.fields.date_time
                        .stringValue;

                await ReminderAPI.addReminder(
                    userId,
                    ReminderAPI.reminderTemplate({
                        content: reminderContent,
                        time: new Date(time).getTime(),
                    })
                );
                addMessageReply(`Reminder Set`);
                break;

            case "reminder_get":
                if (!allRequiredParamsPresent) break;

                var reminderReport = "";
                var userReminders = await ReminderAPI.getUserReminders(userId);

                if (userReminders.length <= 0)
                    reminderReport = "You have no reminders";

                for (let reminder of userReminders) {
                    var prettyDate = DateFormat.format.prettyDate(
                        new Date(reminder.time)
                    );
                    reminderReport += `*Reminder*\n${reminder.content}\n${prettyDate}\n\n`;
                }

                addMessageReply(reminderReport);
                break;

            case "maths_random_two-num":
                if (!allRequiredParamsPresent) break;

                var num1 = fields["first-num-int"].numberValue;
                var num2 = fields["second-num-int"].numberValue;

                var randomNumber = MathsAPI.generateRandomNumberBetweenNumbers([
                    num1,
                    num2,
                ]);
                addMessageReply(`${randomNumber}`);
                break;

            case "get_datetime_time":
                if (!allRequiredParamsPresent) break;

                var date =
                    fields["date-time"].stringValue ||
                    fields["date-time"].structValue.fields.date_time
                        .stringValue;
                var time = TimeAPI.getTimeNow(date);
                addMessageReply(`${time} in Hong Kong`);
                break;

            case "get_datetime_time":
                if (!allRequiredParamsPresent) break;

                var date =
                    fields["date-time"].stringValue ||
                    fields["date-time"].structValue.fields.date_time
                        .stringValue;
                var dateTime = TimeAPI.getDateFromTime(date);
                addMessageReply(`${dateTime} in Hong Kong`);
                break;

            case "get_weather":
                var weatherReport = await WeatherAPI.generateReport();
                addMessageReply(weatherReport);
                break;

            case "get_cat_image":
                var url = await AnimalPhotosAPI.getCatImageURL();
                result.push({
                    type: "image",
                    content: url,
                });
                break;

            case "get_dog_image":
                var url = await AnimalPhotosAPI.getDogImageURL();
                result.push({
                    type: "image",
                    content: url,
                });
                break;

            case "get_covid":
                var covidReport = await CovidAPI.generateReport();
                addMessageReply(covidReport);
                break;

            case "get_lyrics":
                if (!allRequiredParamsPresent) break;
                var song = fields["song"].stringValue;
                var artist = fields["artist"].stringValue;

                var lyrics = await LyricsAPI.getLyrics({ song, artist });
                addMessageReply(lyrics);
                break;

            case "get_word_definition":
                if (!allRequiredParamsPresent) break;
                let word = fields["word"].stringValue;
                let wordDefinitionReport = await WordsAPI.generateReport(word);
                addMessageReply(wordDefinitionReport);
                break;

            case "get_homework":
                if (!allRequiredParamsPresent) break;
                var checkStartDate, checkEndDate;
                if (fields["date-time"].structValue) {
                    checkStartDate =
                        fields["date-time"].structValue.fields.startDate
                            .stringValue;
                    checkEndDate =
                        fields["date-time"].structValue.fields.endDate
                            .stringValue;
                } else {
                    checkStartDate = fields["date-time"].stringValue;
                    // checkEndDate = checkStartDate;
                }
                var homeworkReport = await HomeworkAPI.generateReport({
                    start: checkStartDate,
                    end: checkEndDate,
                });
                addMessageReply(homeworkReport);
                break;

            case "get_lessons":
                if (!allRequiredParamsPresent) break;
                var checkStartDate, checkEndDate;
                if (fields["date-time"].structValue) {
                    checkStartDate =
                        fields["date-time"].structValue.fields.startDate
                            .stringValue;
                    checkEndDate =
                        fields["date-time"].structValue.fields.endDate
                            .stringValue;
                } else {
                    checkStartDate = fields["date-time"].stringValue;
                    // checkEndDate = checkStartDate;
                }
                var lessonsReport = await LessonsAPI.generateReport({
                    start: checkStartDate,
                    end: checkEndDate,
                });
                addMessageReply(lessonsReport);
                break;

            case "blank":
                break;

            default:
                break;
        }
        return result;
    }
}

module.exports = { ChatBot };
