#!/usr/bin/env python
# Name: Nick de Dycker
# Student number: 10543996
'''
This script scrapes IMDB and outputs a CSV file with highest ranking tv series.
'''
# IF YOU WANT TO TEST YOUR ATTEMPT, RUN THE test-tvscraper.py SCRIPT.
import csv

from pattern.web import URL, DOM

TARGET_URL = "http://www.imdb.com/search/title?num_votes=5000,&sort=user_rating,desc&start=1&title_type=tv_series"
BACKUP_HTML = 'tvseries.html'
OUTPUT_CSV = 'tvseries.csv'


def extract_tvseries(dom):
    '''
    Extract a list of highest ranking TV series from DOM (of IMDB page).

    Each TV series entry should contain the following fields:
    - TV Title
    - Ranking
    - Genres (comma separated if more than one)
    - Actors/actresses (comma separated if more than one)
    - Runtime (only a number!)
    '''
    series = []
    for serie in dom.by_tag('tr.detailed'):  # Every serie entry

        # Search for a table cell with class "title" and get the content from the first link within.
        title = serie.by_tag('td.title')[0]('a')[0].content.encode('ascii', 'ignore')
        ranking = serie.by_tag('td.number')[0].content
        genres = [genre.content for genre in serie.by_tag('span.genre')[0]('a')]
        actors = [actor.content for actor in serie.by_tag('span.credit')[0]('a')]
        runtime = int(serie.by_tag('span.runtime')[0].content.split(' ')[0])
        series.append((title, ranking, genres, actors, runtime))

    return series


def save_csv(f, tvseries):
    '''
    Output a CSV file containing highest ranking TV-series.
    '''
    writer = csv.writer(f)
    writer.writerow(['Title', 'Ranking', 'Genre', 'Actors', 'Runtime'])
    for title, ranking, genres, actors, runtime in tvseries:

        # Convert actor and genre from list to string with ascii values.
        actors_string = ''
        for actor in actors:
            actors_string += actor.encode('ascii', 'ignore') + ','

        genres_string = ''
        for genre in genres:
            genres_string += genre.encode('ascii', 'ignore') + ','

        writer.writerow([title, ranking, genres_string[0:-1], actors_string[0:-1], runtime])

if __name__ == '__main__':
    # Download the HTML file
    url = URL(TARGET_URL)
    html = url.download()

    # Save a copy to disk in the current directory, this serves as an backup
    # of the original HTML, will be used in testing / grading.
    with open(BACKUP_HTML, 'wb') as f:
        f.write(html)

    # Parse the HTML file into a DOM representation
    dom = DOM(html)

    # Extract the tv series (using the function you implemented)
    tvseries = extract_tvseries(dom)

    # Write the CSV file to disk (including a header)
    with open(OUTPUT_CSV, 'wb') as output_file:
        save_csv(output_file, tvseries)