import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/merge';
import 'rxjs/add/observable/of';

export default function createDetectPageVisibilityObservable() {

  let hiddenKeyName, visibilityChangeEventName;
  if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
    hiddenKeyName = "hidden";
    visibilityChangeEventName = "visibilitychange";
  } else if (typeof document.msHidden !== "undefined") {
    hiddenKeyName = "msHidden";
    visibilityChangeEventName = "msvisibilitychange";
  } else if (typeof document.webkitHidden !== "undefined") {
    hiddenKeyName = "webkitHidden";
    visibilityChangeEventName = "webkitvisibilitychange";
  }

  const detectPageVisibilityObservable = Observable.merge(
    Observable.fromEvent(document, visibilityChangeEventName)
      .map(() => {
        if (document[hiddenKeyName]) {
          return 'online';
        } else {
          return 'viewing';
        }
      })
  );

  return detectPageVisibilityObservable;
}
