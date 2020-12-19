var fetch = require("node-fetch");

var options = (dataType) => {
    return `https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=${dataType}&lang=en`;
};

class WeatherAPI {
    static async localWeatherForecast() {
        let response = await fetch(options("flw"));
        return response.json();
    }

    static async nineDayWeatherForecast() {
        let response = await fetch(options("fnd"));
        return response.json();
    }

    static async generateReport() {
        let flw = await this.localWeatherForecast();
        let fnd = await this.nineDayWeatherForecast();
        let report = `
*Local Weather Forecast*${
            flw["forecastPeriod"] != "" ? "\nForecast Period:" : ""
        }
${flw["forecastPeriod"]}
${flw["generalSituation"] != "" ? "\nGeneral Situation:" : ""}
${flw["generalSituation"]}
${flw["forecastDesc"] != "" ? "\nForecast Description:" : ""}
${flw["forecastDesc"]}
${flw["outlook"] != "" ? "\nOutlook:" : ""}
${flw["outlook"]}
${flw["fireDangerWarning"] != "" ? "\nFire Danger Warning:" : ""}
${flw["fireDangerWarning"]}
${flw["tcInfo"] != "" ? "\nTropical Cyclone Warning:" : ""}
${flw["tcInfo"]}`;

        report += `
*9-Day Weather Forecast*`;

        for (let fw of fnd["weatherForecast"]) {
            report += `
${fw["week"]}: ${fw["forecastMaxtemp"]["value"]}°C - ${fw["forecastMintemp"]["value"]}°C`;
        }

        report += `
        
Visit https://weatherhk.feli.page/ for more details`;

        return report.trim();
    }
}

module.exports = { WeatherAPI };
