from knmiDATA import DataSelector

DATA = "TG"

RR = DataSelector(DATA)
RR.getStations()

# Show the number of stations per country
countries = set(RR.stations.data["CN"])

d = {}
for i in range(len(RR.stations.data["CN"])):

    country = RR.stations.data["CN"][i]
    if country not in d:
        d[country] = []

    d[country].append(RR.stations.data["STAID"][i].strip())

print d["IL"]
