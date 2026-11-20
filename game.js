(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const baskets = {
    topLeft: "Слева сверху", topRight: "Справа сверху",
    bottomLeft: "Слева снизу", bottomRight: "Справа снизу"
  };
  const initialBasket = "topLeft";
  const cooldownMs = 400;
  // [Момент появления, корзина, момент ловли], в миллисекундах раунда.
  const rounds = [
    ["Разминка", [[0, "topRight", 800], [1000, "bottomLeft", 1900], [2000, "bottomRight", 2800]]],
    ["Яйца подряд", [[0, "bottomLeft", 900], [100, "bottomLeft", 1050], [180, "topRight", 1300], [250, "bottomRight", 1800]]],
    ["Смена корзин", [[0, "bottomRight", 900], [80, "topRight", 1100], [160, "topLeft", 1450], [200, "bottomLeft", 1900], [1200, "bottomLeft", 2050], [1550, "topRight", 2500]]]
  ];
  // Запись нажатий для показа игры. Студенческий контроллер запускается отдельно.
  const recordings = [
    [[240, "topRight"], [1200, "bottomLeft"], [2200, "bottomRight"]],
    [[240, "bottomLeft"], [1090, "topRight"], [1510, "bottomRight"]],
    [[200, "bottomRight"], [960, "topRight"], [1370, "topLeft"], [1780, "bottomLeft"], [2200, "topRight"]]
  ];
  const draw = createWolfScene($("scene"));
  const directionButtons = [...document.querySelectorAll("[data-basket]")];
  let manualPress = null;
  let clockTimer;
  function stopClock() { clearInterval(clockTimer); }
  function describePosition(position) {
    for (const button of directionButtons) {
      button.classList.toggle("down", button.dataset.basket === position);
    }
    $("scene").setAttribute("aria-label", "Волк держит корзину. " + baskets[position] + ".");
  }
  function setControlsDisabled(disabled) {
    for (const button of document.querySelectorAll(".modes button")) button.disabled = disabled;
    for (const button of directionButtons) button.disabled = disabled && !manualPress;
    for (const control of $("controls").elements) control.disabled = disabled;
  }
  function selectedRound() {
    return $("round").selectedIndex;
  }
  function preview() {
    stopClock();
    draw(initialBasket, [], 0, []);
    describePosition(initialBasket);
    $("score").textContent = "Поймано 0 из " + rounds[selectedRound()][1].length;
    $("clock").textContent = "0 мс";
    $("recharge").value = cooldownMs;
    $("key-state").textContent = "Кнопки готовы";
    $("status").textContent = "«Игра А» и «Игра Б» — ручное управление. «Запустить» включает ваш controller.js.";
    $("log").replaceChildren();
  }
  rounds.forEach(([name], index) => $("round").add(new Option(name, index)));
  preview();
  $("round").addEventListener("change", preview);

  // Храним события, которые пришли, пока контроллер ждал таймер.
  function createStream() {
    const queue = [];
    const readers = [];
    let closed = false;
    return {
      push(value) {
        if (readers.length) readers.shift()({ value, done: false });
        else queue.push(value);
      },
      close() {
        closed = true;
        readers.splice(0).forEach(resolve => resolve({ done: true }));
      },
      iterator: {
        [Symbol.asyncIterator]() { return this; },
        next() {
          if (queue.length) return Promise.resolve({ value: queue.shift(), done: false });
          if (closed) return Promise.resolve({ done: true });
          return new Promise(resolve => readers.push(resolve));
        }
      }
    };
  }
  function start(schedule, recording, manual = false) {
    stopClock();
    manualPress = manual ? press : null;
    let replayIndex = 0;
    let feedback = [];
    const stream = createStream();
    let time = 0, position = initialBasket, lastPress = -Infinity, caught = 0;
    let timer, finished = false;
    const waits = [];
    const flying = new Map();
    $("log").replaceChildren();
    $("status").textContent = recording ? "Демо · замедленный показ" : manual ? "Ловите яйца четырьмя красными кнопками." : "Раунд идёт…";
    setControlsDisabled(true);
    describePosition(position);
    function log(message) {
      const line = document.createElement("li");
      line.textContent = time + " мс · " + message;
      $("log").append(line);
    }
    function updateScore() {
      $("score").textContent = "Поймано " + caught + " из " + schedule.length;
    }
    function finish(reason) {
      if (finished) return;
      finished = true;
      clearInterval(timer);
      stream.close();
      waits.splice(0).forEach(wait => wait.reject(new Error("Раунд завершён")));
      flying.clear();
      draw(position, flying, time, feedback, caught);
      $("status").textContent = reason;
      manualPress = null;
      setControlsDisabled(false);
    }
    function press(basket) {
      if (finished) throw new Error("Раунд завершён");
      let error;
      if (!Object.hasOwn(baskets, basket)) error = "Неизвестная корзина: " + basket;
      else if (time - lastPress < cooldownMs) error = "Раннее нажатие. Следующее доступно в " + (lastPress + cooldownMs) + " мс.";
      if (error) {
        log(error);
        finish(error);
        throw new Error(error);
      }
      lastPress = time;
      position = basket;
      describePosition(basket);
      render();
      log("Нажатие · " + baskets[basket]);
    }
    function waitUntil(target) {
      if (finished || !Number.isFinite(target)) return Promise.reject(new Error("Недоступное время ожидания"));
      if (target <= time) return Promise.resolve();
      return new Promise((resolve, reject) => waits.push({ target, resolve, reject }));
    }
    function render() {
      const remaining = Math.max(0, lastPress + cooldownMs - time);
      $("recharge").value = cooldownMs - remaining;
      $("key-state").textContent = remaining ? "До нажатия " + remaining + " мс" : "Кнопки готовы";
      draw(position, flying, time, feedback, caught);
    }
    function tick() {
      feedback = feedback.filter(event => time - event.at < 500);
      $("clock").textContent = time + " мс";
      schedule.forEach(([startAt, basket, catchAt], i) => {
        if (startAt === time) {
          flying.set(i, { startAt, basket, catchAt });
          stream.push(Object.freeze({ id: i + 1, basket, catchAt }));
          log("Яйцо " + (i + 1) + " → " + baskets[basket] + " к " + catchAt + " мс");
          if (i === schedule.length - 1) stream.close();
        }
        if (flying.has(i)) {
          if (time === catchAt) {
            const success = position === basket;
            if (success) caught++;
            log("Яйцо " + (i + 1) + (success ? " поймано" : " пропущено"));
            feedback.push({ basket, at: time, success });
            flying.delete(i);
            updateScore();
          }
        }
      });
      if (recording && recording[replayIndex]?.[0] === time) {
        press(recording[replayIndex++][1]);
      }
      render();
      for (let i = waits.length - 1; i >= 0; i--) {
        if (waits[i].target <= time) waits.splice(i, 1)[0].resolve();
      }
      if (time === schedule[schedule.length - 1][2]) {
        const result = caught === schedule.length ? "Все яйца пойманы!" : "Раунд окончен. Проверьте промахи в журнале.";
        finish(recording ? "Демо завершено. " + result : result);
        // После последнего промаха оставляем на экране разбитую скорлупу.
        if (feedback.some(event => !event.success)) draw(position, flying, time + 320, feedback, caught);
      }
    }
    updateScore();
    if (!recording && !manual) Promise.resolve().then(() => controlWolf({
      eggs: stream.iterator, press, waitUntil, now: () => time, cooldownMs, initialBasket
    })).catch(error => finish("Ошибка контроллера. " + error.message));
    tick();
    timer = setInterval(() => { time += 10; tick(); }, recording ? 25 : 10);
  }
  function startManual(index) {
    $("round").selectedIndex = index;
    start(rounds[index][1], null, true);
  }
  $("game-a").addEventListener("click", () => startManual(0));
  $("game-b").addEventListener("click", () => startManual(2));
  for (const button of directionButtons) {
    button.addEventListener("click", () => {
      if (!manualPress) startManual(selectedRound());
      try { manualPress(button.dataset.basket); }
      catch (error) { if (manualPress) throw error; } // Ошибка раннего нажатия уже показана в журнале.
    });
  }
  $("time-mode").addEventListener("click", () => {
    preview();
    function showTime() {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2,"0");
      const minutes = String(now.getMinutes()).padStart(2,"0");
      draw(initialBasket, [], 0, [], hours + ":" + minutes);
      $("scene").setAttribute("aria-label", "Часы показывают " + hours + ":" + minutes);
    }
    showTime();
    $("status").textContent = "Часы показывают местное время.";
    clockTimer = setInterval(showTime,1000);
  });
  $("controls").addEventListener("submit", event => {
    event.preventDefault();
    start(rounds[selectedRound()][1]);
  });
  $("demo").addEventListener("click", () => start(rounds[selectedRound()][1], recordings[selectedRound()]));
})();
