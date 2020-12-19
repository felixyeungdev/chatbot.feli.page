const cron = require("node-cron");
var events = require("events");
const { UserAPI } = require("./userAPI");
const { v4: uuidV4 } = require("uuid");

let reminderEmitter = new events.EventEmitter();
let reminderCron;

class ReminderAPI {
    constructor(options = {}) {}

    static async getReminders() {
        let users = await UserAPI.getUsers();
        let reminders = [];
        for (let user of users) {
            if (user.reminders)
                for (let reminder of user.reminders) {
                    reminder.userId = user.userId;
                    reminders.push(reminder);
                }
        }
        return reminders;
    }

    static async addReminder(userId, reminder) {
        await UserAPI.addUserReminder(userId, reminder);
        return true;
    }

    static async removeReminder(reminder) {
        let userReminders = await UserAPI.getUserReminders(reminder.userId);
        if (!userReminders) return;
        userReminders = userReminders.filter(
            (checkReminder) => checkReminder.id != reminder.id
        );
        await UserAPI.setUserReminders(reminder.userId, userReminders);
    }

    static async start() {
        reminderCron = cron.schedule("* * * * * *", async () => {
            let now = new Date().getTime();
            let reminders = await this.getReminders();
            let expiredReminders = reminders.filter(
                (reminder) => reminder.time <= now
            );
            let ongoingReminders = reminders.filter(
                (reminder) => reminder.time > now
            );
            for (let expiredReminder of expiredReminders) {
                reminderEmitter.emit("time", expiredReminder);
                await this.removeReminder(expiredReminder);
            }
        });
    }

    static stop() {
        if (!reminderCron) return false;
        reminderCron.stop();
        return true;
    }

    static reminderTemplate(reminder = { content, time }) {
        reminder.id = uuidV4();
        return reminder;
    }

    static async getUserReminders(userId) {
        let userReminders = await UserAPI.getUserReminders(userId);
        return userReminders;
    }
}

module.exports = { ReminderAPI, reminderEmitter };
