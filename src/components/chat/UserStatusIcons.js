import React from 'react';
import FaCircle from 'react-icons/lib/fa/circle';
import FaMinusCircle from 'react-icons/lib/fa/minus-circle';

export const ViewingUserIcon = () => <FaCircle style={styleViewing} />

export const OnlineUserIcon = () => <FaCircle style={styleOnline} />

export const OfflineUserIcon = () => <FaMinusCircle style={styleOffline} />

const styleDots = {
  marginRight: '.2em',
  marginBottom: '.2em'
}

const styleViewing = Object.assign(
  { color: 'green' },
  styleDots
)

const styleOnline = Object.assign(
  { color: 'yellow' },
  styleDots
)

const styleOffline = Object.assign(
  { color: 'gray' },
  styleDots
)
