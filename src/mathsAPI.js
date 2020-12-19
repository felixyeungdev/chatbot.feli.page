class MathsAPI {
    static generateRandomNumberBetweenNumbers(numArray = []) {
        numArray.sort();
        console.log(numArray);
        let [min, max] = numArray;
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

module.exports = { MathsAPI };
