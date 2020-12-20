const fetch = require("node-fetch");

const APIKEY = require("./secret/rapidapi-key.json")[
    "wordsapiv1-p-rapidapi-com"
];

async function getWordsAPIData(word) {
    var response = await fetch(
        `https://wordsapiv1.p.rapidapi.com/words/${word}`,
        {
            method: "GET",
            headers: {
                "x-rapidapi-host": "wordsapiv1.p.rapidapi.com",
                "x-rapidapi-key": APIKEY,
            },
        }
    );
    let json = response.json();
    return json;
}

class WordsAPI {
    static async getWord(word = "example") {
        let json = await getWordsAPIData(word);
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
}

async function test() {
    console.log(await WordsAPI.generateReport());
}

// test();

module.exports = { WordsAPI };
