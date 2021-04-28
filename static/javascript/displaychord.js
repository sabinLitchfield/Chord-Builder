'use strict';

$(document).ready(function () {
  // the following block sets up the players for guitar tones that the chords can be played in
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

  // sets the current chord as the inputed chord
  function setChords (chord) {
    const myChordSelected = $('option:selected', chord).val();
    const myChord = myChordSelected.split(',');

    for (let x = 0; x < 6; x++) {
      const string = document.getElementById('string' + x);
      string.value = myChord[x];
    }
  }

  // intializes the shown chord to be the first chord in the list
  if (chords !== null) {
    $(document.getElementById('chordnum0')).prop('selected', true);
    setChords(document.getElementById('createdchords'));
  }

  // display the diagram when the viewChord button is clicked
  const submit = document.getElementById('viewChord');
  submit.onclick = function () {
    displayChord();
  }
  
  // play the audio of the chord when the strum chord button is clicked
  const strumchord = document.getElementById('strum');
  strumchord.onclick = function () {
    playChord(true);
  }
  
  // play the audio of the chord when the arppegio chord button is clicked
  const arppegiochord = document.getElementById('arppegio');
    arppegiochord.onclick = function () {
    playChord(false);
  }

  /**
   * 
   * @param {number} toneType 
   * @returns {Object{zones:[]}} 
   * Loads in the tone type to context
   * 0 is acoustic
   * 1 is clean electric
   * 2 is overdriven electric
   * 3 is distorded electric
   */
  function loadGuitarTone(toneType){
    if (isNaN(toneType)){
      toneType = 0;
    }
    let guitarTone;

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
    return guitarTone;
  }

  /**
   * 
   * @returns {number[]} notes
   * This function reads in the current selected chord and returns an array of the notes
   */
  function getCurrentNotes(){
    const notes = [];

    // get the notes of the chord
    for (let x = 0; x < 6; x++) {
      const string = document.getElementById('string' + x).value;

      if (string !== 'X') {
        const note = string.split('/')[0];

        // the number system I am using for the notes is 12 less than the sound program, so I add 12 to make up for the difference
        notes.push(12 + alphaToNum(note)); 
      }
    }
    return notes;
  }

  /**
   * 
   * @param {boolean} isStrum
   * playChord will play the currently selected chord
   * isStrum determines if it is strummed or arpeggiated 
   */
  function playChord (isStrum) {
    const notes = getCurrentNotes();

    if (notes.length !== 0) {
      const guitarTone = loadGuitarTone($('option:selected', $('#tonetype')).val());
      
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

  /**
   * 
   * @param {String} note 
   * @returns {Number}
   * alphaToNum takes in the note and octave as a string and converts it to a number
   */
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

  /**
   * 
   * @param {Number[]} frets 
   * @returns {{Number, Number}}
   * getFretRange searches the array for the min and max fret that is used and returns the min and the range
   */
  function getFretRange(frets){
    let minFret = frets.filter(function (fret) { return fret !== 0; })
        .reduce(function (a, b) { return Math.min(a, b); }, 100); 
    let maxFret = Math.max(...frets);
    let chordLength = maxFret - minFret;

    // this makes sure that the digram shows at least 4 frets
    if (chordLength < 4) {
      chordLength = 3;
    }

    // if the max fret is less than 4 than the just assume the min fret is the first fret for displaying purposes
    if (maxFret < 4) {
      minFret = 1;
    }
    return {minFret, chordLength};
  }

  /**
   * 
   * @returns {{String[], Number[]}}
   * getNoteFretPairs leads in the current chord and returns what note and fret
   * each string is
   */
  function getNoteFretPairs(){
    const notes = [6];
    const frets = [6];

    for (let x = 0; x < 6; x++) {
      const string = document.getElementById('string' + x).value;

      if (string !== 'X') {
        const holder = string.split('/');
        notes[x] = holder[0];
        frets[x] = Number(holder[1]);
      } else {
        notes[x] = 'X';
        frets[x] = 0;
      }
    }
    return {notes, frets};
  }

  /**
   * 
   * @param {CanvasRenderingContext2D} brush 
   * @param {Number} minFret 
   * @param {Number} chordLength 
   * drawFretboardMarkers draws dots on odd frets not adjacent to 12 or draws 2 on multiples of 12
   */
  function drawFretboardMarkers(brush, minFret, chordLength){
    // sets the fill color to pearl
    brush.fillStyle = '#FDEEF4';

    for (let x = 0; x <= chordLength; x++) {
      const position = 80 + 60 * x;

      if ((minFret + x) % 2 === 1 && (x + minFret) % 12 !== 1 && (x + minFret) % 12 !== 11) {
        brush.beginPath();
        brush.arc(150, position, 10, 0, 2 * Math.PI);
        brush.fill();
      } else if ((minFret + x) % 12 === 0) {
        brush.beginPath();
        brush.arc(80, position, 10, 0, 2 * Math.PI);
        brush.fill();
        brush.beginPath();
        brush.arc(220, position, 10, 0, 2 * Math.PI);
        brush.fill();
      }
    }
    
    // resets the fill color to brown
    brush.fillStyle = '#670A0A';
  }

  /**
   * 
   * @param {CanvasRenderingContext2D} brush 
   * @param {Number} height 
   * drawFrets draws frets on the diagram
   */
  function drawFrets(brush, height){
    // light silver for frets
    brush.strokeStyle = '#D8D8D8';
    brush.lineWidth = 4;
    brush.beginPath();

    for (let h = 110; h <= height - 50; h = h + 60) {
      brush.moveTo(49, h);
      brush.lineTo(251, h);
    }
    brush.stroke();

    brush.closePath();
  }

  /**
   * 
   * @param {CanvasRenderingContext2D} brush 
   * @param {Number} height
   * drawStrings draws the guitar strings on the diagram
   */
  function drawStrings(brush, height){
    // dark silver for strings
    brush.strokeStyle = '#C0C0C0';

    for (let w = 63; w < 260; w = w + 35) {
      brush.lineWidth = 6 - w / 62;
      brush.beginPath();

      brush.moveTo(w, 50);
      brush.lineTo(w, height - 49);

      brush.stroke();
      brush.closePath();
    }
  }

  /**
   * 
   * @param {CanvasRenderingContext2D} brush
   * drawNut draws a black bar at the top of the fretboard
   */
  function drawNut(brush){
    brush.beginPath();

    // Black for nut
    brush.strokeStyle = '#000000';
    brush.lineWidth = 6;
    brush.moveTo(48, 48);
    brush.lineTo(252, 48);
    brush.stroke();
    brush.closePath();
  }

  /**
   * 
   * @param {CanvasRenderingContext2D} brush 
   * @param {Number[]} frets 
   * @param {String[]} notes 
   * @param {Number} minFret 
   * drawNotes draws the note in its respective place on the fretboard
   */
  function drawNotes(brush, frets, notes, minFret){
    brush.font = '14px Courier New';
    brush.lineWidth = 2;
    brush.strokeStyle = '#e9ecef';

    for (let x = 0; x < 6; x++) {
      let fretdst = 0;

      // this sets the distance from the top of the diagram to the fret
      if (parseInt(frets[x]) !== 0) {
        fretdst = 1 + parseInt(frets[x]) - minFret;
      }

      // if it is not an open string than remove the string from where the fret bubble will go
      if (fretdst !== 0) {
        brush.fillRect(59 + 35 * x, 5 + 60 * fretdst, 8, 30);
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
  }

  /**
   * 
   * @param {CanvasRenderingContext2D} brush 
   * @param {Number} minFret 
   * labels the first fret in the diagram
   */
  function labelMinFret(brush, minFret){
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

  /**
   * creates a diagram for the current chord
   */
  function displayChord () {
    const {notes, frets} = getNoteFretPairs();
    const {minFret, chordLength} = getFretRange(frets);

    // Initializes the diagram
    const c = document.getElementById('fretboard');
    c.height = chordLength * 60 + 160;
    c.width = 300;
    const brush = c.getContext('2d');

    // Sets the fill color to be brown
    brush.fillStyle = '#670A0A';
    brush.clearRect(0, 0, c.width, c.height);
    brush.fillRect(51, 51, 199, c.height - 101);

    drawFretboardMarkers(brush, minFret, chordLength);
    drawFrets(brush, c.height);
    drawStrings(brush, c.height);
    drawNut(brush);
    drawNotes(brush, frets, notes, minFret);
    labelMinFret(brush, minFret);
  }
});
