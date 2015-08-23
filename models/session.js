'use strict';

let config = require(basedir + 'config');
let utils  = require(basedir + 'lib/utils');
let thinky = require('thinky')({
    host: config.session.host,
    port: config.session.port,
    db: config.session.db
});

let r = thinky.r.table(config.session.table);

const SID_INDEX = 'sid';
const USERID_INDEX = 'userId';

let Session = function (props) {
    utils.assignDeep(this, props);
};

Session.findById = function *(id) {
    let result = null;

    try {
        result = yield r.get(id).run();
        result = new Session(result);
    } catch (e) {
        console.error(e.message);
    }

    return result;
};

Session.findBySid = function *(sid) {
    let result = null;

    try {
        result = yield r.getAll(sid, { index: SID_INDEX }).run();
        if (result && result.length > 0) {
            result = new Session(result[0]);
        } else {
            result = null;
        }
    } catch (e) {
        console.error(e.message);
    }

    return result;
};

Session.findByUserId = function *(uid) {
    let found = [], result = [];

    try {
        found = yield r.getAll(uid, { index: USERID_INDEX }).run();
        for (let res of found) {
            result.push(new Session(res));
        }
    } catch (e) {
        console.error(e.message);
    }

    return result;
};

Session.deleteAllSessions = function *() {
    try {
        yield r.delete().run();
    } catch (e) {
        console.error(e.message);
    }
};

Session.deleteById = function *(id) {
    try {
        let session = yield Session.findBySid(id);
        if (session) {
            yield session.delete();
        }
    } catch (e) {
        console.error(e.message);
    }
};

Session.deleteBySid = function *(sid) {
    try {
        let session = yield Session.findBySid(sid);
        if (session) {
            yield session.delete();
        }
    } catch (e) {
        console.error(e.message);
    }
};

Session.prototype.delete = function *() {
    try {
        yield r.get(this.id).delete().run();
    } catch (e) {
        console.error(e.message);
    }
};

Session.prototype.update = function (props) {
    utils.assignDeep(this, props);
};

Session.prototype.save = function *() {
    try {
        if (this.id) {
            yield r.update(this);
        } else {
            let result = yield r.insert(this);
            this.id = result.generated_keys[0];
        }
    } catch (e) {
        console.error(e.message);
    }
};

module.exports = Session;
