'use strict';


const Code = require('code');
const Lab = require('lab');
const Traceroute = require('../traceroute');


const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const expect = Code.expect;


describe('Traceroute', () => {

    it('traces a route', (done) => {

        Traceroute.trace('8.8.8.8', (err, hops) => {

            expect(err).to.not.exist();
            expect(hops).to.exist();
            expect(hops[hops.length - 1]['8.8.8.8']).to.exist();
            done();
        });
    });

    it('streams traceroute results', (done) => {

        const trace = Traceroute.trace('8.8.8.8');

        trace.on('hop', (hop) => {

            expect(hop).to.exist();
            trace.removeAllListeners();
            done();
        });
    });
});
