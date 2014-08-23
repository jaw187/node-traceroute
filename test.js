var tape = require('tape');
var trace = require('./');

tape('trace', function (test) {
    function traceBack(error, data) {
        test.error(error, 'sans error');
        test.ok(data, 'with data');
        test.ok(data.length > 0, 'with data');
        test.end();
    }
    trace('www.example.com', traceBack);
});

tape('trace.stream', function (test) {
    function streamBack(error, data) {
        test.error(error, 'stream back sans error');
    }

    function doneBack(error) {
        test.error(error, 'done sans error');
        test.end();
    }

    trace.stream('www.example.com', streamBack, doneBack);
});
