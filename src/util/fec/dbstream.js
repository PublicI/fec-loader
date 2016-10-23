var dbStreamer = require('db-streamer'),
	stream = require('stream'),
	hash = require('object-hash');

function DBStreams(options) {

    options.write = function (chunk, encoding, next) {
        return this.stream.write(util.makeBufferText(chunk, this.columns),encoding,next);
    };

    options.objectMode = true;

    var writable = new stream.Writable(options);

    writable._emit = function () {
        this.emit.apply(this,arguments);
    };

    writable.connect = function (callback) {
    	var self = this;

        var dbStream = dbStreamer({
            dbConnString: process.env.DB_DRIVER + '://' +
                process.env.DB_USER + ':' + process.env.DB_PASS + '@' +
                process.env.DB_HOST + ':' + process.env.DB_PORT + '/' +
                process.env.DB_NAME
        });

        ['close','drain','error','end','finish','pipe','unpipe'].forEach(function (e) {
            self.stream.on(e, self._emit.bind(self,e));
        });

        dbStream.connect(callback);
    };

    writable.end = function (chunk, encoding, next) {
        this.stream.end(chunk, encoding, next);
    };

    return writable;
}

module.exports = DBStream;
