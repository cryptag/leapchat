import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FiSearch } from 'react-icons/fi';
import SearchModal from '../../modals/SearchModal';

const OpenSearchIcon = ({ username, messages }) => {
  const [showSearchModal, setShowSearchModal] = useState(false);

  return (
    <>
      <button className="chat-tool-btn" onClick={() => setShowSearchModal(true)} title="Search messages">
        <FiSearch size={18} />
      </button>
      {showSearchModal && <SearchModal
        username={username}
        isVisible={showSearchModal}
        messages={messages}
        onClose={() => setShowSearchModal(false)} />}
    </>
  );
};

OpenSearchIcon.propTypes = {
  username: PropTypes.string.isRequired,
  messages: PropTypes.array.isRequired,
};

export default OpenSearchIcon;
