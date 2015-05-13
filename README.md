CoastCast v1.0
==============

A realtime WvW reporting system for Tarnished Coast, using Node.JS and Express.JS

Server Instructions:
-------------------

* Make sure Node.js and NPM are installed
* Clone this repo and go into its folder
* `npm install` will locally install all required Node modules
* `node server.js` to run the server
* Go to [localhost:3000](http://localhost:3000/) in your browser

Testing:
--------

* Run the server `node server.js`
* In another terminal window, enter:
* `curl -d '{"user": "Jim Bob", "report": "30 BG at spawn tower"}' -H "Content-Type: application/json" http://127.0.0.1:3000/test`
* Go to [localhost:3000/test](http://localhost:3000/test) in your browser to see reports (only 10 are kept for now)
