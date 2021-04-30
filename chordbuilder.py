from jsonpickle import encode
from jsonpickle import decode
from flask import Flask
from flask import abort, redirect, url_for
from flask import request
from flask import render_template
from flask import session
import logging
from logging.handlers import RotatingFileHandler
from logging import Formatter
from note import Note
from fret import Fret
from chord import Chord
import sys
import time
import heapq
app = Flask(__name__)


@app.route('/')
def index():
    app.logger.debug('running')
    return redirect(url_for('GuitarSetup'))


@app.route('/GuitarSetup', methods=['POST', 'GET'])
def GuitarSetup():
    error = None
    app.logger.debug("start setup")
    # The user has submitted their tuning and num of frets,
    # so save and go to chordBuilder
    if 'submitSetup' in request.form:
        # do stuff
        for x in range(0, 6):
            # save the tuning of each string as a variable
            temp = str(x)+'String'
            session[temp] = encode(request.form[temp])
        session['numFrets'] = request.form['numFrets']
        # go to create chord page
        return redirect(url_for('createChord'))
    # tuningNotes will hold the list of Note objects from
    # a range of values which the user may want to tune their strings to
    tuningNotes = []
    for x in range(16, 65):
        tuningNotes.append(Note(x))
    # this creates a list of which note each string should be at
    # for standard tuning, so it can anchor them in the list
    standard = []
    standard.append(52)
    standard.append(47)
    standard.append(43)
    standard.append(38)
    standard.append(33)
    standard.append(28)
    return render_template('setup.html', **locals())


@app.route('/errorPage', methods=['POST', 'GET'])
def errorPage():  # something went wrong if the user gets here
    if('reset' in request.form):
        session.clear()  # remove all session variables
        return redirect(url_for('GuitarSetup'))  # go back to guitar setup
    return render_template('errorpage.html', **locals())


@app.route('/createChord', methods=['POST', 'GET'])
def createChord():
    error = None
    try:
        app.logger.debug('enter createChord')
        # return to guitar setup
        if('changeTuning' in request.form):
            session.clear()  # remove all session variables
            return redirect(url_for('GuitarSetup'))  # go back to guitar setup
        # Go to display chord page
        if ('submitChord' in request.form):
            usedNotes = request.form.getlist(
                'usedNotes')  # get notes from page
            for n in range(0, len(usedNotes)):
                # store notes as session variable
                session['usedNotes'+str(n)] = usedNotes[n]
            session['targetFret'] = request.form['targetFret']
            if 'isBass' in request.form:
                session['isBass'] = True
            else:
                session['isBass'] = False
            # redirect to display chord
            return redirect(url_for('displayChord'))

        numFrets = int(session['numFrets'])
        lowString = 120
        # high and low string will be used to determine the
        # highest and lowest string's note
        highString = 0
        tuning = []  # list to store the tuning in
        notes = []  # list to store all of  the possible notes in
        for x in range(0, 6):
            # get tuning of string x
            tuning.append(Note(int(decode(session[str(x)+'String']))))
            # if its value is less than low string then
            # this is the new lowest string
            if (lowString > tuning[x].numValue):
                lowString = tuning[x].numValue
            # if its value is larger than high string then
            # this is the new highest string
            if (highString < tuning[x].numValue):
                highString = tuning[x].numValue
        # the highest possible note to play in the particular setup
        # is the note of the highest tuned string plus
        # the number of frets on the guitar
        highNote = highString + numFrets
        session['highNote'] = highNote
        session['lowString'] = lowString

        # these two for loops add the generic notes in
        # alphabetical order as c is 0 in music
        for x in range(9, 12):
            notes.append(Note(x))
        for x in range(0, 9):
            notes.append(Note(x))
            # lowString to highNote is the range of possible notes to play
        for x in range(int(lowString), 1+int(highNote)):
            notes.append(Note(x))
            # render the page
        return render_template('createchord.html', **locals())
    except:
        # there is an error on the page so redirect back to guitar setup
        return redirect(url_for('errorPage'))


