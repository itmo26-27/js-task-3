// Сдайте этот файл. Эмулятор вызовет controlWolf один раз в начале раунда.
async function controlWolf({ eggs, press, waitUntil, now, cooldownMs, initialBasket }) {
  for await (const egg of eggs) {
    // egg.basket — куда летит яйцо, egg.catchAt — когда его нужно поймать.
    // Замените вывод в консоль своим управлением волком.
    console.log(now(), egg.basket, egg.catchAt);
  }
}
