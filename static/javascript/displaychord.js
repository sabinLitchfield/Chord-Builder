'use strict';

$(document).ready(function () {
  // the following black sets up the players for guitar tones that the chords can be played in
  const acoustic = _tone_0253_GeneralUserGS_sf2_file;
  const clean = _tone_0270_FluidR3_GM_sf2_file;
  const overdrive = _tone_0290_Aspirin_sf2_file;
  const electric = _tone_0300_Chaos_sf2_file;
  const acousticString = '_tone_0253_GeneralUserGS_sf2_file';
  const cleanString = '_tone_0270_FluidR3_GM_sf2_file';
  const overdriveString = '_tone_0290_Aspirin_sf2_file';
  const electricString = '_tone_0300_Chaos_sf2_file';
  const ContextFunction = window.AudioContext || window.webkitAudioContext;
  const context = new ContextFunction();
  const acousticPlayer = new WebAudioFontPlayer();
  acousticPlayer.loader.decodeAfterLoading(context, acousticString);
  const cleanPlayer = new WebAudioFontPlayer();
  cleanPlayer.loader.decodeAfterLoading(context, cleanString);
  const overdrivePlayer = new WebAudioFontPlayer();
  overdrivePlayer.loader.decodeAfterLoading(context, overdriveString);
  const electricPlayer = new WebAudioFontPlayer();
  electricPlayer.loader.decodeAfterLoading(context, electricString);
  let player = acousticPlayer;

  // get the chord list element and make it so that clicking on an element changes the frets so that they match the particular chord
  const chords = document.getElementById('createdchords');
  chords.onclick = function () {
    setChords(this);
  }
  function setChords (chord) {
    // get the notes of the chord as a string
    const myChordSelected = $('option:selected', chord).val();
    const myChord = myChordSelected.split(',');
    // set the fret of each string to the fret of the chord
    for (let x = 0; x < 6; x++) {
      const string = document.getElementById('string' + x);
      string.value = myChord[x];
    }
  }

  if (chords !== null) { // intializes the shown chord to be the first chord in the list
    $(document.getElementById('chordnum0')).prop('selected', true);
    setChords(document.getElementById('createdchords'));
  }

  const submit = document.getElementById('viewChord'); // display the diagram when the viewChord button is clicked
  submit.onclick = function () {
    displayChord();
  }

  const strumchord = document.getElementById('strum'); // play the audio of the chord when the strum chord button is clicked
  strumchord.onclick = function () {
    playChord(true);
  }
  const arppegiochord = document.getElementById('arppegio'); // play the audio of the chord when the arppegio chord button is clicked
  arppegiochord.onclick = function () {
    playChord(false);
  }
  function playChord (isStrum) {
    const notes = [];
    // get the notes of the chord
    for (let x = 0; x < 6; x++) {
      const string = document.getElementById('string' + x).value;
      if (string !== 'X') {
        const note = string.split('/')[0];
        notes.push(12 + alphaToNum(note)); // the number system i am using for the notes is 12 less than the sound program, so I add 12 to make up for the difference
      }
    }
    if (notes.length !== 0) { // if there is at least one note, than play the chord
      const toneType = $('option:selected', $('#tonetype')).val(); // get the type of tone to play the chord with
      let guitarTone = null;
      // sets the player to the right tone
      switch (Number(toneType)) {
        case 0:
          player.cancelQueue(context);
          guitarTone = acoustic;
          player.cancelQueue(context);
          player = acousticPlayer;
          break;
        case 1:
          player.cancelQueue(context);
          guitarTone = clean;
          player.cancelQueue(context);
          player = cleanPlayer;
          break;
        case 2:
          player.cancelQueue(context);
          guitarTone = overdrive;
          player = overdrivePlayer;
          break;
        case 3:
          player.cancelQueue(context);
          guitarTone = electric;
          player = electricPlayer;
          break;
        default:
          player.cancelQueue(context);
          guitarTone = acoustic;
          player.cancelQueue(context);
          player = acousticPlayer;
          break;
      }

      player.cancelQueue(context);
      // either strums or arpeggiates all of the notes
      if (isStrum) {
        player.queueStrumDown(context, context.destination, guitarTone, context.currentTime, notes, 3);
      } else {
        const startTime = context.currentTime;
        for (let l = 0; l < notes.length; l++) {
          player.queueStrumDown(context, context.destination, guitarTone, startTime + 3 * l / 4 + 0.1, [notes[l]], 2);
        }
      }
    }
  }

  // gets the number value of a note
  function alphaToNum (note) {
    const oct = parseInt(note.substring(note.length - 1));
    const noteValue = oct * 12;
    const alpha = note.substring(0, note.length - 1);
    switch (alpha) {
      case 'A':
        return noteValue + 9;
      case 'A#':
        return noteValue + 10;
      case 'B':
        return noteValue + 11;
      case 'C':
        return noteValue;
      case 'C#':
        return noteValue + 1;
      case 'D':
        return noteValue + 2;
      case 'D#':
        return noteValue + 3;
      case 'E':
        return noteValue + 4;
      case 'F':
        return noteValue + 5;
      case 'F#':
        return noteValue + 6;
      case 'G':
        return noteValue + 7;
      case 'G#':
        return noteValue + 8;
      default:
        return false;
    }
  }
  function displayChord () { // create a diagram for the chord
    const notes = [6];
    const frets = [6];
    let minFret = 100;
    let maxFret = -1;
    for (let x = 0; x < 6; x++) { // gets all of the notes in the chord and finds the highest and lowest fret in it
      const string = document.getElementById('string' + x).value;
      if (string !== 'X') {
        const holder = string.split('/');
        notes[x] = holder[0];
        frets[x] = holder[1];
        const fret = parseInt(frets[x]);
        if (fret > maxFret) {
          maxFret = parseInt(frets[x]);
        }
        if (fret !== 0 && fret < minFret) {
          minFret = fret;
        }
      } else {
        notes[x] = 'X';
        frets[x] = 0;
      }
    }
    let chordLength = maxFret - minFret;
    if (chordLength < 4) { // this makes sure that the digram shows at least 4 frets
      chordLength = 3;
    }
    if (maxFret < 4) { // if the max fret is less than 4 than the just assume the min fret is the first fret for displaying purposes
      minFret = 1;
    }
    const c = document.getElementById('fretboard'); // get canvas element
    c.height = chordLength * 60 + 160; // set the height to fit all of the needed frets
    c.width = 300;
    const height = c.height;
    const brush = c.getContext('2d');
    brush.fillStyle = '#670A0A'; // brown
    brush.clearRect(0, 0, c.width, c.height); // clear out the canvas
    brush.fillRect(51, 51, 199, height - 101); // makes the guitar neck
    brush.fillStyle = '#FDEEF4'; // pearl color
    for (let x = 0; x <= chordLength; x++) { // draws dots on the fretboard
      if ((minFret + x) % 2 === 1 && x !== 1 - minFret && (x !== (11 - minFret) && x !== (13 - minFret)) && (x !== (23 - minFret)) && (x !== (25 - minFret))) {
        brush.beginPath();
        brush.arc(150, 80 + 60 * x, 10, 0, 2 * Math.PI);
        brush.fill();
      } else if ((minFret + x) === 12 || (minFret + x) === 24) {
        brush.beginPath();
        brush.arc(80, 80 + 60 * x, 10, 0, 2 * Math.PI);
        brush.fill();
        brush.beginPath();
        brush.arc(220, 80 + 60 * x, 10, 0, 2 * Math.PI);
        brush.fill();
      }
    }

    brush.fillStyle = '#670A0A'; // brown fill color
    brush.font = '14px Courier New'; // draws strings
    brush.strokeStyle = '#D8D8D8'; // light silver for frets
    brush.lineWidth = 4;
    brush.beginPath();
    for (let h = 110; h <= height - 50; h = h + 60) { // draws the frets
      brush.moveTo(49, h);
      brush.lineTo(251, h);
    }
    brush.stroke();

    brush.closePath();

    brush.strokeStyle = '#C0C0C0'; // dark silver for strings
    for (let w = 63; w < 260; w = w + 35) {
      brush.lineWidth = 6 - w / 62;
      brush.beginPath();

      brush.moveTo(w, 50);
      brush.lineTo(w, height - 49);

      brush.stroke();
      brush.closePath();
    }
    brush.beginPath();
    brush.strokeStyle = '#000000'; // light silver for frets
    brush.lineWidth = 6;
    brush.moveTo(48, 48);
    brush.lineTo(252, 48);
    brush.stroke();
    brush.closePath();
    brush.lineWidth = 2;
    brush.strokeStyle = '#e9ecef'; // makes it pink for drawing fretted notes
    for (let x = 0; x < 6; x++) {
      let fretdst = 0;
      if (parseInt(frets[x]) !== 0) { // this sets the distance from the top of the diagram to the fret
        fretdst = 1 + parseInt(frets[x]) - minFret;
      }
      if (fretdst !== 0) {
        brush.fillRect(59 + 35 * x, 5 + 60 * fretdst, 8, 30); // if it is not an open string than remove the string from where the fret bubble will go
      }
      // draw bubble for note and write the note name in the bubble
      brush.beginPath();
      brush.arc(63 + 35 * x, 20 + 60 * fretdst, 15, 0, 2 * Math.PI);
      brush.stroke();
      brush.closePath();
      brush.fillStyle = '#e9ecef';
      if (notes[x].length > 2) {
        brush.fillText(notes[x], 50 + 35 * x, 25 + 60 * fretdst, 30);
      } else {
        brush.fillText(notes[x], 57 + 35 * x, 25 + 60 * fretdst, 30);
      }
      brush.fillStyle = '#670A0A';
    }
    // this labels the which fret the lowest fret in the diagram is
    let fretNum = minFret + 'th';
    switch (minFret) {
      case 1:
        fretNum = '1st';
        break;
      case 2:
        fretNum = '2nd';
        break;
      case 3:
        fretNum = '3rd';
        break;
      default:
        break;
    }

    brush.fillStyle = '#e9ecef';
    brush.fillText(fretNum + ' Fret', 1, 100, 45);
    brush.fillStyle = '#670A0A';
  }
});
