class Fret:
    def __init__(self, fret, string, distToTarg, note):
        #This is an error note which means noting will be played on the string
        if(fret==-1):
            self.fret = -1
            self.string = -1
            self.distToTarg = 100
            self.note = -1
            return
        self.fret = fret        #fret number
        self.string = string    #String number
        if (fret ==0):
            self.distToTarg = distToTarg/2 # if the fret is 0 then it is easy to play no matter the target fret but it sounds out of place in chords built around the upper neck
        else:
            self.distToTarg = distToTarg     #The distance from the fret to the target fret
        self.note = note    #the note being played
    def numValue (self):
        return self.note.numValue      #get the note represented as a int
    def toString(self):
        if (self.fret ==-1):
            return "X"
        tempNote = str(self.note.alphaValue)
        tempFret = str(self.fret)
        return tempNote+"/"+tempFret    #returns the note and fret number
    def __gt__  (self, other):
        if (self.distToTarg == other.distToTarg):  # this will let the frets be sorted by fret number in the case that there is no target fret
            return self.fret > other.fret
                
        return self.distToTarg >other.distToTarg    #compares distance
    def __eq__ (self, other):
        self.fret == None
        other.fret == None
        return ((self.fret== other.fret) and (self.string == other.string))  #compare both the fre number and string number to determine if they are equal
