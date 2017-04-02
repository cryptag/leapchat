import { reqPost } from '../api';
import { encodeObjForPost } from '../../utils/tags';


export function getMessagesForRoom(roomKey){
  let plaintags = ['type:chatmessage', 'parentrow:'+roomKey];
  return reqPost('/rows/get', {"plaintags": plaintags});
}

export function createMessage(roomKey, message, username){
  let row = {
    unencrypted: encodeObjForPost({msg: message}),
    plaintags: ['parentrow:'+roomKey, 'from:'+username,
                'type:chatmessage', 'app:backchannel']
  }
  return reqPost('/rows', row);
}

export function deleteMessage(roomKey, messageKey){
  let row = {'plaintags': [messageKey, 'parentrow:'+roomKey, 'type:chatmessage']};
  return reqPost('/rows/delete', row);
}
