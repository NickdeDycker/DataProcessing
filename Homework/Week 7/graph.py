import json
import matplotlib.pyplot as plt

country = ["SWE", "NLD", "FRA", "DEU"]
splot = [411, 412, 413, 414]

for i in range(len(country)):
    with open("DATA/TG/{0}.txt".format(country[i])) as f:
        j = json.load(f)

    y = []
    for d in j:
        y.append(d['value'])

    plt.subplot(splot[i])
    plt.plot(y)

plt.show()

