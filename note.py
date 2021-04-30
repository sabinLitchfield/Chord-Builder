class Note:
    def __init__(self, value):
        self.numValue = value
        self.alphaValue = self.convertIntToAlpha(value)

    def toString(self):
        return self.alphaValue

    def convertIntToAlpha(self, value):
        if value == -1:  # muted note
            return "X"
        result = self.getLetter(value % 12)
        # if value is inbetween 0-11, I am using them as
        # generic notes, thus this keeps the octave off
        if value/12 != 0:
            result = result + str(int(value/12))
        return result

    def getLetter(self, value):
        # in music theory C is the first note of each octave,
        # thus c is 0 and each subsequent note is incremented
        if value == 0:
            return "C"
        elif value == 1:
            return "C#"
        elif value == 2:
            return "D"
        elif value == 3:
            return "D#"
        elif value == 4:
            return "E"
        elif value == 5:
            return "F"
        elif value == 6:
            return "F#"
        elif value == 7:
            return "G"
        elif value == 8:
            return "G#"
        elif value == 9:
            return "A"
        elif value == 10:
            return "A#"
        elif value == 11:
            return "B"
        else:
            return "X"
