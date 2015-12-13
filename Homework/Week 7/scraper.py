__author__ = 'Nick'
from pattern.web import URL, DOM

url = URL("http://eca.knmi.nl/countries/country_overview.php")
html = url.download()
dom = DOM(html)
country_table = dom.by_tag('td.head1')[1]
letter2 = []
letter3 = []

for row in country_table('tr')[5::2]:
    letter2.append(row('a')[0].attrs["href"][-2:].upper().encode("ascii", "ignore"))

with open("countrycodes.txt") as f:
    lines = f.readlines()
    for line in lines:
        line = line.split(",")

        if line[0] in letter2:
            letter3.append(line[1].strip())

print letter3
