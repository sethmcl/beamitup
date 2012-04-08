define( function( require ) {
  var dust          = require('dust');
  var Events        = require('util/events');
  var framezMarkup  = require('text!templates/framez.tl');
  var framezName    = 'framez';

  dust.loadSource( dust.compile( framezMarkup, framezName ) );

  /**
   * Frame Class
   * @class Frame
   * @constructor
   */
  function Frame( config ) {
    config = config || {};
    var _this = this;
    var el = $( document.createElement('div') );
    var iframe;
    var lastResizeX = 1;
    var lastResizeY = 1;
    var posX = config.x || 1;
    var posY = config.y || 1;
    var frameWidth = config.width || 1;
    var frameHeight = config.height || 1;
    var mouseMoveHandlers = [];
    var url = config.url;
    var moveOffsetX = 0;
    var moveOffsetY = 0;
    var fireModifiedTimeout;

    Events.call(this);

    dust.render( framezName, {}, function( err, out ) {
      el.html( out );
      postRender();
    });

    /**
     * Hook stuff up after frame is rendered
     */
    function postRender() {
      url = url || prompt('URL:');
      el.addClass('framez');
      iframe = $( 'iframe', el );
      $( document.body ).append( el );
      $( document ).bind('mousemove', onMouseMove);
      navigate( url );

      position( posX, posY );
      size( frameWidth, frameHeight);

      // Event handlers for resize
      el
        .bind('mousedown', turnUiOn)
        .bind('mouseup', turnUiOff)
        .bind('mousedown', onResizeVerticalMouseDown)
        .bind('mouseup', onResizeVerticalMouseUp)
        .bind('mousedown', onResizeHorizontalMouseDown)
        .bind('mouseup', onResizeHorizontalMouseUp)
        .bind('mousedown', onResizeBothMouseDown)
        .bind('mouseup', onResizeBothMouseUp)
        .bind('mousedown', onMoveMouseDown)
        .bind('mouseup', onMoveMouseUp)
        .bind('click', onClickSetSource)
        .bind('click', onClickClose)
        .bind('click', onClickScroll)
        .bind('click', onClickPassThrough);
    }

    /**
     * Navigate to URL
     * @param {String} u the url to navigate to
     */
    function navigate( u ) {
      var goUrl = '/iframeshim/' + encodeURIComponent(u);
      iframe.attr('src', goUrl);
      url = u;
      delayFireModified();
    }

    /**
     * Force hover UI on
     */
    function turnUiOn( e ) {
      el.addClass('show-ui');
      $('#smoke').addClass('active');
    }

    /**
     * Force hover UI off
     */
    function turnUiOff( e ) {
      el.removeClass('show-ui');
      $('#smoke').removeClass('active');
    }

    /**
     * Mouse move event handler
     * @param {Object} e the event object
     */
    function onMouseMove( e ) {
      mouseMoveHandlers.forEach( function( handler ) {
        handler(e);
      });
    }

    /**
     * Click set source
     */
    function onClickSetSource( e ) {
      var jtarget = $(e.target);

      if(jtarget.attr('data-action') === 'set-source') {
        e.preventDefault();
        e.stopPropagation();

        navigate(prompt('URL:'));
      }
    }

    /**
     * Click close
     */
    function onClickClose( e ) {
      var jtarget = $(e.target);

      if(jtarget.attr('data-action') === 'close') {
        e.preventDefault();
        e.stopPropagation();

        $(el).remove();
        _this.fire('closed', _this);
      }
    }

    /**
     * Click scroll
     */
    function onClickScroll( e ) {
      var jtarget = $(e.target);

      if(jtarget.attr('data-action') === 'scroll') {
        e.preventDefault();
        e.stopPropagation();

        $(el).toggleClass('scroll');
      }
    }

    /**
     * Click pass through
     */
    function onClickPassThrough( e ) {
      var jtarget = $(e.target);

      if(jtarget.attr('data-action') === 'pass-through') {
        e.preventDefault();
        e.stopPropagation();

        $(el).toggleClass('pass-through');
      }
    }

    /**
     * Mouse down for resize vertical
     */
    function onResizeVerticalMouseDown( e ) {
      var jtarget = $(e.target);

      if(jtarget.attr('data-action') === 'resize-vertical') {
        e.preventDefault();
        e.stopPropagation();

        lastResizeY = e.screenY;

        var idx = mouseMoveHandlers.indexOf ( resizeVertical );

        if(idx === -1) {
          mouseMoveHandlers.push( resizeVertical );
        }
      }
    }

    /**
     * Mouse down for resize horizontal
     */
    function onResizeHorizontalMouseDown( e ) {
      var jtarget = $(e.target);
      if(jtarget.attr('data-action') === 'resize-horizontal') {
        e.preventDefault();
        e.stopPropagation();
        lastResizeX = e.screenX;

        var idx = mouseMoveHandlers.indexOf( resizeHorizontal );

        if(idx === -1) {
          mouseMoveHandlers.push( resizeHorizontal );
        }
      }
    }

    /**
     * Mouse down for resize both directions
     */
    function onResizeBothMouseDown( e ) {
      var jtarget = $(e.target);
      if(jtarget.attr('data-action') === 'resize-both') {
        e.preventDefault();
        e.stopPropagation();
        lastResizeX = e.screenX;
        lastResizeY = e.screenY;

        var idx = mouseMoveHandlers.indexOf( resizeHorizontal );

        if(idx === -1) {
          mouseMoveHandlers.push( resizeHorizontal );
        }

        idx = mouseMoveHandlers.indexOf( resizeVertical );
        if(idx === -1) {
          mouseMoveHandlers.push( resizeVertical );
        }
      }
    }

    /**
     * Move mouse down
     */
    function onMoveMouseDown( e ) {
      var jtarget = $(e.target);

      if(jtarget.attr('data-action') === 'move') {
        e.preventDefault();
        e.stopPropagation();

        moveOffsetX = e.offsetX;
        moveOffsetY = e.offsetY;

        var idx = mouseMoveHandlers.indexOf( movePosition );

        if( idx === -1) {
          mouseMoveHandlers.push( movePosition );
        }
      }
    }

    /**
     * Move mouse up
     */
    function onMoveMouseUp( e ) {
      var idx = mouseMoveHandlers.indexOf( movePosition );

      if( idx !== -1 ) {
        mouseMoveHandlers.splice( idx, 1 );
      }
    }

    /**
     * Move window on mouse
     */
    function movePosition( e ) {
      var dx = e.pageX - posX;
      var dy = e.pageY - posY;

      position( posX + dx - moveOffsetX, posY + dy - moveOffsetY);
    }

    /**
     * Mouse up for resize vertical
     */
    function onResizeVerticalMouseUp( e ) {
      var idx = mouseMoveHandlers.indexOf ( resizeVertical );

      if( idx !== -1 ) {
        mouseMoveHandlers.splice( idx, 1 );
      }
    }

    /**
     * Mouse up for resize horizontal
     */
    function onResizeHorizontalMouseUp( e ) {
      var idx = mouseMoveHandlers.indexOf ( resizeHorizontal );

      if( idx !== -1 ) {
        mouseMoveHandlers.splice( idx, 1 );
      }
    }

    /**
     * Mouse up for resize both
     */
    function onResizeBothMouseUp( e ) {
      var idx;

     idx = mouseMoveHandlers.indexOf ( resizeHorizontal );

      if( idx !== -1 ) {
        mouseMoveHandlers.splice( idx, 1 );
      }

     idx = mouseMoveHandlers.indexOf ( resizeVertical );

      if( idx !== -1 ) {
        mouseMoveHandlers.splice( idx, 1 );
      }
    }

    /**
     * Resize frame vertically, mouse move handler
     */
    function resizeVertical( e ) {
      var dy = e.screenY - lastResizeY;

      //console.log(e, dx, e.screenX, lastResizeX);
      size( frameWidth, frameHeight + dy );

      lastResizeY = e.screenY;
    }

    /**
     * Resize frame horizontally, mouse move handler
     */
    function resizeHorizontal( e ) {
      var dx = e.screenX - lastResizeX;

      //console.log(e, dx, e.screenX, lastResizeX);
      size( frameWidth + dx, frameHeight );

      lastResizeX = e.screenX;
    }

    /**
     * Delay fire modified event
     */
    function delayFireModified( delay ) {
      delay = delay || 500;

      clearTimeout( fireModifiedTimeout );
      fireModifiedTimeout = setTimeout( function() {
        _this.fire('modified', _this);
      }, delay );
    }

    /**
     * Set size
     * @param {Number} width the frame's width
     * @param {Number} height the frame's height
     */
    function size( width, height ) {
      if(typeof width !== 'undefined' && typeof height !== 'undefined') {
        el
          .width( width )
          .height( height );

        frameWidth = width;
        frameHeight = height;

        delayFireModified();

        return this;
      } else {
        return { width: frameWidth, height: frameHeight };
      }
    }

    /**
     * Set position
     * @param {Number} x the x coordinate
     * @param {Number} y the y coordinate
     */
    function position( x, y ) {

      if(typeof x !== 'undefined' && typeof y !== 'undefined') {
        el.offset( {left: x, top: y} );
        posX = x;
        posY = y;

        delayFireModified();
        return this;
      } else {
        return { x: posX, y: posY };
      }
    }

    /**
     * Return current state of frame
     */
    function state() {
      var pos = position();
      var dim = size();

      return {
        width: dim.width,
        height: dim.height,
        x: pos.x,
        y: pos.y,
        url: url
      };
    }

    /**
     * Hide frame
     */
    function hide() {
      el.hide();
    }

    /**
     * Show frame
     */
    function show() {
      el.show();
      el.css('z-index', '500');
    }

    /**
     * Scroll frame by x, y amounts
     * @param {Number} x horizontal scroll in pixels
     * @param {Number} y vertical scroll in pixels
     */
    function scrollBy( x, y ) {
      iframe[0].contentWindow.postMessage(JSON.stringify({ type: 'scrollBy', x: x, y: y }), '*');
    }

    /**
     * Scroll frame to x, y amounts
     * @param {Number} x horizontal scroll in pixels
     * @param {Number} y vertical scroll in pixels
     */
    function scrollTo( x, y ) {
      iframe[0].contentWindow.postMessage(JSON.stringify({ type: 'scrollTo', x: x, y: y }), '*');
    }

    // Public methods
    this.state = state;
    this.size = size;
    this.position = position;
    this.show = show;
    this.hide = hide;
    this.navigate = navigate;
    this.scrollBy = scrollBy;
    this.scrollTo = scrollTo;
  }

  return Frame;
});
