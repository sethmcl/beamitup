window.addEventListener('message', onMessage, false);

function onMessage( e ) {
  action = JSON.parse(e.data);

  switch(action.type) {
   case 'scrollBy':
     remoteScrollBy(action);
     break;

   case 'scrollTo':
     remoteScrollTo(action);
  }
}

function remoteScrollBy( action ) {
  window.scrollBy( action.x, action.y );
}

function remoteScrollTo( action ) {
  window.scrollTo( action.x, action.y );
}
