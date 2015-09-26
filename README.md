Graphs for the Tor Relay Challenge
==================================

EFF is planning to do another ["Tor relay challenge"] [EFF], to both help raise awareness of the value of Tor, and encourage many people to run relays.
We should provide them with graphs visualizing progress.

Instructions
------------


Install python-requests 2.7.0+

```bash
sudo apt-get install python-requests
python challenge.py
```

with pip:

```bash
pip install requests
python challenge.py
```

Update `fingerprint.txt` to contain the actual list of fingerprints of participating relays and bridges.

Please avoid running this script more often than once per hour.  New data is only available at most once per hour, so running this script more often only puts unnecessary load on the [Onionoo] server.

Output
------

 - `combined-uptime.json` contains combined uptime fractions of all relays or bridges listed in `fingerprints.txt`.  This graph can be used to display "Total number of relays and bridges".
 - `combined-bandwidth.json` contains bandwidth histories of all relays or bridges listed in `fingerprints.txt`.  The unit is total bytes per second read or written by all relays and bridges.  This graph shows "Total bandwidth consumed by relays and bridges".
 - `combined-weights.json` contains sums of advertised bandwidth fractions, consensus weight fractions, and guard/middle/exit probabiliby fractions.  One possible graph would be "Total consensus weight fraction added by relays".
 - `combined-clients.json` contains average number of clients served by all bridges listed in `fingerprints.txt`.
 - `fingerprints.json` contains (hashed) fingerprints and nicknames of participating relays and bridges.
 - `transferred-bytes.json` contains total written bytes by all participating relays and bridges.

The data format is pretty similar to the [Onionoo protocol specification] [Onionoo].

[EFF]:https://www.eff.org/torchallenge
[Onionoo]:https://onionoo.torproject.org/
