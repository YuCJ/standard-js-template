const fs = require("fs");

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
  .readFileSync("oxford_anki_cards.txt", "utf-8")
  .split("\n")
  .map((line) => line.split("|").map((cell) => cell.trim()));

for (const card of cards) {
  if (!card[2] || !card[2].match(/{{c1::(.*)}}/g)) {
    console.log(card);
  }
}
