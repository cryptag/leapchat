import { tagByPrefix, tagByPrefixStripped, parseJSON, sortRowByCreated } from './tags';

export function extractMessageMetadata(tags) {
  return {
    isChatMessage: tags.indexOf('type:chatmessage') !== -1,
    isUserStatus: tags.indexOf('type:userstatus') !== -1,
    isPicture: tags.indexOf('type:picture') !== -1,
    isRoomName: tags.indexOf('type:roomname') !== -1,
    isRoomDescription: tags.indexOf('type:roomdescription') !== -1,
    from: tagByPrefixStripped(tags, 'from:'),
    to: tagByPrefixStripped(tags, 'to:'),
    status: tagByPrefixStripped(tags, 'status:')
  }
}
