
$(document).ready(function(){
    // the following black sets up the players for guitar tones that the chords can be played in
    var acoustic =  _tone_0253_GeneralUserGS_sf2_file;
    var clean = _tone_0270_FluidR3_GM_sf2_file;
    var overdrive = _tone_0290_Aspirin_sf2_file;
    var electric = _tone_0300_Chaos_sf2_file;
    var guitarTone = acoustic;
    var acousticString = "_tone_0253_GeneralUserGS_sf2_file";
    var cleanString = "_tone_0270_FluidR3_GM_sf2_file";
    var overdriveString = "_tone_0290_Aspirin_sf2_file";
    var electricString = "_tone_0300_Chaos_sf2_file";
    var contextFunction =window.AudioContext || window.webkitAudioContext;;
    var context = new contextFunction ();
    var acousticPlayer = new WebAudioFontPlayer ();
	acousticPlayer.loader.decodeAfterLoading (context, acousticString);
    var cleanPlayer = new WebAudioFontPlayer ();
	cleanPlayer. loader.decodeAfterLoading (context, cleanString);
    var overdrivePlayer = new WebAudioFontPlayer ();
	overdrivePlayer. loader.decodeAfterLoading (context, overdriveString);
    var electricPlayer= new WebAudioFontPlayer ();
	electricPlayer.loader.decodeAfterLoading (context, electricString);
    var player = acousticPlayer; 

    //get the chord list element and make it so that clicking on an element changes the frets so that they match the particular chord
    var chords = document.getElementById("createdchords");
    chords.onclick = function (){
	setChords (this);
    }
    function setChords (chord)
    {
	//get the notes of the chord as a string
	var myChord = $('option:selected', chord).val();
	myChord = myChord.split(',');
	//set the fret of each string to the fret of the chord
	for (var x = 0; x <6; x++)
	{
	    var string = document.getElementById('string'+x);
	    string.value = myChord[x];
	}
    }
    
    if (chords!=null) //intializes the shown chord to be the first chord in the list
    {
	$(document.getElementById('chordnum0')).prop('selected', true);
	setChords (document.getElementById('createdchords'));
    }
    
    var submit = document.getElementById("viewChord");   //display the diagram when the viewChord button is clicked
    submit.onclick = function (){
	displayChord ();
    }


    
    var strumchord = document.getElementById("strum");    //play the audio of the chord when the strum chord button is clicked
    strumchord.onclick = function(){
	playChord(true);
    }
    var arppegiochord = document.getElementById("arppegio");    //play the audio of the chord when the arppegio chord button is clicked
    arppegiochord.onclick = function(){
	playChord(false);
    }
    function playChord (isStrum){
	var frets = [6];
	var notes = [];
	//get the notes of the chord 
	for (var x = 0; x <6; x++)
	{
	    var string = document.getElementById('string'+x).value;
	    if (string != "X")
	    {
		note = string.split("/")[0];
		notes.push(12+ alphaToNum (note));  //the number system i am using for the notes is 12 less than the sound program, so I add 12 to make up for the difference
	    }
	}
	if(notes.length!=0)  //if there is at least one note, than play the chord
	{
	    var toneType = $('option:selected', $("#tonetype")).val();   // get the type of tone to play the chord with
	    //sets the player to the right tone
	    if (toneType ==0 )
	    {
		
		player.cancelQueue(context);
		guitarTone = acoustic;
		player.cancelQueue(context);
		player = acousticPlayer
	    }
	    else if (toneType ==1 )
	    {
		
	    player.cancelQueue(context);
		guitarTone = clean;
		player.cancelQueue(context);
		player == cleanPlayer
	    }
	    else if (toneType ==2)
	    {
		player.cancelQueue(context);
		guitarTone = overdrive;
		player = overdrivePlayer;
	    	
	    }
		     
	    else if (toneType==3 )
	    {
		
	    player.cancelQueue(context);
		guitarTone = electric;
		player = electricPlayer;
	    }
	    
	    player.cancelQueue(context);
	    //strums all of the notes
	    if (isStrum)
	    {
		player.queueStrumDown(context, context.destination, guitarTone, context.currentTime, notes, 3);
	
	    }
	    //arpeggiates the chord
	    else
	    {
	    var startTime = context.currentTime;
	    for (var l = 0;  l<notes.length; l++)
	    {
		player.queueStrumDown(context, context.destination, guitarTone, startTime+3*l/4+.1, [notes[l]], 2);
	    }
	    //player.queueStrumDown(context, context.destination, guitarTone,startTime+ 3*notes.length/4, notes, 3);
	    }
	}
    }
    //gets the number value of a note
    function alphaToNum( note)
    {
	oct = parseInt(note.substring (note.length-1));
	noteValue = oct*12;
	alpha = note.substring (0, note.length-1);
	if (alpha=="A")
	    return noteValue+9;
	else if (alpha=="A#")
	    return noteValue+10;
	else if (alpha=="B")
	    return noteValue+11;
	else if (alpha=="C")
	    return noteValue;
	else if (alpha=="C#")
	    return noteValue+1;
	else if (alpha=="D")
	    return noteValue+2;
	else if (alpha=="D#")
	    return noteValue+3;
	else if (alpha=="E")
	    return noteValue+4;
	else if (alpha=="F")
	    return noteValue+5;
	else if (alpha=="F#")
	    return noteValue+6;
	else if (alpha=="G")
	    return noteValue+7;
	else if (alpha=="G#")
	    return noteValue+8;
	return false;
    }
    function displayChord (){  //create a diagram for the chord
	var notes = [6];
	var frets = [6];
	var minFret = 100;
	var maxFret = -1;
	for (var x = 0; x <6; x++) // gets all of the notes in the chord and finds the highest and lowest fret in it
	{
	    var string = document.getElementById('string'+x).value;
	    if (string != "X")
	    {
		
		holder = string.split("/");
		notes[x] = holder[0];
		frets[x] = holder[1];
		var fret = parseInt(frets[x]);
		if(fret >maxFret)
 		{
		    maxFret = parseInt(frets[x]);}
		if (fret!=0 && fret<minFret)
		{minFret = fret;}
	    }
	    else
	    {
		notes[x] = "X";
		frets[x] = 0;
	    }
	}
	var chordLength = maxFret - minFret;
	if (chordLength<4)  //this makes sure that the digram shows at least 4 frets
	{chordLength = 3;}
	if (maxFret <4)  // if the max fret is less than 4 than the just assume the min fret is the first fret for displaying purposes
	{
	    minFret = 1;
	}
	var c = document.getElementById("fretboard");  // get canvas element
	c.height = chordLength*60 + 160 ;   // set the height to fit all of the needed frets
	c.width = 300;
	height = c.height;
	var brush = c.getContext("2d");   
	brush.fillStyle = "#670A0A";    //brown
	brush.clearRect(0,0, c.width, c.height);   //clear out the canvas 
	brush.fillRect(51, 51, 199, height-101);  //makes the guitar neck
	brush.fillStyle = "#FDEEF4";    //pearl color
	for( var x = 0; x<= chordLength; x++)  //draws dots on the fretboard
	{
	    
	    if ((minFret+x)%2 ==1 && x!=1-minFret && (x!=(11-minFret) && x!=(13-minFret)) &&(x!=(23-minFret)) &&(x!=(25-minFret))) 
	    {
		brush.beginPath ();
		brush.arc (150, 80 + 60*x, 10, 0, 2*Math.PI);
		brush.fill ();
	    }
	    else if ((minFret+x)==12 ||(minFret+x)==24)
	    {
		brush.beginPath ();
		brush.arc (80, 80 + 60*x, 10, 0, 2*Math.PI);
		brush.fill ();
		brush.beginPath ();
		brush.arc (220, 80 + 60*x, 10, 0, 2*Math.PI);
		brush.fill ();
	    
	    	
	    }
	}
	
	brush.fillStyle = "#670A0A";  //brown fill color 
	brush.font = "14px Courier New";	//draws strings 
	brush.strokeStyle = "#D8D8D8"; //light silver for frets
	brush.lineWidth = 4;
	brush.beginPath();
	for (var h = 110; h<= height-50; h = h+60)  //draws the frets
	{
	    brush.moveTo (49, h);
	    brush.lineTo (251, h);
	   }
	 brush.stroke ();
	
 	brush.closePath();
	
	brush.strokeStyle = "#C0C0C0"; //dark silver for strings
	for (var w = 63; w < 260; w= w+35)
	{
	    brush.lineWidth =6 - w/62;
	    brush.beginPath ();
	
	    brush.moveTo (w, 50);
	    brush.lineTo (w, height-49);
	    
	brush.stroke ();
	brush.closePath();
	}
	brush.beginPath();
	brush.strokeStyle = "#000000"; //light silver for frets
	brush.lineWidth = 6;
	brush.moveTo (48, 48);
	brush.lineTo (252, 48);
	brush.stroke();
	brush.closePath();
	brush.lineWidth = 2;
	brush.strokeStyle = "#e9ecef";  // makes it pink for drawing fretted notes
	for (var x = 0; x<6; x++)
	{
	    var fretdst = 0;
	    if (parseInt (frets[x]) != 0) // this sets the distance from the top of the diagram to the fret 
	    {
	    fretdst =  1+ parseInt(frets[x]) - minFret;

	    }
	    if (fretdst !=0)
	    {
		    brush.fillRect(59+ 35*x, 5 + 60*fretdst, 8, 30);   //if it is not an open string than remove the string from where the fret bubble will go
	    }
	    //else
//		brush.clearRect(40 + 40*x, 5 + 60*fretdst, 5, 30);
	    //draw bubble for note and write the note name in the bubble
	    brush.beginPath ();
	    brush.arc (63+ 35*x, 20 + 60*fretdst, 15, 0, 2*Math.PI);
	    brush.stroke ();
	    brush.closePath();
	    brush.fillStyle = "#e9ecef";
	    if (notes[x].length>2)
	    {
		brush.fillText (notes[x], 50 +35 *x, 25 + 60*fretdst, 30);
	    }
	    else
	    {
		brush.fillText (notes[x], 57 +35 *x, 25 + 60*fretdst, 30);
	    }
		brush.fillStyle = "#670A0A";
	
	}
	//this labels the which fret the lowest fret in the diagram is 
	var fretNum = minFret +"th";
	if(minFret ==1)
	    fretNum = "1st";
	else if (minFret == 2)
	    fretNum = "2nd";
	else if (minFret == 3)
	    fretNum = "3rd";
	
	brush.fillStyle = "#e9ecef";
	brush.fillText (fretNum+" Fret", 1, 100, 45);
	brush.fillStyle = "#670A0A";
    }
    
});
