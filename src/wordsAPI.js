const fetch = require("node-fetch");

const APIKEY = require("./secret/rapidapi-key.json")[
    "wordsapiv1-p-rapidapi-com"
];

async function fetchWrapper(link) {
    var response = await fetch(link, {
        method: "GET",
        headers: {
            "x-rapidapi-host": "wordsapiv1.p.rapidapi.com",
            "x-rapidapi-key": APIKEY,
        },
    });
    let json = response.json();
    return json;
}

async function getWordsAPIDataByWord(word) {
    return await fetchWrapper(
        `https://wordsapiv1.p.rapidapi.com/words/${word}`
    );
}
async function getWordsAPIDataByRandom() {
    return await fetchWrapper(
        `https://wordsapiv1.p.rapidapi.com/words/?random=true`
    );
}

class WordsAPI {
    static async getWord(word = "example") {
        let json = await getWordsAPIDataByWord(word);
        return json;
    }

    static async getRandomWord() {
        let json = await getWordsAPIDataByRandom();
        return json;
    }

    static async generateReport(requestWord = "") {
        let json = await this.getWord(requestWord);
        let report = "";
        let { word, results, syllables, pronunciation, success } = json;
        if (success == false) return `The word *${requestWord}* was not found`;
        report += `*${word}*`;
        if (pronunciation && pronunciation.all)
            report += `
Pronunciation: ${pronunciation.all}`;
        if (syllables) {
            report += `
Syllables: `;
            for (let syllable of syllables.list) {
                report += `${syllable}-`;
            }
            report = report.slice(0, -1);
        }

        report += `

Definitions:`;

        for (let i in results) {
            let result = results[i];
            let num = parseInt(i) + 1;
            report += `
${num}: ${word} (${result.partOfSpeech})
  ${result.definition}`;
            if (result.examples) {
                report += `
  _${result.examples[0]}_`;
            }
        }

        return report;
    }

    static async generateReportRandomWord() {
        var json;
        try {
            json = await this.getRandomWord();
            const word = json["word"];
            const topResult = json["results"][0];
            const pronunciation = json["pronunciation"]
                ? json["pronunciation"]["all"] || json["pronunciation"]
                : null;

            let report = `${word} ${pronunciation ? pronunciation : ""}\n${
                topResult["definition"]
            }`;
            // console.log({ topResult, pronunciation, word });
            return report;
        } catch (error) {
            // console.log(json);
            // console.log(error);
            return "An unexpected error occurred";
        }
    }
}

async function test() {
    // console.log(await WordsAPI.generateReport());
    console.log(await WordsAPI.generateReportRandomWord());
}

// test();

module.exports = { WordsAPI };
