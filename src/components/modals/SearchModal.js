import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Modal, Popover, OverlayTrigger } from 'react-bootstrap';
import { FaInfoCircle } from 'react-icons/fa';

import MiniSearch from 'minisearch';

import Message from '../chat/Message';

const searchInfoPopover = (
  <Popover id="search-info-popover" title="Search Message History">
    Your messages are encrypted in transit and in storage on our servers. So 
    how can you search them?
    <br /><br />
    Simple! The search happens entirely in the browser. So you can rest easy.
  </Popover>
);


class MessageSearchModal extends Component {
  constructor(props) {
    super(props);

    const miniSearch = this.indexAllMessages(props.messages);

    this.state = {
      username: this.props.username,
      isVisible: this.props.isVisible,
      miniSearch: miniSearch,
      isLoadingResults: false,
      searchResults: []
    };
  }

  indexAllMessages(messages) {
    const miniSearch = new MiniSearch({
      fields: ['msg', 'from'], // fields to index for full-text search
      storeFields: ['msg', 'from'] // fields to return with search results
    });

    messages = this.props.messages.map((message, i) => {
      return {"id": i, ...message};
    });
    miniSearch.addAll(messages);

    return miniSearch;
  };
  
  getSearchResults = (e) => {
    this.setState({
      isLoadingResults: true
    });
    let searchResults = this.state.miniSearch.search(e.target.value);
    this.setState({
      searchResults: searchResults,
      isLoadingResults: false
    });
  }

  onClose = () => {
    // belt and suspenders; explicitly wipe local index from state
    this.setState({ miniSearch: null });
    this.props.onToggleModalVisibility('search', false);
  }

  render() {
    const {
      isVisible,
      searchResults,
      isLoadingResults,
      username } = this.state;

    searchResults.sort((a, b) => a.score > b.score);

    return (
      <div>
        <Modal show={isVisible} onHide={this.onClose}>
          <Modal.Header closeButton>
            Search{' '}
            <FaInfoCircle size="25" />
            {/* <OverlayTrigger trigger="click" placement="bottom" overlay={searchInfoPopover}> */}
            {/* </OverlayTrigger> */}
          </Modal.Header>
          <Modal.Body>
            <div className="form-group">
              <form>
                <label htmlFor="message-search">Search messages</label>
                <input 
                  id="message-search"
                  type="search"
                  className="form-control"
                  placeholder="Enter search text" 
                  onChange={this.getSearchResults} 
                  autoFocus={true} />
              </form>
            </div>
            <hr />
            {isLoadingResults && <div>
              <Throbber />
              <h4>Loading results...</h4>
            </div>}
            {searchResults.length > 0 && <div className="search-results">
              <ul>
                {searchResults.map((result, i) => {
                  return <Message key={i} username={username} message={result} />;
                })}
              </ul>
            </div>}
            
  
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}

MessageSearchModal.propTypes = {
  username: PropTypes.string.isRequired,
  isVisible: PropTypes.bool.isRequired,
  onToggleModalVisibility: PropTypes.func.isRequired,
};

export default MessageSearchModal;