import React from 'react';
import PropTypes from 'prop-types';

import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';

const OpenSearchIcon = ({ onToggleModalVisibility }) => {

  const openTooltip = (
    <Tooltip id="open-message-search">Search Content</Tooltip>
  );

  const onOpenSearchModal = () => {
    onToggleModalVisibility('search', true);
  };

  return (
    <div className="open-message-search">
      {/* <OverlayTrigger overlay={openTooltip} placement="top" delayShow={300} delayHide={150}> */}
      {/* </OverlayTrigger> */}
      <FaSearch
        size={24}
        onClick={onOpenSearchModal} />
    </div>
  );
};

OpenSearchIcon.propTypes = {
  onToggleModalVisibility: PropTypes.func.isRequired
};

export default OpenSearchIcon;
