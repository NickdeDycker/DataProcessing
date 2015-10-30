# Name : Nick de Dycker
# Student number : 10543996
'''
This module contains an implementation of split_string.
'''

# You are not allowed to use the standard string.split() function, use of the
# regular expression module, however, is allowed.
# To test your implementation use the test-exercise.py script.

# A note about the proper programming style in Python:
#
# Python uses indentation to define blocks and thus is sensitive to the
# whitespace you use. It is convention to use 4 spaces to indent your
# code. Never, ever mix tabs and spaces - that is a source of bugs and
# failures in Python programs.


def split_string(source, separators):
    '''
    Split a string <source> on any of the characters in <separators>.

    The ouput of this function should be a list of strings split at the
    positions of each of the separator characters.
    '''

    # Empty source returns empty list.
    if source == '':
        return []

    output = []
    prev_index = 0  # Index of the character after a separator.
    for source_index in range(len(source)):

        if source[source_index] in separators:

            if prev_index != source_index:  # Prevents empty strings in the list.
                output.append(source[prev_index:source_index])

            prev_index = source_index + 1

    # Append the last bit of the source to the output.
    if prev_index != len(source):  # Last character was not a separator.
        output.append(source[prev_index:])

    return output


if __name__ == '__main__':
    # You can try to run your implementation here, that will not affect the
    # automated tests.
    print split_string('abacadabra', 'ba')  # should print: ['c', 'd', 'r']
