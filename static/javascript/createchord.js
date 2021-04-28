'use strict';
$(document).ready(function () {
  // when the submit button is pressed this quickly selects all of the notes to be played so that the python program can retrieve their values
  const sub = document.getElementById('submit');

  sub.onclick = function () {
    $('#usedNotes option').prop('selected', true);
  }

  const notes = document.getElementById('note');
  const notesForUse = document.getElementById('usedNotes');

  // when a note is clicked on it adds it to the list of notes to be used, if there are not already 6 of them
  notes.onclick = function () {
    const numNotes = $('#usedNotes option').length;
    if (numNotes < 6 && $('#note option:selected').text() !== '') {
      const option = document.createElement('option');
      option.text = $('#note option:selected').text();
      option.value = notes.value;
      option.id = 'note' + numNotes;
      $(option).attr('name', option.id);
      notesForUse.add(option);
    }
  }

  // when a notes for use is clicked on, it is deleted
  notesForUse.onclick = function () {
    let counter = $(this).children(':selected').attr('id');
    counter = counter.substring(4);
    $('option:selected', this).remove();

    // Each note element is named noteX where X is the number it is in the list. the following method updates the names so the number reflects their new position
    $('#usedNotes option').each(function (n, newnote) {
      if (n >= counter) {
        newnote.id = 'note' + counter;
        $(newnote).attr('name', newnote.id);
        counter++;
      }
    });
  }
});
