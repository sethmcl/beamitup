define(function(require) {
  var Frame = require('Frame');
  var openFrames = window.openFrames = [];
  var socket;
  var host = window.location.protocol + '//' + window.location.host;
  var remoteFrame;

  /**
   * Initialize application
   */
  function initialize() {
    $('.add-frame').click( onClickAddFrame );
    loadFramesFromHash();
    remoteFrame = new Frame({ width: window.innerWidth, height: window.innerHeight, x: 0, y: 0, url: 'about:blank' });
    remoteFrame.hide();
    connect();
  }

  /**
  * Connect to server
  */
  function connect() {
    socket = io.connect(host);

    // Request share URL
    socket.on('show-url', onRemoteShareUrl);

    // Stop sharing remote URL
    socket.on('stop-share', onRemoteStopShare);

    // Scroll frame
    socket.on('scroll-by', onRemoteScrollBy);

    // Disconnected from the server
    //socket.on('disconnect', onDisconnect);
  }

  /**
   * Remote user requests to show URL
   */
  function onRemoteShareUrl( data ) {
    var winWidth = window.innerWidth;
    var winHeight = window.innerHeight;

    remoteFrame.position( 0, 0 );
    remoteFrame.size( winWidth, winHeight );
    remoteFrame.navigate( data );
    remoteFrame.show();
    lightsOut();
  }

  /**
   * Remote user requests to scroll
   */
  function onRemoteScrollBy( data ) {
    console.log( data );
    remoteFrame.scrollBy( data.x, data.y );
  }

  /**
   * Remote user requests to stop sharing URL
   */
  function onRemoteStopShare( data ) {
    remoteFrame.navigate( 'about:blank' );
    remoteFrame.hide();
    lightsOn();
  }

  /**
   * Lights out effect
   */
  function lightsOut() {
    $('#lights-out').addClass('active');
  }

  /**
   * Lights on effect
   */
  function lightsOn() {
    $('#lights-out').removeClass('active');
  }

  /**
   * Parse hash to load frames
   */
  function loadFramesFromHash() {
    var hash = window.location.hash.substr(1);
    var split = hash.split('&');

    split.forEach(function(h) {
      try {
        addFrame( JSON.parse( decodeURIComponent( h ) ) );
      } catch(e) {
      }
    });
  }
  /**
   * Add new frame to page
   * @param {Object} e event object
   */
  function onClickAddFrame( e ) {
    addFrame({
      x: 50,
      y: 50,
      width: 500,
      height: 300
    });
  }

  /**
   * Add frame to page
   * @param {Object} config (width, height, x, y, url)
   */
  function addFrame( config ) {
    var f = new Frame( config );

    f.on( 'modified', onFrameModified );
    f.on( 'closed', onFrameClosed );

    openFrames.push(f);
    updateHash();
  }

  /**
   * Updates hash when frame is modified
   * @param {Object} e the event object
   */
  function onFrameModified( e ) {
    //console.log('frame modified');
    updateHash();
  }

  /**
   * Handles frame close event
   */
  function onFrameClosed( e ) {
    //console.log('frame closed');
    var idx = openFrames.indexOf( e );

    if( idx !== -1 ) {
      openFrames.splice( idx, 1 );
      updateHash();
    }
  }

  /**
   * Updates the hash representation of all frames on page
   */
  function updateHash() {
    var hash = '';

    openFrames.forEach(function(f) {
        hash += encodeURIComponent(JSON.stringify(f.state()));
        hash += '&';
    });

    window.location.hash = hash;
  }

  return {
    initialize: initialize
  };
});