@app.route('/displayChord', methods=['POST', 'GET'])
def displayChord():
    print("here")
    # try:
    print("In try")
    if('changeTuning' in request.form):
        session.clear()  # remove session variables
        # go back to guitar set up page
        return redirect(url_for('GuitarSetup'))
    if('changeNotes' in request.form):
        # remove some specific variables from
        # sesson as they are no longer needed
        session.pop('targetFret', None)
        session.pop('highNote', None)
        session.pop('lowString', None)
        session.pop('isBass', None)
        for n in range(0, 6):
            if(session.get('usedNotes'+str(n))):
                # get notes from session
                session.pop('usedNotes'+str(n), None)

        # go back to create chord page
        return redirect(url_for('createChord'))
    # this makes sure nothing happens in python when
    # clicking on the button that displays the chord diagram
    if ('viewChord' not in request.form):
        app.logger.debug('In displayChord')
        targetFret = session['targetFret']  # get the target fret
        notes = []  # list for storing the notes being used
        getNotes = []    # list to store raw data about the notes being used
        fretsOnStrings = []  # list of all the frets that can be played
        print("Post init")
        numFrets = int(session['numFrets'])
        highNote = int(session['highNote'])
        lowString = int(session['lowString'])
        isBass = bool(session['isBass'])
        chords = []  # this will hold the final chords
        tuning = []  # list for the tuning
        print("post get data")
        for x in range(0, 6):
            # get tuning
            tuning.append(Note(int(decode(session[str(x)+'String']))))
        for n in range(0, 6):
            if(session.get('usedNotes'+str(n))):
                # get notes from session
                getNotes.append(session['usedNotes'+str(n)])
        print("Post second for")
        for x in getNotes:
            # get all of the notes
            print("Note "+str(x))
            notes.append(Note(int(x)))
        del getNotes[:]  # delete the get notes as it is no longer needed
        print("Post dele")
        # make frets on strings 2D with 6 rows so
        # each row can store a different string
        for x in range(0, 6):
            temp = []
            fretsOnStrings.append(temp)
        print("end for")
        start = time.time()
        # method to create the chords
        rawChords = chordCreate(notes, tuning, numFrets, int(
            targetFret), lowString, highNote, fretsOnStrings, isBass)
        end = time.time()
        runtim = end-start
        # prints the amount of time it took to create the chord
        app.logger.debug('it took '+str(runtim)+' to create chord')
        # isPossible is a boolean that says whether
        # the notes can be made into a chord
        isPossible = True
        # this means no chords could be created
        # so set isPossible to false
        if (
            rawChords[0].frets[0] is not None and
            rawChords[0].frets[0].fret == -1
        ):
            isPossible = False
            # empty rawChords so the following for loop does not execute
            rawChords = []

        # takes each chord object and converts
        # them into a string with the notes being
        # separated by a comma so that javascript
        # can easily read the data
        for rawChord in rawChords:
            chord = ""
            for x in range(1, 7):
                if (chord != ""):  # only adds a comma after each note
                    chord += ","
                # no notes on this string so use x to represent muted string
                if rawChord.frets[6-x] is None:
                    chord += "X"
                else:  # add the note
                    chord += rawChord.frets[6-x].toString()
            chords.append(chord)  # add finalized chord to chords list
        tempFrets = []
        for fretOnString in fretsOnStrings:
            # sorts the frets of the notes that can be played on a string
            # by the distance from the fret to the target fret
            sortStuff(fretOnString)
            # add a muted note to the beginning of the list
            tempFrets.append([Fret(-1, -1, -1, -1)]+fretOnString)
        fretsOnStrings = tempFrets
        # display chord page
        return render_template('displaychord.html', **locals())
    # except:
    #   return redirect(url_for('errorPage'))  #go back to guitar set up page


# controller method for creating the chords
def chordCreate(notes, tuning, numFrets, targetFret,
                low, high, fretsOnStrings, isBass):
    app.logger.debug('in chordCreate')
    # list that will hold all of the possible frets that
    # can be played with the given notes
    allFrets = []
    for note in notes:
        # returns the frets that each note can be played on
        frets = getFrets(note, tuning, numFrets, targetFret, low, high)
        frets = sortStuff(frets)  # sort the frets by distance to the target
        for fret in frets:
            # makes sure not to add duplicate frets
            # if the user say has two of the same note
            if fret not in fretsOnStrings[fret.string]:
                # this will store all of the frets that
                # can be played on each string for the ui
                fretsOnStrings[fret.string].append(fret)
        allFrets.append(frets)
    strings = [None]*6  # create a 6 unit long list full of None
    baseChord = Chord(strings)  # This is a chord with no notes in it
    bestChords = []    # stores the five best chords
    allChords = []     # stores all of the chords that get created in method
    # creates chords that each hold only one fret of the first note
    if (len(allFrets) > 0):
        for fret in allFrets[0]:  # get each possible fret of the first note
            # add the fret of the first note to the baseChord
            baseChord.frets[fret.string] = fret
            # create a new chord with the strings
            tempChord = Chord(baseChord.frets)
            if (bool(isBass)):
                # if the user wants to use a bass note this will set it,
                # it is intialized to 0 otherwise
                tempChord.bass = fret.note.numValue
            heapq.heappush(allChords, tempChord)  # heap push it to allChords

            # remove the fret so that the chord is empty again
            baseChord.frets[fret.string] = None
        # this is the method that finds the best chords
        closestChord(allFrets, bestChords, allChords)
    if len(bestChords) >= 1:  # this means at least one chord was found
        return bestChords
    # The chord is not possible to make
    errorStrings = []
    for x in range(0, 6):
        errorStrings.append(Fret(-1, -1, 100, Note(0)))
    bestChords.append(Chord(errorStrings))
    # returns an array holding only one chord with no notes in it
    return bestChords


