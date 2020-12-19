var dateFormat = require("dateformat");

class TimeAPI {
    static getTimeNow(time = new Date()) {
        time = new Date(time);
        // time.setHours(time.getHours() + 8)
        return `It\'s ${dateFormat(time, "hh:MM TT")}`;
    }
    static getDateFromTime(time = new Date()) {
        time = new Date(time);
        // time.setHours(time.getHours() + 8)
        // return time.toISOString()
        return `It\'s ${dateFormat(time, "dS mmmm yyyy")}`;
    }
}

module.exports = { TimeAPI };
