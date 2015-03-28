#!/usr/bin/env python
# -*- coding: utf8 -*-

"""
This script builds stationdict.py from a text file containing the names and ids
of stations in the form "9999 - NAME OF THE STATION". (typically Paris.json)

To build a new version of stationdict.py from the console, type

    python stationdict_builder.py Paris.json

The text file should be in the same directory as the script.
"""

import sys
import re

def stationdict_build(file_fullname):
    with open(file_fullname, 'r') as input_file:
        stationdict = dict()
        text_file = input_file.read()
        station_list = re.findall(r"(?P<station_id>\d{5}) - (?<=\d{5}\s\-\s)(?P<station_name>.*?)(?=\")",
                                  text_file)
    with open("stationdict.py", 'w') as output_file:
        output_file.write("#!/usr/bin/env python\n")
        output_file.write("# -*- coding: utf8 -*-\n")
        output_file.write("\n")
        output_file.write(
"""\"\"\"\nThis script is built by "stationdict_builder.py" from Paris.json file.
1. This file defines "stations", the dictionary of all Paris Velib stations.
Therefore, it can be used as an import
\n\t>>> from stationdict import stations
\t>>> stations["18002"]
\tCLIGNANCOURT
\n2. This file can also be used directly to test if a station id is valid or not,
and if the id is valid, to know the name of the corresponding station.
\n\tpython stationdict.py 18002
\tCLIGNANCOURT\n\"\"\"\n""")
        output_file.write("\n")
        output_file.write("stations = { \n")
        for station_id, station_name in station_list:
            output_file.write("\"{station_id}\": u\"{station_name}\",\n".format(station_id=station_id, station_name=station_name) )
        output_file.write("}")
        output_file.write(
"""\n\nif __name__=="__main__":\n\timport sys\n\tif sys.argv[1] in stations:
\t\tprint(stations["{station_id}".format(station_id=sys.argv[1])])
\telse:\n\t\tprint("Unvalid station id")""")
    print("stationdict wrote in stationdict.py")

if __name__ == "__main__":
   stationdict_build(sys.argv[1])
