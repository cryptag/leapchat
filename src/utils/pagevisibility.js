// Derived from https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API

export function detectPageVisible(onVisible, onHidden, onClose){
  //
  // If user viewing page versus not
  //

  // Set the name of the hidden property and the change event for visibility
  var hidden, visibilityChange;
  if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
    hidden = "hidden";
    visibilityChange = "visibilitychange";
  } else if (typeof document.msHidden !== "undefined") {
    hidden = "msHidden";
    visibilityChange = "msvisibilitychange";
  } else if (typeof document.webkitHidden !== "undefined") {
    hidden = "webkitHidden";
    visibilityChange = "webkitvisibilitychange";
  }

  function handleVisibilityChange() {
    if (document[hidden]) {
      onHidden();
    } else {
      onVisible();
    }
  }

  document.addEventListener(visibilityChange, handleVisibilityChange, false);

  //
  // If user closes tab or window
  //

  /*
  window.onbeforeunload = function(e) {
    onClose();  // Fires in some browsers, but not all

    var msg = 'Do you want to leave this site?';
    e.returnValue = msg;
    return msg;
  };
  */
}
