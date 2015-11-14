__author__ = 'Nick'
import json
from pattern.web import URL, DOM


def get_countries(exceptions):
    url = URL("https://en.wikipedia.org/wiki/List_of_sovereign_states_and_dependent_territories_by_population_density")
    html = url.download()
    dom = DOM(html)
    country_table = dom.by_tag('table.wikitable')
    countries = {}

    # Get every tablerow that got a country in it.
    for country in country_table[0]('tr')[4:-1]:

        # Some come with extra's added, which makes them put it in a <i> tag.
        try:
            link = country('i')[0]('a')[0].attrs['href']
            name = country('i')[0]('a')[0].content.encode('ascii', 'ignore')
        except:

            if len(country('span')) == 0:
                link = country('td')[0]('a')[0].attrs['href']
                name = country('td')[0]('a')[0].content.encode('ascii', 'ignore')
            else:
                link = country('td')[1]('a')[0].attrs['href']
                name = country('td')[1]('a')[0].content.encode('ascii', 'ignore')
        density = country('td')[5].content.replace(',', '')

        # Not every wikipedia page is the same or got a ISO CODE at all.
        try:
            iso_code = retrieve_iso("https://en.wikipedia.org", link)
        except:
            iso_code = 'ERROR'

        # Add in manually added ISO CODES.
        if iso_code == 'ERROR' and name in exceptions:
            iso_code = exceptions[name]

        if iso_code == 'CY':  # SVG doesn't contain northern cyprus unlike wikipedia, so I add it manually.
            density = 125

        print iso_code, [name], density
        if iso_code != 'ERROR':
            countries[iso_code] = float(density)

    return countries


def get_3letter(countries):
    url = URL("http://www.worldatlas.com/aatlas/ctycodes.htm")
    html = url.download()
    dom = DOM(html)
    country_table = dom.by_tag('table.tableWrap')
    iso2_list = []
    iso3_list = []
    density_list = []
    for table in country_table:

        for country in table('tr')[1:]:
            iso2_code = country.by_tag('td.cell02')[0].content.strip()
            iso3_code = country.by_tag('td.cell03')[0].content.strip()
            print iso2_code, iso3_code
            if iso2_code in countries:
                iso2_list.append(iso2_code)
                iso3_list.append(iso3_code)
                density_list.append(countries[iso2_code])

    for iso2 in iso2_list:
        if iso2 in countries:
            pass
        else:
            print 'MISSING', iso2

    json_d = []
    for i in range(len(iso2_list)):
        json_d.append({'iso2': iso2_list[i], 'iso3': iso3_list[i], 'density': density_list[i]})

    with open('densities.txt', 'a') as f:
        json.dump(json_d, f, indent=4)

def retrieve_iso(site, branch):
    url = URL(site + branch)
    html = url.download()
    dom = DOM(html)
    infobox = dom.by_tag('table.vcard')[0]('tr')

    for row in infobox:

        try:
            if row('a')[0].content == 'ISO 3166 code':
                try:
                    return row('a')[1].content
                except:
                    return row('td')[0].content

        except:
            pass
    return 'ERROR'

# Wikipedia does not contain this data.
exceptions = {"Western Sahara": "EH", "Svalbard and Jan Mayen": "SJ", "land Islands": "AX"}
countries = get_countries(exceptions)

get_3letter(countries)