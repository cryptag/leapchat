import { encodeObjForPost } from '../../utils/tags';

export function getMessagesForRoom(roomKey){
  let plaintags = ['type:chatmessage', 'parentrow:'+roomKey];
  console.log(plaintags);
}

export function createMessage(roomKey, message, username){
  let row = {
    unencrypted: encodeObjForPost({msg: message}),
    plaintags: ['parentrow:'+roomKey, 'from:'+username,
                'type:chatmessage', 'app:backchannel']
  }
  console.log(row);
}

export function deleteMessage(roomKey, messageKey){
  let row = {'plaintags': [messageKey, 'parentrow:'+roomKey, 'type:chatmessage']};
  console.log(row);
}
