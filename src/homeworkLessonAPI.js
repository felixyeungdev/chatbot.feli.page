const fetch = require("node-fetch");

var secrets = process.env.HOMEWORK_API;
if (secrets) {
    secrets = JSON.parse(secrets);
} else {
    secrets = require("./secret/homework-api.json");
}

const { APIKEY, HomeworkCalendar, MainCalendar } = secrets;

function generateRequestLink({ calendarId, pageToken, timeMin, timeMax }) {
    let timeMinReq = new Date(timeMin);
    let timeMaxReq = new Date(timeMax);
    timeMinReq.setHours(timeMinReq.getHours() - 8);
    timeMaxReq.setHours(timeMaxReq.getHours() - 8);

    // console.log([timeMinReq.toISOString(), timeMaxReq.toISOString()]);

    let result = `https://content.googleapis.com/calendar/v3/calendars/${calendarId}/events?key=${APIKEY}`;
    result += `&showDeleted=${false}`;
    result += `&singleEvents=${true}`;
    result += `&orderBy=${"startTime"}`;
    result += `&timeMin=${timeMinReq.toISOString()}`;
    result += `&timeMax=${timeMaxReq.toISOString()}`;
    // result += `&timeMin=${"2020-05-25T00:17:14.307Z"}`;
    result += `&maxResults=${2500}`;
    if (pageToken) result += `&pageToken=${pageToken}`;
    // console.log(result);
    return result;
}

async function getEvents({ calendarId, pageToken, timeMin, timeMax }) {
    let requestLink = generateRequestLink({
        calendarId,
        timeMin,
        timeMax,
        pageToken,
    });
    let response = await fetch(requestLink);
    const json = await response.json();
    // console.log(JSON.stringify(json, null, 4));
    return json;
}

function dateToYYYYMMDD(date) {
    return date.replace(/T/, " ").replace(/\..+/, "").split(" ")[0];
}

async function getAllEvents({ calendarId, timeMin, timeMax }) {
    let done = false;
    let events = [];
    let pageToken;

    while (!done) {
        let response = await getEvents({
            calendarId,
            pageToken,
            timeMin,
            timeMax,
        });
        events = [...events, ...response.items];
        if (pageToken == response.nextPageToken) break;
        if (!response.nextPageToken) break;

        pageToken = response.nextPageToken;
        // console.log(`Got next page: ${pageToken}`);
    }
    return events;
}

function parseMainCalendar(events = []) {
    let mapped = stripEventList(events);
    let lessons = mapped.filter((e) => e.start.dateTime);
    let specialEvents = mapped.filter((e) => e.start.date);
    return [lessons, specialEvents];
}

function consoleLogAllEvents(events = []) {
    events.forEach((e) => {
        console.log(e.summary);
    });
}

function stripEventList(events = []) {
    return events.map((e) => {
        let { description, end, start, summary } = e;
        return { description, end, start, summary };
    });
}

class HomeworkAPI {
    static async getHomework({ start = new Date(), end }) {
        // console.log({ start, end });
        let timeMin = new Date(start);
        let timeMax;
        if (end) {
            timeMax = new Date(end);
        } else {
            timeMax = new Date(timeMin);
            timeMax.setDate(timeMax.getDate() + 1);
            timeMin.setHours(0, 0, 0, 0);
            timeMax.setHours(0, 0, 0, 0);
        }

        timeMin.setHours(timeMin.getHours() + 8);
        timeMax.setHours(timeMax.getHours() + 8);

        // console.log([timeMin.toISOString(), timeMax.toISOString()]);

        let homework = await getAllEvents({
            calendarId: HomeworkCalendar,
            timeMin: timeMin.toISOString(),
            timeMax: timeMax.toISOString(),
        });
        let homeworkList = stripEventList(homework);
        return { homeworkList, timeMin, timeMax };
    }
    static async generateReport({ start, end }) {
        // console.log(start, end);
        let { homeworkList, timeMin, timeMax } = await this.getHomework({
            start,
            end,
        });

        let report = `*Homework from ${dateToYYYYMMDD(
            timeMax.toISOString()
        )} to ${dateToYYYYMMDD(timeMax.toISOString())}*
        `;

        if (homeworkList.length <= 0)
            report += `No Homework during that period!`;

        for (let homework of homeworkList) {
            let data = JSON.parse(homework.description);
            report += `
${data.subject} - ${data.title}
  (${data.startDate} - ${data.endDate})`;
        }

        report += `
        
More details at https://hw.feli.page/dashboard/`;

        return report;
    }
}

class LessonsAPI {
    static async getLessons({ start = new Date(), end }) {
        // console.log({ start, end });
        let timeMin = new Date(start);
        let timeMax;
        if (end) {
            timeMax = new Date(end);
        } else {
            timeMax = new Date(timeMin);
            timeMax.setDate(timeMax.getDate() + 1);
            timeMin.setHours(0, 0, 0, 0);
            timeMax.setHours(0, 0, 0, 0);
        }

        timeMin.setHours(timeMin.getHours() + 8);
        timeMax.setHours(timeMax.getHours() + 8);

        // console.log([timeMin.toISOString(), timeMax.toISOString()]);

        let mainEvents = await getAllEvents({
            calendarId: MainCalendar,
            timeMin: timeMin.toISOString(),
            timeMax: timeMax.toISOString(),
        });

        let [lessonList, specialEventList] = parseMainCalendar(mainEvents);
        return { lessonList, timeMin, timeMax };
    }
    static async generateReport({ start, end }) {
        let { lessonList, timeMin, timeMax } = await this.getLessons({
            start,
            end,
        });

        let report = `*Lessons from ${
            timeMin
                .toISOString()
                .replace(/T/, " ")
                .replace(/\..+/, "")
                .split(" ")[0]
        } to ${
            timeMax
                .toISOString()
                .replace(/T/, " ")
                .replace(/\..+/, "")
                .split(" ")[0]
        }*
        `;

        if (lessonList.length <= 0) report += `No Lessons during that period!`;

        let currentDay = "";
        for (let lesson of lessonList) {
            let loopedDay = dateToYYYYMMDD(lesson.start.dateTime);
            let lessonTime = lesson.start.dateTime.substring(11, 16);
            if (currentDay != loopedDay) {
                currentDay = loopedDay;
                report += `

${currentDay}`;
            }

            report += `
\`\`\`${lessonTime}\`\`\` ${lesson.summary}`;
        }

        report += `
        
More details at https://hw.feli.page/dashboard/`;

        return report;
    }
}

// async function test() {
//     console.log(await HomeworkAPI.generateReport("2020-07-02"));
// }

// test();

module.exports = { HomeworkAPI, LessonsAPI: LessonsAPI };
