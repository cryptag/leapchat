import { combineEpics } from 'redux-observable';
import { Observable } from 'rxjs/Observable';
import { ajax } from 'rxjs/observable/dom/ajax';
import 'rxjs/add/operator/partition';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/throttleTime';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mapTo';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/pluck';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/retryWhen';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/merge';
import 'rxjs/add/observable/if';
import { showSuggestions } from '../actions/chatActions';

const messageEpic = (action$) => {
  return action$.ofType('CHAT_START_SUGGESTIONS')
    .mergeMap((cursor) => {
      return action$.ofType('CHAT_MESSAGE_UPDATE')
      .map((msg) => showSuggestions(cursor.cursorIndex, msg.message))
      // .takeUntil(action$.ofType('CHAT_STOP_SUGGESTIONS'))
    })
}

export default combineEpics(messageEpic)
