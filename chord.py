from fret import Fret
class  Chord:
    def __init__(self, frets):
        self.frets = list(frets)
        self.score = 0
        self.numNotes=0
        self.bass =0 
        empty_note = Fret(-1,-1,-1,-1)
        for fret in frets:    #get the number of actual notes in the chord
            if fret is not None and fret.fret != -1:   
                self.numNotes += 1
        self.calcScore()   # this will give a score on how good the chord is, lower is better
    def calcScore (self):
        self.score =0
        blankSpaceCount =0
        high =-1    #this will store the highest note by fret number
        low = 31   #this will store the lowest note   by fret numebr
        lastString = -1   # this will keep track which was the last string to have a note on it for determining a gap between notes
        for x in range (0, 6):
            thisfret = self.frets[x]
            if thisfret is not None and thisfret is not 'X':
                self.score += thisfret.distToTarg   #adds the distance from target to the score
                if lastString>=0:
                    self.score += 4*blankSpaceCount   # this adds points if there are muted strings between freted strings, as the muted strings add difficulty
                if (high <thisfret.fret):
                    high = thisfret.fret
                if (low >thisfret.fret and 0 != thisfret.fret):
                    low = thisfret.fret
                blankSpaceCount =0   #reset blank space as this string is fretted
                if lastString>=0:
                    fretGap = abs (thisfret.fret - self.frets[lastString].fret)  #get the distance between this fret and the previous fret 
                    if (thisfret.fret !=0 and self.frets[lastString].fret != 0):  # makes sure that neither note is open, as open notes are easy to play
                        if (fretGap >=3):    # if the gap between note is large than add them to the score, as it becomes tricky to play
                            self.score += fretGap
                lastString = x
                    
            else:   # this string is muted
                blankSpaceCount+=1
        if high-low >=4:  #if the stretch between the highest and lowest fret is bigger than 4 than it is very difficult to play so make the score bigger
            self.score += 4*(high- low)
    def __cmp__ (self, other):   #compares the scores of the chords  
        if (self.__gt__(other)):
            return 1
        elif (self.score==other.score):
            return 0
        else:
            return -1
    def __eq__ (self, other):   # sees if the two chords have the same frets
        for x in range (0,6):
            if (self.frets[x] is None or other.frets[x] is None):
                if not (self.frets[x] is None and other.frets[x] is None):
                    return False
            elif  not (self.frets[x].__eq__( other.frets[x])):
                return False
        return True

    def __lt__ (self, other):  #compares scores
        return self.score < other.score
    def __gt__ (self, other): #compares scores
        return self.score > other.score
        
    def __str__ (self):
        result = ""
        for fret in self.frets:
            if fret is not None:
                result += fret.note.alphaValue
            else:
                result +='X'
        return result
