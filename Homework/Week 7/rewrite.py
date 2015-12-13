from knmiDATA import DataSelector
import os

MINDATE = 20080100
MAXDATE = 20090101

for DATA in ["CC", "DD", "FG", "FX", "HU", "PP", "RR", "SD", "SS", "TG", "TN", "TX"]:
    RR = DataSelector(DATA)
    RR.getStations()

    # Total number of stations
    print "Number of stations: ", len(RR.stations.data["STAID"])

    # Rewrite if not done yet.
    if not os.path.isdir("rewritten/{0}".format(DATA)):
        os.makedirs("rewritten/{0}".format(DATA))
        print 'Rewriting'
        for station in RR.stations.data["STAID"]:
            f = RR.getSingleStation(station, mindate=MINDATE, maxdate=MAXDATE)
            f.rewrite()
            RR.wipe_files()