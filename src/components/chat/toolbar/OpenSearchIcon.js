import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';

import SearchModal from '../../modals/SearchModal';

const OpenSearchIcon = ({ username, messages }) => {
  const [showSearchModal, setShowSearchModal] = useState(false);

  const openTooltip = (
    <Tooltip id="open-message-search">Search Content</Tooltip>
  );

  return (
    <div className="open-message-search">
      {/* <OverlayTrigger overlay={openTooltip} placement="top" delayShow={300} delayHide={150}> */}
      {/* </OverlayTrigger> */}
      <FaSearch
        size={24}
        onClick={() => setShowSearchModal(true)} />
      {showSearchModal && <SearchModal 
        username={username}
        isVisible={showSearchModal}
        messages={messages}
        onClose={() => setShowSearchModal(false)} />}
    </div>
  );
};

OpenSearchIcon.propTypes = {
  username: PropTypes.string.isRequired,
  messages: PropTypes.array.isRequired,
};

export default OpenSearchIcon;
