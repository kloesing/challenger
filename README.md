Graphs for the Tor Relay Challenge
==================================

EFF is planning to do another ["Tor relay challenge"] [EFF], to both help raise awareness of the value of Tor, and encourage many people to run relays.
We should provide them with graphs visualizing progress.

Instructions
------------

```sh
python challenge.py
```

Required packages (install using `apt-get` on Debian Wheezy):
 - `python-requests`

See the TODOs in the Python file to switch from locally stored test files to actually downloading files from the [Onionoo service] [Onionoo].

Output
------

 - `combined-uptime.json` contains combined uptime fractions of all relays or bridges listed in `fingerprints.txt`.  This graph can be used to display "Total number of relays and bridges".
 - `combined-bandwidth.json` contains bandwidth histories of all relays or bridges listed in `fingerprints.txt`.  The unit is total bytes per second read or written by all relays and bridges.  This graph shows "Total bandwidth consumed by relays and bridges".
 - `combined-weights.json` contains sums of advertised bandwidth fractions, consensus weight fractions, and guard/middle/exit probabiliby fractions.  One possible graph would be "Total consensus weight fraction added by relays".
 - `combined-clients.json` contains average number of clients served by all bridges listed in `fingerprints.txt`.

The data format is pretty similar to the [Onionoo protocol specification] [Onionoo].

Next steps
----------
 - Turn this script into a web app with URLs like `http://example.com/combined-uptime/F2044413DAC2E02E3D6BCF4735A19BCA1DE97281+9695DFC35FFEB861329B9F1AB04C46397020CE31
   - How about using Flask?
 - Add local cache for downloading documents from Onionoo.
   - When we cache documents, we should store them together with their `Last-Modified` timestamp.
   - We also remember the latest `Last-Modified` timestamp that we saw in any request.
   - When fetching a new set of documents, we include that timestamp in the `If-Modified-Since` header.  If we receive a response with a newer `Last-Modified` timestamp, we flush our entire cache.  If we receive a `304 Not Modified`, we can use all documents from our cache and only have to fetch the ones we don't have.
   - It's important that we make at least one request to Onionoo, or we might never learn when there's new data.  We can make one such request per request for data, or we can rate-limit that to once every minute or so.
   - We should probably not limit our cache size, because that would only make us refetch data that we fetched before.  The cache gets cleared after an hour anyway.
 - Add local cache for results.  We're likely going to be asked for the very same data over and over.
   - We should cache results together with the `Last-Modified` timestamp of the documents they are based on.
   - Whenever we learn that Onionoo has new data for us, let's flush our results cache.
 - Write a website with graphs using our data.  We can probably re-use parts of either Atlas [Atlas] or Globe [Globe] here.

[EFF]:https://www.eff.org/torchallenge
[Onionoo]:https://onionoo.torproject.org/
[Atlas]:https://atlas.torproject.org/
[Globe]:https://globe.torproject.org/

