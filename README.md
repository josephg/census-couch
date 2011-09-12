This is a simple little couchapp to let people view census data in a standardish format. Its not finished.

The site is live here: http://sharejs.org:5984/census-mini/_design/app/index.html#/region/0

It was done over a couple hackfests, so the code is a bit nasty.

Visit `#/region/REGIONID` to see graphs for a given region.

Deploy with:

    couchapp push app.coffee http://localhost:5984/mydb

You need to get a copy of the census database on your machine to be able to use this. Replicate from here:

    http://sharejs.org:5984/census-mini

Documents are in the database in the following format:

* `CAT5` see details for category 5
* `06_2` details for region 2. (Region 0 is Australia, region `POA2048` is Stanmore, Sydney, etc)
* `06_POA2009_0_1|2` divides people enumeration 0 (All people in the region) by categories 1 and 6 (sex and age)

The web frontend is really not finished yet - but there's a fair bit of data there.
