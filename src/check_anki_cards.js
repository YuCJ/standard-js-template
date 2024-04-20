const fs = require("fs");

const CARDS_FILE = "oxford_anki_cards.txt";

/*  
card
[
  'nonetheless',
  '[adv.] Although the situation seems negative: despite that; even so.',
  'Many companies fail, but {{c1::nonetheless}} some succeed.',
  '儘管許多公司都失敗，但仍有一些公司成功。'
]
*/
const cards = fs
  .readFileSync(CARDS_FILE, "utf-8")
  .split("\n")
  .map((line) => line.split("|").map((cell) => cell.trim()));

const isCardHasCloze = (card) => card?.[2] && card[2].match(/{{c1::(.*)}}/g);

for (const card of cards) {
  if (!isCardHasCloze(card)) {
    console.log(card);
  }
}
