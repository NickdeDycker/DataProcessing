__author__ = 'Nick'
from pattern.web import URL, DOM
from knmiDATA import DataSelector
import json

def convertToDegrees(string):
    factor = 1 if string[0] == "+" else -1
    degrees = string[1:3] if len(string) == 9 else string[2:4]
    minutes = string[-5:-3]
    seconds = string[-2:]
    return factor * (int(degrees) + int(minutes) / 60. + int(seconds) / 3600.)

url = URL("https://developers.google.com/public-data/docs/canonical/countries_csv")
html = url.download()
dom = DOM(html)
country_table = dom.by_tag("div.devsite-article-body")[0]
letter2 = []
letter3 = []

with open("countrycodes.txt") as f:
    lines = f.readlines()

    for line in lines:
        line = line.split(",")
        letter2.append(line[0])
        letter3.append(line[1].strip())

#for DATA in ["CC", "DD", "FG", "FX", "HU", "PP", "RR", "SD", "SS", "TG", "TN", "TX"]:

for DATA in ["TG"]:
    RR = DataSelector(DATA)
    RR.getStations()

    print RR.stations.info
    country_stations = {}
    for i in range(len(RR.stations.data["STAID"])):

        station_data = []
        for key in RR.stations.info:
            station_data.append(RR.stations.data[key][i].strip())

        d = {"name": station_data[1], "lat": convertToDegrees(station_data[3]), "lon": convertToDegrees(station_data[4]),
              "alt": int(station_data[5]), "id": int(station_data[0])}

        if not station_data[2] in country_stations:
            country_stations[station_data[2]] = []

        country_stations[station_data[2]].append(d)

    country_dict = []
    for country in country_table("tr")[1:]:
        cells = country("td")
        if len(cells[1].content) < 2:
            continue

        iso2 = cells[0].content

        try:
            iso3 = letter3[letter2.index(iso2)]
        except:
            print cells[3].content

        lat = float(cells[1].content)
        long = float(cells[2].content)
        name = cells[3].content

        if not iso2 in country_stations:
            continue

        d = {"name": name, "iso2": iso2, "iso3": iso3, "lat": lat, "long": long, "stations": country_stations[iso2],
             "count": len(country_stations[iso2])}
        country_dict.append(d)

    with open("DATA/{0}/stations.txt".format(DATA), "w") as outf:
        json.dump(country_dict, outf, indent=4)
