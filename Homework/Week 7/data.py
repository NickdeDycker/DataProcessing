from knmiDATA import DataSelector
import os
import json
import time
from collections import OrderedDict

def fixDate(date):
    return "{0}/{1}/{2}".format(date[0:4], date[4:6], date[6:8])

iso2to3 = {}
with open("countrycodes.txt", "r") as f:
    lines = f.readlines()
    for line in lines:
        line = line.split(",")
        iso2to3[line[0]] = line[1].strip()

for DATA in ["CC", "DD", "FG", "FX", "HU", "PP", "RR", "SD", "SS", "TG", "TN", "TX"]:
#for DATA in ["TG"]:
    rewrite = False

    RR = DataSelector(DATA)
    RR.getStations()

    # Total number of stations
    print "Number of stations: ", len(RR.stations.data["STAID"])

    # Rewrite if not done yet.
    if not os.path.isdir("rewritten/{0}".format(DATA)):
        os.makedirs("rewritten/{0}".format(DATA))
        print 'Rewriting'
        for station in RR.stations.data["STAID"]:
            f = RR.getSingleStation(station, mindate=20080101, maxdate=20090101)
            f.rewrite()
            RR.wipe_files()

    # Select the rewritten files
    RR_rewritten = DataSelector(DATA, "rewritten/")

    # Show the number of stations per country
    countries = set(RR.stations.data["CN"])

    for country in countries:
        print country, " : ", RR.stations.data["CN"].count(country)


    # Get stations for each country
    d = {}
    for i in range(len(RR.stations.data["STAID"])):
        country = RR.stations.data["CN"][i]
        if country not in d:
            d[country] = []

        value = RR.stations.data["STAID"][i]
        d[country].append(value)

    # Get the average value for each country per date.
    yearly_average = {}

    for country in d:
        average = OrderedDict()
        freq = OrderedDict()

        if country == "IL":
            print d[country]

        for station in d[country]:

            f = RR_rewritten.getSingleStation(station)
            prev_value = -9999
            for i in range(len(f.data["STAID"])):
                date = f.data[f.info[2]][i]
                value = f.data[f.info[3]][i]

                # Invalid data
                if int(value) == -9999:
                    continue

                if date not in average:
                    average[date] = 0
                    freq[date] = 0

                freq[date] += 1
                average[date] += int(value)

            RR_rewritten.wipe_files()

        # Dump to json file.
        jsonfile = []
        for key in average:

            #try:
            value = average[key] / (float(freq[key]) * 10)
            #except:
            #    value = -9999

            jsond = {"date": fixDate(key), "value": round(value, 2)}
            jsonfile.append(jsond)

        if not os.path.isdir("DATA/{0}".format(DATA)):
            os.makedirs("DATA/{0}".format(DATA))

        with open("DATA/{0}/{1}.txt".format(DATA, iso2to3[country]), "w")as f:
            json.dump(jsonfile, f, indent=4)

        total = 0
        for key in average:

            try:
                total += average[key] / (float(freq[key]) * 10.)
            except:
                continue
        try:
            total = float(total) / len(average)
        except:
            total = -9999

        if total == 0:
            total = -9999

        yearly_average[country] = total

    jsonfile = []
    for country in yearly_average:
        d = {"country": iso2to3[country], "value": round(yearly_average[country], 2)}
        jsonfile.append(d)

    with open("DATA/{0}/global.txt".format(DATA), "w")as f:
        json.dump(jsonfile, f, indent=4)