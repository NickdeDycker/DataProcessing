__author__ = 'Nick'
import matplotlib.pyplot as plt
from collections import OrderedDict
from copy import deepcopy

DATA = "TX"
MINDATE = 19010101
ORIGIN = DATA + "\stations.txt"
MAP  = [DATA + '\\'  + DATA + "_STAID", ".txt"]

def fixString(string, length):
    stripped = string.strip().replace(' ', '')
    zeroes = (length - len(stripped)) * '0'
    return zeroes + stripped


def open_file(filename, MAP, base_dict, mindate):

    f = open(MAP[0] + filename + MAP[1])
    lines = f.readlines()[21:]

    for line in lines:
        line = line.split(',')

        if int(line[4]) == 9:
            continue
        if int(line[2]) <= mindate:
            continue

        base_dict[line[2]] += 1

    return base_dict

def write_dates(filename='000173', MAP=MAP, outf='dates.txt'):
    f = open(MAP[0] + filename + MAP[1])
    out_file = open(outf, 'w')
    lines = f.readlines()[21:]
    for line in lines:
        line = line.split(',')

        out_file.write(line[2] + '\n')
    f.close()
    out_file.close()


def read_dates(mindate, input='dates.txt'):
    input = open(input, 'r')
    base_dict = OrderedDict()
    for line in input:

        if int(line[0:8]) > mindate:
            base_dict[line.strip()] = 0

    return base_dict


def get_stations(ORIGIN):

    with open(ORIGIN, 'r') as f:
        lines = f.readlines()[19:]
        countryStations = {}

        for line in lines:
            line = line.split(',')

            if line[2] not in countryStations:
                countryStations[line[2]] = []

            countryStations[line[2]].append(fixString(line[0], 6))
    return countryStations

countryStations = get_stations(ORIGIN)
base_dict = read_dates(MINDATE)
freq_dict = {}
for key in countryStations:
    freq_dict[key] = base_dict.copy()

counter = 0

for key in countryStations:

    for i in range(len(countryStations[key])):

        freq_dict[key] = open_file(countryStations[key][i], MAP, freq_dict[key], MINDATE)

        counter += 1
        if counter % 100 == 0:
            print counter

for key in countryStations:

    freq = freq_dict[key].values()

    for i in range(len(freq)):
        freq[i] = freq[i] / float(len(countryStations[key]))

    plt.plot(freq, label=key)
plt.legend()
plt.savefig('plot001.png'.format(key))
plt.show()

