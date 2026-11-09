'use strict';

// Personalise the venue, schedule, music and RSVP deployment here.
  // Explicit India Standard Time keeps the countdown consistent worldwide.
  const WEDDING = {
    date: '2026-11-30T20:00:00+05:30', // Jaimala & Pheras — what the countdowns count down to
    time: '8:00 PM onwards',
    venue: 'Sports Club',
    address: 'Sports Club, Jabalpur'
  };

  // Google Apps Script web-app URL that stores RSVPs in a Google Sheet and emails the
  // sheet as Excel (see rsvp/apps-script.gs). Paste the deployment URL ending in /exec.
  const RSVP_ENDPOINT = 'https://script.google.com/macros/s/AKfycbz3cJNH3ZG_7hOmVUoL5SS5WHwh7X5dC1g34ytXC7Q2mEBLwHD6UbR3r7QbMrywOJhV/exec';

  // All events are at WEDDING.venue unless an event sets its own `venue`.
  const EVENTS = [
    { day: 'Sunday, 29th November 2026', name: 'Mehndi', emoji: '🌿', time: '11:00 AM', theme: { name: 'Green', hex: '#5E9E5A' }, text: 'Photoshoot + Function — henna, laughter and lots of love.' },
    { day: 'Sunday, 29th November 2026', name: 'Engagement & Sangeet', emoji: '💃', time: '6:00 PM', text: 'Dance, Dazzle & Make it a Night to Remember!' },
    { day: 'Monday, 30th November 2026', name: 'Haldi & Carnival', emoji: '🌼', time: '9:00 AM', theme: { name: 'Yellow', hex: '#F2C230' }, text: 'Ubtan + Phool Wale — turmeric, flowers and a carnival of colours.' },
    { day: 'Monday, 30th November 2026', name: 'Matrika Pooja', emoji: '🪔', time: '5:00 PM', text: 'Seeking the blessings of the divine mothers before the big day.' },
    { day: 'Monday, 30th November 2026', name: 'Jaimala & Pheras', emoji: '💍', time: '8:00 PM onwards', text: 'Garlands, seven sacred vows and the beginning of our forever.' }
  ];

const WEDDING_MUSIC = 'music/mangalyam.mp3';
