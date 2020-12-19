const fetch = require("node-fetch");

async function getWordsAPIData({ song, artist }) {
    var response = await fetch(`https://api.lyrics.ovh/v1/${artist}/${song}`, {
        method: "GET",
    });
    let json = response.json();
    return json;
}

class LyricsAPI {
    static async getLyrics(request = { song, artist }) {
        let response = await getWordsAPIData(request);

        if (response.error) {
            return response.error;
        } else {
            return response.lyrics;
        }
    }
}

module.exports = { LyricsAPI };
