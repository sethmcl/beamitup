// Modules
var io          = require('socket.io');
var util        = require('util');
var port;

/**
 * Start the socket.io server
 */
function init(p) {
  port = p;
  io = io.listen(port);
  io.sockets.on('connection', acceptConnection);
}

/**
* Shutdown the server
*/
function shutdown() {
  io.server.close();
}

/**
* Accept new socket connection
*/
function acceptConnection(socket) {
}

/**
 * Show URL
 * @param {String} url the url to have clients show
 */
function showUrl( url ) {
  console.log('socket server: sharing url ' + url );
  io.sockets.emit( 'show-url', url );
}

/**
 * Stop sharing url
 */
function stopSharing() {
  console.log('stopping share');
  io.sockets.emit('stop-share');
}

/**
 * Scroll by
 */
function scrollBy(x, y) {
  io.sockets.emit('scroll-by', {x: x, y: y});
}

exports.scrollBy = scrollBy;
exports.showUrl = showUrl;
exports.init = init;
exports.shutdown = shutdown;
exports.stopSharing = stopSharing;
