node-traceroute
===============

Simple wrapper around native traceroute command forked from https://github.com/jaw187/node-traceroute. Each hop contains the hosts in that hop and the respective round trip times of each host.

Install
-------

```
$ npm install traceroute
```

Example
-------
```javascript
var trace = require('traceroute');
trace('mervine.net', function (err, hops) {
    if (!err) console.log(hops);
});
```

This example would write the following to the console if run from my network...

```javascript
 [ { '192.168.1.1': [ 1.372, 1.438, 1.561 ] },
  { '23.242.48.1': [ 39.513, 39.476, 39.451 ] },
  { '76.166.15.173': [ 26.036, 26.193, 26.369 ] },
  { '72.129.18.98': [ 33.205, 34.006, 37.601 ] },
  { '72.129.17.0': [ 39.053, 39.068, 39.049 ] },
  { '66.109.6.102': [ 50.937, 50.911, 50.798 ] },
  { '66.109.6.5': [ 50.689, 27.907, 36.371 ] },
  { '107.14.19.56': [ 29.093 ], '107.14.19.54': [ 29.871 ] },
  { '69.31.124.118': [ 31.223 ], '69.31.127.62': [ 31.443 ] },
  { '104.28.6.48': [ 31.049, 27.203, 24.57 ] } ]
```

In addition to a standard traceroute, I've added a stream function, which returns the hops as their recieved.


```javascript
var trace = require('traceroute');
trace.stream('mervine.net', function (err, hop) {
    if (!err && hop) console.log(hop);
});
```

This example would write the following to the console if run from my network...

```javascript
{ '192.168.1.1': [ 1.424, 1.466, 2.428 ] }
{ '23.242.48.1': [ 73.679, 73.633, 73.586, 28.509 ] }
{ '72.129.18.98': [ 37.665, 38.536, 38.553, 0 ] }
{ '66.109.6.102': [ 46.802, 46.823, 46.706 ],
  '107.14.19.54': [ 22.387 ],
  '107.14.19.56': [ 26.425 ] }
```

