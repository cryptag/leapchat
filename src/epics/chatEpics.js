import {
    CHAT_INIT_APPLICATION,
    CHAT_SET_USERNAME,
    CHAT_INIT_CONNECTION,
    CHAT_INIT_CHAT,
    CHAT_SEND_MESSAGE,
    readyToConnect,
    pincodeRequired,
    useParanoidMode,
    initConnection,
    connectionInitiated,
    disconnected,
    addMessage,
    messageSent,
    setUserStatus,
    userStatusSent,
    usernameSet
} from '../actions/chatActions';

import {
    alertSuccess,
    alertWarning
} from '../actions/alertActions';

import {
    USER_STATUS_DELAY_MS
} from '../constants/messaging';

import { getEmail, getPassphrase, generateMessageKey } from '../utils/encrypter';
import ChatHandler from './helpers/ChatHandler';
import miniLock from '../utils/miniLock';
import { combineEpics } from 'redux-observable';
import createDetectVisibilityObservable from './detectPageVisibilityObservable';

const BACKEND_URL = window.location.origin;
const authUrl = `${window.location.origin}/api/login`;
const wsUrl = `${window.location.origin.replace('http', 'ws')}/api/ws/messages/all`;
const chatHandler = new ChatHandler(wsUrl);

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

function createKeyPairObservable({ pincode = '' }) {
    /* Using a function */
    const keyPairObservable = Observable.create(function(observer) {
        const urlHash = document.location.hash+pincode;
        // 1. Get passphrase
        const {
            passphrase,
            isNewPassphrase
        } = getPassphrase(urlHash);

        // 3. Get email based on passphrase
        let email = getEmail(passphrase);
        // 4. Decrypt to get key pair
        miniLock.crypto.getKeyPair(passphrase, email, (keyPair) => {
            miniLock.session.keys = keyPair
            miniLock.session.keyPairReady = true
            let mID = miniLock.crypto.getMiniLockID(keyPair.publicKey);
            // 4. When we have keypair, login:
            observer.next({ passphrase, keyPair, mID, isNewRoom: isNewPassphrase });
            observer.complete();
        });
    });

    return keyPairObservable;
}

function createDecryptMessageObservable({ message, mID, secretKey }) {
    return Observable.create(function(observer) {
        miniLock.crypto.decryptFile(message, mID, secretKey,
            function(fileBlob, saveName, senderID) {
                const reader = new FileReader();
                reader.addEventListener("loadend", () => {
                    const authToken = reader.result;
                    observer.next(authToken);
                    observer.complete();
                });

                reader.readAsText(fileBlob);
            })
    })
}

function getAuthRequestSettings({ mID }) {
    const settings = {
        url: authUrl,
        responseType: 'blob',
        headers: {
            'X-Minilock-Id': mID
        },
        method: 'GET'
    }
    return settings;
}

const initConnectionEpic = (action$) =>
    action$.ofType(CHAT_INIT_CONNECTION)
        .mergeMap(createKeyPairObservable)
        .mergeMap(({ keyPair, mID, isNewRoom, passphrase }) => 
            Observable.merge(
                Observable.of(alertSuccess('New room created.'))
                    .filter(() => isNewRoom)
                    .do(() => document.location.hash = '#' + passphrase),
            
                ajax(getAuthRequestSettings({ mID }))
                    .map(ajaxResult => ({
                        message: ajaxResult.response,
                        mID,
                        secretKey: keyPair.secretKey
                    }))
                    .mergeMap(createDecryptMessageObservable)
                    .mergeMap(authToken =>
                        chatHandler.initConnection({
                            authToken,
                            secretKey: keyPair.secretKey,
                            mID
                        })
                    )
                    .mergeMap(() =>
                        Observable.merge(
                            chatHandler.getMessageSubject()
                            .map(addMessage),

                            chatHandler.getUserStatusSubject()
                            .map(setUserStatus),

                            Observable.of(connectionInitiated())
                        ))
                
            )
        )
        .catch(error => {
            console.error(error);
            return Observable.from([
                alertWarning('Something is wrong with the chat thingie. Trying to reconnect...'),
                disconnected()
            ])
        });

const setUsernameEpic = (action$) =>
    action$.ofType(CHAT_SET_USERNAME)
    .filter(action => action.username)
    .mergeMap(action => 
        Observable.of(action.username)
            .do(username => {
                const ttl = USER_STATUS_DELAY_MS / 1000;
                chatHandler.sendUserStatus(username, 'viewing', ttl)
            })
            .retryWhen(error => error.delay(500))
    )
    .map(username => usernameSet(username))

const ownUserStatusEpic = (action$, store) =>
    action$.ofType(CHAT_INIT_CHAT)
    .mergeMap(() =>
        createDetectVisibilityObservable()
        //.throttleTime(USER_STATUS_DELAY_MS)
        .filter(() => store.getState().chat.username)
        .do(status => {
            const ttl = USER_STATUS_DELAY_MS / 1000;
            const { chat: { username } } = store.getState();
            chatHandler.sendUserStatus(username, status, ttl);
        })
        .map(() => userStatusSent())
    )
    .catch(error => {
        console.error(error)
        return Observable.of(alertWarning('Error sending user status.'));
    });

const sendMessageEpic = action$ =>
    action$.ofType(CHAT_SEND_MESSAGE)
    .mergeMap(action =>

        Observable.of(action)
        .do(action => {
            chatHandler.sendMessage(action.message, action.username);
        })
        .retryWhen(error => error.delay(1000))
    )
    .map(() => messageSent())
    .catch(error => {
        console.error(error)
        return Observable.of(alertWarning('Error sending message.'));
    });

export default combineEpics(
    setUsernameEpic,
    ownUserStatusEpic,
    initConnectionEpic,
    sendMessageEpic
);