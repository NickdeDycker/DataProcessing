import matplotlib.pyplot as plt
import json
from collections import OrderedDict

def convert_date(date):
    """ Takes a date 'YYYYMMDD' and converts it to 'YYYY/MM/DD' """
    date = [date[0:4], date[4:6], date[6:8]]  # Split in year, month, day respectively
    return "/".join(date)


def read_data(year, plot=False):
    """ Write the temperature data of a certain year to a file. """

    with open("DeBilt.txt", "r") as f:
        lines = f.readlines()
        data = OrderedDict()
        c = 0
        for line in lines:

            # Text, we can skin this.
            if line[0] == '#':
                continue

            line = line.split(',')
            if line[1][0:4] == str(year):  # take the input year
                data.update({convert_date(line[1]):int(line[2][:-1])})
                c += 1

    if plot:  # Default is False, only to check the html/javascript with.
        graph_year(data, year)
    print len(data)
    with open('data.txt', 'w') as f:
        json.dump(data, f, indent=4)


def graph_year(data, year):
    """ Plot function to check if my html/javascript was correct. """
    temp_list = []
    for key in data:
        temp_list.append(int(data[key]))
    print len(temp_list)
    plt.plot(range(len(temp_list)), temp_list)
    plt.title("Maximum temperature in De Bilt (NL) in {0}".format(year))
    plt.xlabel("Day in year")
    plt.ylabel("Temperature in 0.1 degrees Celcius")
    plt.show()

if __name__ == '__main__':
    read_data(2014, True)
