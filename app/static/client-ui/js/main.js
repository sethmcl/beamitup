require.config({
  paths: {
    jquery:     'libs/jquery/jquery-1.7.min',
    text:       'libs/require/text',
    dust:       'libs/dust/dust-full-amd-0.3.0',
    templates:  '../templates'
  }
});

define(function(require) {
  var app = require('app');
  var $   = require('jquery');
  $(document).ready( app.initialize );
});