def closestChord(allFrets, bestChords, allChords):
    # this method is basically a rough adaptation of
    # how I remembered the shorest path algorithm.
    # Each level of recursion that a chord goes down
    # adds another note to it. If best chords have
    # 5 chords in it then the best 5 chords have been made,
    # so exit and if allchords is empty then
    # all combinations have been tried to exit
    if((len(bestChords) == 5) or (len(allChords) == 0)):
        return
    # get the chord with the lowest score from heap
    chord = heapq.heappop(allChords)
    # if the chord holds all of the notes in it then it is finished
    if(len(allFrets) <= chord.numNotes):
        # this for loop sees if the finished
        # chord is a duplicate, if so move on
        for x in range(0, len(bestChords)):
            if chord.__eq__(bestChords[x]):
                # continue recursion
                closestChord(allFrets, bestChords, allChords)
                return  # tail recursion
        bestChords.append(chord)  # add the finished chord to the list
        closestChord(allFrets, bestChords, allChords)   # continue recursion
        return  # tail recursion
    numNotes = chord.numNotes  # finds which note the chord is on
    # the loop gets the frets of the next note to be
    for y in range(0, len(allFrets[numNotes])):
        # makes sure that the string that the fret is on is not in use
        if (chord.frets[allFrets[numNotes][y].string] is None):
            # this makes sure the note being added
            # is not lower than the bass note
            if (chord.bass <= allFrets[numNotes][y].note.numValue):
                # add fret to chord
                chord.frets[allFrets[numNotes]
                            [y].string] = allFrets[numNotes][y]
                # create a new chord to add the new fret onto
                tempChord = Chord(chord.frets)
                tempChord.bass = chord.bass   # set the bass note of new chord
                # creates a new chord using the base chord's notes so that
                # the base chord can be altered without altering the new chord
                # Push it onto the heap
                heapq.heappush(allChords, tempChord)

                # remove the fret from the base chord so that other
                # frets on the note can be added to the chord
                chord.frets[allFrets[numNotes][y].string] = None
    closestChord(allFrets, bestChords, allChords)  # continue recursion

    return  # tail recursion


def getFrets(note, tuning, numFrets, targetFret, low, high):
    frets = []
    if (note.numValue > 11):
        for x in range(0, 6):
            # the note value- the tuning value will
            # give the fret number the note is on
            temp = note.numValue-tuning[x].numValue
            # if the fret is on the fretboard add it to the list,
            # otherwise skip it
            if (temp >= 0 and temp <= numFrets):
                # if the target fret is -1 then the user does not care which
                # fret the chord is built around, thus the dist to target
                # should be 0 as it is not a factor in how good the chord is
                if targetFret == -1:
                    frets.append(Fret(temp,  x, 0, note))
                else:
                    # the target fret is being used, so give actual distance
                    frets.append(Fret(temp,  x, abs(temp-targetFret), note))
    else:
        # this means the note is generic (ie the octave is not specified)
        # so it gets the frets of all of the octaves that can be played
        temp = note.numValue
        while temp <= high:
            if temp >= low:
                # get the frets of a spefic octave of the note
                tempFrets = getFrets(Note(temp), tuning,
                                     numFrets, targetFret, low, high)
                frets.extend(tempFrets)  # add the frets to the overall list
            temp += 12  # go to next octave
    return frets


def sortStuff(stuffs):  # generic insertion sorting method
    length = len(stuffs)
    for x in range(1, length):
        currentValue = stuffs[x]
        position = x
        while (position > 0 and stuffs[position-1].__gt__(currentValue)):
            stuffs[position] = stuffs[position-1]
            position -= 1
        stuffs[position] = currentValue
    return stuffs

    # legacy code
if __name__ == "__main__":
    app.secret_key = 'A0Zr98j/3yX R~XHH!jmN]LWX/,?RT'
    streamhandler = logging.StreamHandler(sys.stderr)
    streamhandler.setLevel(logging.DEBUG)
    streamhandler.setFormatter(
        Formatter(
            "[%(filename)s:%(lineno)s - %(funcName)10s() ] %(message)s"
        ))
    app.logger.addHandler(streamhandler)
    app.logger.setLevel(logging.DEBUG)
    app.run(host='localhost')
