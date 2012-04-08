var util  = require('util');
var http  = require('http');
var sockServer  = require('../socket_server');

exports.index = function(req, res) {
  res.render('index', { });
};

exports.share = function(req, res) {
  shareUrl = req.params.url;
  console.log('sharing url ' + shareUrl);
  sockServer.showUrl(shareUrl);
  res.send('');
};

exports.close = function(req, res) {
  sockServer.stopSharing();
  res.send('');
};

exports.scrollby = function(req, res) {
  var x = parseInt(req.params.x, 10);
  var y = parseInt(req.params.y, 10);
  sockServer.scrollBy(x, y);
  res.send('');
};

exports.iframeshim = function(req, res) {
  res.render('iframeshim', { url: req.params.url });
};

exports.bookmarklet = function(req, res) {
  res.render('bookmarklet', { host: req.params.host });
};
