import matplotlib.pyplot as plt
import csv


def convert_date(date):
    """ Takes a date 'YYYYMMDD' and converts it to 'YYYY/MM/DD' """
    date = [date[0:4], date[4:6], date[6:8]]  # Split in year, month, day respectively
    return "/".join(date)


def read_data(year, plot=False):
    """ Write the temperature data of a certain year to a file. """

    with open("DeBilt.txt", "r") as f:
        lines = f.readlines()
        data = []

        for line in lines:

            # Text, we can skip this.
            if line[0] == '#':
                continue

            line = line.split(',')
            if line[1][0:4] == str(year):  # take the input year
                data.append((convert_date(line[1]), line[2][0:-1]))

    if plot:  # Default is False, only to check the html/javascript with.
        graph_year(data, year)

    with open('data.csv', 'wb') as f:
            writer = csv.writer(f)
            for date, temp in data:
                writer.writerow([date, temp])


def graph_year(data, year):
    """ Plot function to check if my html/javascript was correct. """
    temp_list = []
    for date, temp in data:
        temp_list.append(int(temp))
    plt.plot(range(len(temp_list)), temp_list)
    plt.title("Maximum temperature in De Bilt (NL) in {0}".format(year))
    plt.xlabel("Day in year")
    plt.ylabel("Temperature in 0.1 degrees Celcius")
    plt.show()

if __name__ == '__main__':
    read_data(2014, False)
