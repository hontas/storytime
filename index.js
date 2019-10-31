const five = require('johnny-five');
const Raspi = require('raspi-io').RaspiIO;
const iftttApi = require('./api/ifttt');
const debounce = require('./utils/debounce');
const throttle = require('./utils/throttle');

const sonosEvents = iftttApi.events.sonos;
const board = new five.Board({
  io: new Raspi()
});

const log = (...args) => console.log(...args);

board.on('ready', function() {
  log('board ready');
  const yellowLed = new five.Led('P1-11');
  const greenLed = new five.Led('P1-13');

  const yellowBtn = new five.Button('P1-18');
  const greenBtn = new five.Button('P1-16');
  const redBtn = new five.Button('P1-15');
  const blueBtn = new five.Button('P1-7');

  let lastHoldTime = Date.now();

  yellowLed.brightness(50);

  let currentEvent;
  let isPlaying = false;

  const play = async (eventName) => {
    log(`play: ${eventName}`);
    isPlaying = true;
    currentEvent = eventName;
    await iftttApi.triggerEvent(eventName);
    greenLed.on();
  };

  const pause = async () => {
    log('pause');
    isPlaying = false;
    await iftttApi.triggerEvent(sonosEvents.pause);
    greenLed.off();
  };

  const playOrPause = async (eventName) => {
    // hold event fired
    const timeSinceHold = Date.now() - lastHoldTime;
    if (timeSinceHold < 550) return;

    if (isPlaying && eventName === currentEvent) {
      await pause();
    } else {
      await play(eventName);
    }
  };

  const next = throttle(async () => {
    log('next');
    yellowLed.blink();
    await iftttApi.triggerEvent(sonosEvents.next);
    isPlaying = true;
    greenLed.on();
    yellowLed.stop().brightness(50);
  }, 3000);

  const onHold = () => {
    lastHoldTime = Date.now();
    next();
  };

  yellowBtn.on('up', () => playOrPause(sonosEvents.mammaMu));
  greenBtn.on('up', () => playOrPause(sonosEvents.alfons));
  redBtn.on('up', () => playOrPause(sonosEvents.dagSpoket));
  blueBtn.on('up', () => playOrPause(sonosEvents.mammaMu));

  yellowBtn.on('hold', onHold);
  greenBtn.on('hold', onHold);
  redBtn.on('hold', onHold);
  blueBtn.on('hold', onHold);

  board.on('exit', async () => {
    console.log('exit');
    yellowLed.stop().off();
    await pause();
  });
});
