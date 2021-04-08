$(document).ready(function(){
    //when the submit button is pressed this quickly selects all of the notes to be played so that the python program can retrieve their values
    var sub = document.getElementById('submit'); 
    sub.onclick = function(){
	$('#usedNotes option').prop('selected', true);
    }
    var notes = document.getElementById("note");
    var notesForUse = document.getElementById("usedNotes");
    notes.onclick = function(){  //when a note is clicked on it adds it to the list of notes to be used, if there are not already 6 of them
	var numNotes = $('#usedNotes option').length;
	if(numNotes<6 && $("#note option:selected" ).text()!="")  //makes sure that there are less than 6 selected notes
	{
	    //add note to notes for use list
	    var temp =  document.createElement("option");
	    temp.text = $("#note option:selected" ).text();
	    temp.value = notes.value;
	    temp.id = "note"+numNotes;
	    $(temp).attr("name",  temp.id);
	    //alert ("note"+numNotes);
	    notesForUse.add(temp);
	    
	}
    }
    //when a notes for use is clicked on, it is deleted
    notesForUse.onclick = function (){
	var counter = $(this).children(":selected").attr("id");
	counter= counter.substring(4);
	$('option:selected', this).remove();
	//Each note element is named noteX where X is the number it is in the list. the following method updates the names so the number reflects their new position
	$("#usedNotes option").each (function(n, newnote)
				     {
					 if (n>=counter)
					 {
					     
					     newnote.id = "note"+counter;
					     $(newnote).attr("name", newnote.id);
					     counter++;
					 }
					 });
	    
    }
});
