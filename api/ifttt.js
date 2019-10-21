const fetch = require('node-fetch');

const iftttKey = 'emX5OT_o0ObkqG1CUa7-L-QOWtiJNzIbgiWUdY4_xZe';
const events = Object.freeze({
  sonos: {
    volumeUp: 'sonos_volume_up',
    volumeDown: 'sonos_volume_down',
    setVolume: 'sonos_set_volume', //  {value1}
    playStream: 'sonos_play_stream', // {value1: stream url, value2: image? }
    pause: 'sonos_pause',
    resume: 'sonos_resume',
    next: 'sonos_next',
    previous: 'sonos_previous',
    mammaMu: 'sonos_play_mammamu',
    alfons: 'sonos_play_alfons',
    dagSpoket: 'sonos_play_dagspoket'
  }
});

const getUrl = (event) => `https://maker.ifttt.com/trigger/${event}/with/key/${iftttKey}`;

const triggerEvent = (event, body) => {
  console.log('triggerEvent', event, body);
  const url = getUrl(event);
  let options = {};

  if (body) {
    options.method = 'POST';
    options.body = JSON.stringify(body);
    options.headers = {
      'content-type': 'application/json'
    };
  }

  return fetch(url, options)
    .then((resp) => resp.text())
    .then(console.log);
};

module.exports = {
  triggerEvent,
  events
};
