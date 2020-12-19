var fetch = require("node-fetch");

var options = (dataType) => {
    const DataGovHKUrls = {
        detailedCases:
            "https://api.data.gov.hk/v2/filter?q=%7B%22resource%22%3A%22http%3A%2F%2Fwww.chp.gov.hk%2Ffiles%2Fmisc%2Fenhanced_sur_covid_19_eng.csv%22%2C%22section%22%3A1%2C%22format%22%3A%22json%22%7D",
        residentialBuildings:
            "https://api.data.gov.hk/v2/filter?q=%7B%22resource%22%3A%22http%3A%2F%2Fwww.chp.gov.hk%2Ffiles%2Fmisc%2Fbuilding_list_eng.csv%22%2C%22section%22%3A1%2C%22format%22%3A%22json%22%7D",
    };

    return DataGovHKUrls[dataType];
};

function sortObjectKeys(unordered) {
    const ordered = {};
    Object.keys(unordered)
        .sort()
        .forEach(function (key) {
            ordered[key] = unordered[key];
        });
    return ordered;
}

function sortProperties(obj) {
    // convert object into array
    var sortable = [];
    for (var key in obj)
        if (obj.hasOwnProperty(key)) sortable.push([key, obj[key]]); // each item is an array in format [key, value]

    // sort items by value
    sortable.sort(function (a, b) {
        return a[1] - b[1]; // compare numbers
    });
    return sortable; // array in format [ [ key1, val1 ], [ key2, val2 ], ... ]
}

function normaliseDate(date = "") {
    let tmp = date.split("/");
    return tmp.reverse().join("-");
}

function formatDate(date) {
    return new Date(date)
        .toISOString()
        .replace(/T/, " ")
        .replace(/\..+/, "")
        .split(" ")[0];
}

var getDates = function (startDate, endDate) {
    startDate = new Date(startDate);
    endDate = new Date(endDate);
    // https://gist.github.com/miguelmota/7905510
    var dates = [],
        currentDate = startDate,
        addDays = function (days) {
            var date = new Date(this.valueOf());
            date.setDate(date.getDate() + days);
            return date;
        };
    while (currentDate <= endDate) {
        dates.push(currentDate);
        currentDate = addDays.call(currentDate, 1);
    }
    return dates;
};

class CovidAPI {
    static async getDetailedCases() {
        let response = await fetch(options("detailedCases"));
        return await response.json();
    }

    static async getResidentialBuildings() {
        let response = await fetch(options("residentialBuildings"));
        return await response.json();
    }

    static async generateReport() {
        let detailedCases = (await this.getDetailedCases()) || [];
        let residentialBuildings = await this.getResidentialBuildings();
        let districts = {};
        let casesByDate = {};
        let casesIncrement = {};

        let effDates = getDates(
            normaliseDate(detailedCases[0]["Report date"]),
            normaliseDate(
                detailedCases[detailedCases.length - 1]["Report date"]
            )
        );

        for (let effDate of effDates) {
            casesByDate[formatDate(effDate)] = 0;
        }

        for (let detailedCase of detailedCases) {
            let normalisedDate = normaliseDate(detailedCase["Report date"]);
            if (casesByDate[normalisedDate]) {
                casesByDate[normalisedDate] += 1;
            } else {
                casesByDate[normalisedDate] = 1;
            }
        }

        casesByDate = sortObjectKeys(casesByDate);

        for (let caseByDate in casesByDate) {
            let dateBefore = new Date(caseByDate);
            dateBefore.setDate(dateBefore.getDate() - 1);
            let casesBefore = casesByDate[dateBefore] || 0;
            casesIncrement[caseByDate] = casesByDate[caseByDate] - casesBefore;
        }

        for (let building of residentialBuildings) {
            let count = building["Related probable/confirmed cases"].split(", ")
                .length;
            if (building["Last date of residence of the case(s)"] !== "")
                if (districts[building["District"]]) {
                    districts[building["District"]] += count;
                } else {
                    districts[building["District"]] = count;
                }
        }
        // console.log(districts)
        districts = sortProperties(districts);
        districts = districts.reverse();

        let confirmedCases = detailedCases.filter(
            (detailedCase) => detailedCase["Confirmed/probable"] == "Confirmed"
        );
        let report = `
*Total Cases: ${confirmedCases.length}*
        `;

        report += `
*Daily new cases in past 7 days*`;

        let reportIncrementDates = Object.keys(casesIncrement);
        reportIncrementDates = reportIncrementDates.slice(
            reportIncrementDates.length - 7,
            reportIncrementDates.length
        );

        for (let date of reportIncrementDates) {
            report += `
${date}: ${casesIncrement[date]}`;
        }

        report += `

*Cases by district in past 14 days*`;

        for (let district of districts) {
            report += `
${district[0]}: ${district[1]}`;
        }

        report += `
        
Visit https://covidhk.feli.page/ for more details`;

        return report.trim();
    }
}

// async function main() {
//     console.log(await CovidAPI.generateReport());
// }

// main();

module.exports = { CovidAPI };
