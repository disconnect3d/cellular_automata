# Cellular automata
AGH University of Science and Technology cellular automata course.

## Project 1

The first project is to create a simple 1D cellular automata that will work with given rule.

This has to work similarly to this: http://www.wolframalpha.com/input/?i=rule+110&lk=3

The restriction is that it has to be a website.

### The 'rule xxx' explanation

A given rule - for example "rule 70" is made from bits:
```
70 (10) = 1000110 (2)
```

Each of the bits decide whether a bit will be set in the next iteration.

Here is a simple mapping of those bits to the upper row setting:

* Bit 0 -> 000
* Bit 1 -> 001
* Bit 2 -> 010
* Bit 3 -> 011
* Bit 4 -> 100
* Bit 5 -> 101
* Bit 6 -> 110
* Bit 7 -> 111


Here for "rule 70" bits 1, 2 and 6 are set.

So for a given cell if upper left, upper and upper right cells form one of this combination: 001, 010, 110 - the cell is set. Otherwise it is not.
