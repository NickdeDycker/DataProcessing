__author__ = 'Nick'
import time
import matplotlib.pyplot as plt
from collections import OrderedDict
import numpy


class DataSelector(object):
    """ Handles a specific dataset. """

    def __init__(self, dataType, path=''):
        """
        :param dataType: Dataset to be opened (string)
        :param extension: File to be opened, set on .txt (string)
        """

        if not isinstance(dataType, str):
            raise ValueError, "dataType expected string, got {0}".format(type(dataType))

        self.dataType = dataType
        self.folder = "{0}\\".format(dataType)
        self.fID = "{0}_STAID0".format(dataType)
        self.fExtension = ".txt"
        self.elements = None
        self.path = path
        self.sources = None
        self.stations = None
        self.files = []

    def getElements(self):
        """ Retrieve the element file of the dataset. """
        if self.elements is None:
            self.elements = FileOpener("elements", "ELEID", self.dataType)

    def getSources(self):
        """ Retrieve the sources file of the dataset. """
        if self.sources is None:
            self.sources = FileOpener("sources", "STAID", self.dataType)

    def getStations(self):
        """ Retrieve the stations file of the dataset. """
        if self.stations is None:
            self.stations = FileOpener("stations", "STAID", self.dataType)

    def getSingleStation(self, stationID, **kwargs):
        """ Opens and read the file of a specific station for this dataset.
        :param stationID: ID of station (int, string)
        :param validity: Take only this quality measurement (int, tuple, list)(Optional)
        :param mindate: Date to start reading at (int, string)(Optional)
        :param maxdate:Date to end reading at (int, string)(Optional)
        """
        self.files.append(FileOpener(stationID, "STAID", self.dataType, self.path, **kwargs))
        return self.files[-1]

    def wipe(self):
        """ Clean the object to preserve memory. """
        self.elements = None
        self.sources = None
        self.stations = None
        self.files = []

    def wipe_files(self):
        """ Clean all station specific data. """
        self.files = []


class FileOpener(DataSelector):
    """ Handles opening, reading and loading a single file of the KNMI dataset. """

    def __init__(self, f, startID, *args, **kwargs):
        super(FileOpener, self).__init__(*args)
        self.format = []
        self.text = []
        self.info = []
        self.data = {}
        self.columns = []
        self.startID = startID

        # Whether or not this is a file of a station or not.
        self.stationData = isinstance(f, int) or f.strip().isdigit()
        self.f = fixString(f, 5)

        # Check the kwargs possible arguments.
        if "val" in kwargs:
            self.validity = kwargs["val"]
            if isinstance(kwargs["val"], int):
                self.validity = (kwargs["val"],)
            elif isinstance(kwargs["val"], list):
                self.validity = tuple(kwargs["val"])
        else:
            self.validity = (0, 1, 9)

        self.mindate = 00000000
        self.maxdate = 99999999
        if "mindate" in kwargs:
            self.mindate = int(kwargs["mindate"])
        if "maxdate" in kwargs:
            self.maxdate = int(kwargs["maxdate"])

        self.fname = self.path + self.folder + str(self.f) + self.fExtension
        if self.stationData:
            self.fname = self.path + self.folder + self.fID + str(self.f) + self.fExtension

        self.read()

    def read(self):

        with open(self.fname) as f:
            elementLines = iter(f.readlines())
            read = False  # Preface or data
            format = False  # Formatting of the data

            for line in elementLines:

                # Handle preface.
                if not read:

                    if not format:
                        self.text.append(line)

                    if line[0:11] == "FILE FORMAT":
                        format = True
                        next(elementLines)
                        continue

                    if line[0:5] == self.startID:
                        read = True
                        self.info = [ele.rstrip() for ele in line.split(",")]
                        self.process()
                        next(elementLines)
                        continue

                    if format and line.rstrip() != '':
                        self.format.append(line.rstrip())

                # Actual data
                else:
                    if self.stationData:

                        # Skip if the measurement is not of the given quality
                        quality = line[self.columns[-1][0]:self.columns[-1][1]]
                        if int(quality) not in self.validity:
                            continue

                        # Skip if the date is not corresponding to start and end date.
                        date = int(line[self.columns[2][0]:self.columns[2][1]])
                        if not self.maxdate > date >= self.mindate:
                            continue

                    # Add data in the correct dictionary position. (Stations ID go in 'STAID' f.e.)
                    for i, char in enumerate(self.columns):
                        self.data[char[2]].append(line[char[0]:char[1]])

    def process(self):
        """ # Handle reading the format for reading the character range. """
        self.data = {key: [] for key in self.info}

        if self.stationData:

            for i, line in enumerate(self.format):

                # Added text for the explanation of the file format in file.
                if not line[0:2].isdigit():
                    break

                self.columns.append((int(line[0:2]) - 1, int(line[3:5]), self.info[i]))

        else:
            for i, line in enumerate(self.format):
                self.columns.append((int(line[0:3]) - 1, int(line[4:8]), self.info[i]))

    def rewrite(self):

        with open("rewritten\{0}".format(self.fname), 'w+') as outf:

            for line in self.text:
                outf.write(line)
            outf.write("\n")
            for line in self.format:
                outf.write(line + "\n")
            outf.write("\n")
            for line in self.info[:-1]:
                outf.write(line + ",")
            outf.write(self.info[-1] + "\n")
            outf.write("\n")

            if len(self.data["STAID"]) < 2:
                outf.write("     4, 41461,20080101,-9999,    0")
                return

            for line in range(len(self.data[self.info[0]])):
                for index in self.info:

                    if index == self.info[-1]:
                        outf.write(self.data[index][line] + "\n")
                    else:
                        outf.write(self.data[index][line] + ",")


    def wipe(self):
        """ Clean to file to perserve memory. """
        self.columns = []
        self.format = []
        self.info = []
        self.text = []
        self.data = {}


def fixString(string, length):
    stripped = string.strip().replace(' ', '')
    zeroes = (length - len(stripped)) * '0'
    return zeroes + stripped
