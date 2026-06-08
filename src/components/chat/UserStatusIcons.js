import React from 'react';
import PropTypes from 'prop-types';
import { FiEdit2 } from 'react-icons/fi';

const AVATAR_COLORS = [
  '#5E6AD2', '#4CAF82', '#E96A5D', '#F5A623',
  '#8B5CF6', '#06B6D4', '#F43F5E', '#10B981',
  '#EC4899', '#3B82F6',
];

export const getAvatarColor = (username = '') => {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

export const UserStatusIcon = ({
  username,
  status,
  isCurrentUser,
  onToggleModalVisibility,
}) => {
  const initial = (username || '?')[0].toUpperCase();
  const color = getAvatarColor(username);

  const statusClass =
    status === 'viewing' || status === 'online' ? 'online' :
    status === 'away' ? 'away' : 'offline';

  return (
    <div className="user-list-item">
      <div className="user-avatar" style={{ backgroundColor: color }}>
        {initial}
        <span className={`user-status-dot ${statusClass}`} />
      </div>
      <span className="user-name">
        {username}
        {isCurrentUser && <span className="user-name-me-badge"> (me)</span>}
      </span>
      {isCurrentUser && (
        <span
          className="user-edit-btn"
          title="Edit username"
          data-testid="edit-username"
          onClick={() => onToggleModalVisibility('username', true)}>
          <FiEdit2 size={13} />
        </span>
      )}
    </div>
  );
};

UserStatusIcon.propTypes = {
  username: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  isCurrentUser: PropTypes.bool.isRequired,
  onToggleModalVisibility: PropTypes.func.isRequired,
};

export const UserStatusIconBubble = ({ status }) => {
  const statusClass =
    status === 'viewing' || status === 'online' ? 'online' :
    status === 'away' ? 'away' : 'offline';
  return <span className={`user-status-dot ${statusClass}`} style={{ position: 'static', border: 'none' }} />;
};
