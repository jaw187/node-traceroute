var net   = require('net');
var dns   = require('dns');
var child = require('child_process');
var isWin = (/^win/.test(require('os').platform()));

function parseHop(line) {
    line = line.replace(/\*/g,'0');

    if (isWin) {
        line = line.replace(/\</g,'');
    }

    var s = line.split(' ');

    for (var i = s.length-1; i > -1; i--) {
        if (s[i] === '' || s[i] === 'ms') {
            s.splice(i, 1);
        }
    }

    if (isWin) {
        return parseHopWin(s);
    }

    return parseHopNix(s);
}

function parseHopWin(line) {
    if (line[4] === 'Request') {
        return false;
    }

    var hop = {};
    hop[line[4]] = [ +line[1], +line[2], +line[3]];

    return hop;
}

function parseHopNix(line) {
    if (line[1] === '0') {
        return false;
    }

    var hop = {};
    lastip = line[1];

    hop[line[1]] = [+line[2]];

    for (var i=3; i < line.length; i++) {
        if (net.isIP(line[i])) {
            lastip = line[i];
            if (!hop[lastip]) {
                hop[lastip] = [];
            } else {
                hop[lastip].push(+line[i]);
            }
        }
    }

    return hop;
}

function parseOutput(output, callback) {
    var lines = output.split('\n');
    hops = [];

    lines.shift();
    lines.pop();

    if (isWin) {
        for (var i = 0; i < lines.length; i++) {
            if (/^\s+1/.test(lines[i])) break;
            lines.splice(0,i);
            lines.pop(); lines.pop();
        }
    }

    for (var i = 0; i < lines.length; i++) {
        hops.push(parseHop(lines[i]));
    }

    callback(null, hops);
}

function trace(host, callback) {
    host = (host + '').toUpperCase();

    function lookupCallback(err) {
        if (err && net.isIP(host) === 0) {
            return callback('Invalid host');
        }

        function execCallback(err, stdout, stderr) {
            if (!err) {
                parseOutput(stdout, callback);
            }
        }

        if (isWin) {
            traceroute = child.exec('tracert -d ' + host, execCallback);
            return;
        }

        child.exec('traceroute -q 1 -n ' + host, execCallback);
    }

    dns.lookup(host, lookupCallback);
}

exports.trace = trace;
