const fetch = require("node-fetch");

const catApiURL = "https://api.thecatapi.com/v1/images/search";
const dogApiURL = "https://api.thedogapi.com/v1/images/search";

async function resolveImageUrlFromAPI(url) {
    let response = await fetch(url);
    let json = await response.json();
    return json[0].url;
}

class AnimalPhotosAPI {
    static async getCatImageURL() {
        const imageUrl = await resolveImageUrlFromAPI(catApiURL);
        return imageUrl;
    }

    static async getDogImageURL() {
        const imageUrl = await resolveImageUrlFromAPI(dogApiURL);
        return imageUrl;
    }
}

module.exports = { AnimalPhotosAPI };
