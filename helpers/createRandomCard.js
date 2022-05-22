function createRandomCard(n) {
    let cards = [];
    for (let i = 0; i < n; i++) {
        let card = ``;
        for (let j = 0; j < 5; j++) {
            card += Math.floor(Math.random() * 10)
        }
        cards.push(card);
    }
    return cards;
}

module.exports = createRandomCard
