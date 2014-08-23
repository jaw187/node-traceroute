var net   = require('net');
var dns   = require('dns');
var child = require('child_process');
var isWin = (/^win/.test(require('os').platform()));

function parseHop(line) {
    line = line.replace(/\*/g,'0').replace(/\n/g,'');

    if (isWin) {
        line = line.replace(/\</g,'');
    }

    function filter(part) {
        return (part !== '' && part !== 'ms');
    }

    var parts = line.split(' ').filter(filter);

    if (parts[0] === '0' || !(/\d+/).test(parts[0])) {
        return false;
    }

    if (isWin) {
        return parseHopWin(parts);
    }

    return parseHopNix(parts);
}

function parseHopWin(parts) {
    // line handlers for stream
    var done = false;
    [ 'Tracing', 'over', 'Trace' ].forEach(function(chk) {
        if (parts[0] === chk) done = true;
    });

    if (done) return false;

    if (parts[4] === 'Request') {
        return false;
    }

    var hop = {};
    hop[parts[4]] = [ +parts[1], +parts[2], +parts[3] ];
    return hop;
}

function parseHopNix(parts) {
    if (parts[0] === 'traceroute') {
        return false;
    }
    parts.shift();

    var hop = {};
    var lastip = parts.shift();

    if (!net.isIP(lastip)) {
        return false;
    }

    hop[lastip] = [];

    parts.forEach(function(part) {
        if (net.isIP(part)) {
            lastip = part;
            hop[lastip] = [];
            return;
        }

        hop[lastip].push(+part)
    });

    return hop;
}

function parseOutput(output, callback) {

    var hops  = [];
    var lines = output.split('\n');

    lines.shift();
    lines.pop();

    if (isWin) {
        for (var i = 0; i < lines.length; i++) {
            if (/^\s+1/.test(lines[i])) break;
            lines.splice(0,i);
            lines.pop(); lines.pop();
        }
    }

    lines.forEach(function(line) {
        var parsed = parseHop(line);

        if (parsed) hops.push(parsed);
    });

    callback(null, hops);
}

function trace(host, callback) {
    host = (host + '').toUpperCase();

    function lookupCallback(err) {
        if (err && net.isIP(host) === 0) {
            return callback(new Error('Invalid host'));
        }

        function execCallback(err, stdout, stderr) {
            if (err) {
                return callback(err);
            }

            parseOutput(stdout, callback);
        }

        if (isWin) {
            return child.exec('tracert -d ' + host, execCallback);
        }

        child.exec('traceroute -n ' + host, execCallback);
    }

    dns.lookup(host, lookupCallback);
}

function stream(host, callback) {
    callback = callback || function() {};
    host = (host + '').toUpperCase();

    var traceroute;

    function lookupCallback(err) {
        if (err && net.isIP(host) === 0) {
            return callback('Invalid host');
        }

        if (isWin) {
            traceroute = child.spawn('tracert', [ '-d', host ]);
        } else {
            traceroute = child.spawn('traceroute', [ '-n', host ]);
        }

        var line = '';
        traceroute.stdout.on('data', function onData(data) {
            data = data.toString();

            if (data.indexOf('\n') === -1) {
                line = line + data;
                return;
            }

            var parts = data.split('\n');
            line = line + parts[0];

            callback(null, parseHop(line));
            line = parts[1];
        });

        traceroute.stderr.on('data', function onData(data) {
            data = data + '';
            callback(new Error(data));
        });
    }

    dns.lookup(host, lookupCallback);
}

module.exports = trace;
module.exports.stream = stream;

