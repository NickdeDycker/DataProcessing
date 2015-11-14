import matplotlib.pyplot as plt

__author__ = 'Nick'

COUNTRY_CODE = "NL"

with open("stations.txt") as f:
    country_codes = {}
    read, whiteline = True, False
    for line in f:

        if read:
            if line[0:5] == 'STAID':
                whiteline = True
                continue
            if whiteline:
                read = False
            continue

        line = line.split(",")

        if line[2] in country_codes:
            country_codes[line[2]].append(line[0].replace(" ", "0"))
        else:
            country_codes[line[2]] = [line[0].replace(" ", "0")]


def read_single_file(filenumber, dateToTemp):

    with open("TX_STAID0" + filenumber + ".txt") as f:
        read = True
        for line in f:

            if read:
                if line[0:5] == 'STAID':
                    read = False
                continue

            if line[-2] != "0":
                continue

            line = line.split(",")

            if line[2] in dateToTemp:
                dateToTemp[line[2]].append(int(line[3]))
            else:
                dateToTemp[line[2]] = [int(line[3])]
    return dateToTemp


def average_season(date1, date2, dateToTemp):
    yearToTemp = {}

    for key in dateToTemp:
        if int(key[4:8]) < int(date2) or int(key[4:8]) > int(date1):
            avg = float(sum(dateToTemp[key]))/len(dateToTemp[key])
            if key[0:4] not in yearToTemp:
                yearToTemp[key[0:4]] = [avg]
            else:
                yearToTemp[key[0:4]].append(avg)

    for key in yearToTemp:
        avg = float(sum(yearToTemp[key]))/len(yearToTemp[key])
        yearToTemp[key] = avg
    return yearToTemp

dateToTemp = {}
file_number = 0
for STAID in country_codes[COUNTRY_CODE]:
    dateToTemp = read_single_file(STAID, dateToTemp)
    file_number += 1
    print file_number

c = 0
for key in dateToTemp:
    if len(dateToTemp[key]) < 3:
        c += 1
print c
x = range(len(dateToTemp))
y = [len(dateToTemp[a]) for a in dateToTemp]
plt.plot(x, y)
plt.show()

yearToTemp = average_season("1222", "0322", dateToTemp)
x = range(len(yearToTemp))
y = [yearToTemp[a] for a in yearToTemp]
plt.plot(x, y)
plt.show()

