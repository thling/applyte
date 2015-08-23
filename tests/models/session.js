'use strict';

let basedir = '../../';
let master  = require(basedir + 'tests/test-master');
let Session = require(basedir + 'models/session');

require('chai').should();
require('co-mocha');

describe('Session model tests', function () {
    let sess1, sess2, sess31, sess32, sess4, sess5;

    before('Setting up session database', function *() {
        sess1 = new Session({
            sid: 'sid1',
            userId: 'userId1'
        });

        sess2 = new Session({
            sid: 'sid2',
            userId: 'userId2'
        });

        sess31 = new Session({
            sid: 'sid31',
            userId: 'userId3'
        });

        sess32 = new Session({
            sid: 'sid32',
            userId: 'userId3'
        });

        sess4 = new Session({
            sid: 'sid4',
            userId: 'userId4'
        });

        sess5 = new Session({
            sid: 'sid5',
            userId: 'userId'
        });

        yield sess1.save();
        yield sess2.save();
        yield sess31.save();
        yield sess32.save();
        yield sess4.save();
        yield sess5.save();
    });

    after('Clean up session database', function *() {
        yield Session.deleteAllSessions();
    });

    it('should be able to create session in the database', function *() {
        sess1.should.have.property('id');
        sess2.should.have.property('id');
        sess31.should.have.property('id');
        sess32.should.have.property('id');
        sess4.should.have.property('id');
        sess5.should.have.property('id');
    });

    it('should be able to find by id', function *() {
        let foundSession = yield Session.findById(sess2.id);
        foundSession.should.deep.equal(sess2);
    });

    it('should be able to find session by sid and act on it like session object', function *() {
        let foundSession = yield Session.findBySid(sess2.sid);
        foundSession.should.deep.equal(sess2);

        foundSession.update({
            test: 100
        });

        yield foundSession.save();
        foundSession = yield Session.findBySid(sess2.sid);
        foundSession.should.have.property('test', 100);
    });

    it('should be able to find sessions from user 3', function *() {
        let foundSessions = yield Session.findByUserId(sess31.userId);
        master.listEquals(foundSessions, [sess31, sess32]);
    });

    it('should be able to delete individual session instance', function *() {
        yield sess5.delete();
        let foundSession = yield Session.findBySid(sess5.sid);
        if (foundSession !== null) {
            throw new Error('Cannot delete individual session');
        }
    });

    it('should be able to delete by id', function *() {
        yield Session.deleteById(sess32.id);
        let foundSession = yield Session.findBySid(sess32.id);
        if (foundSession !== null) {
            throw new Error('Cannot delete individual session');
        }
    });

    it('should be able to delete by sid', function *() {
        yield Session.deleteBySid(sess4.sid);
        let foundSession = yield Session.findBySid(sess4.sid);
        if (foundSession !== null) {
            throw new Error('Cannot delete individual session');
        }
    });
});
