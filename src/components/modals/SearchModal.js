import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import MiniSearch from 'minisearch';
import Message from '../chat/Message';

class SearchModal extends Component {
  constructor(props) {
    super(props);
    const miniSearch = new MiniSearch({
      fields: ['msg', 'from'],
      storeFields: ['msg', 'from'],
    });
    const msgs = props.messages.map((m, i) => ({ id: i, ...m }));
    miniSearch.addAll(msgs);
    this.state = { miniSearch, searchResults: [] };
  }

  getSearchResults = (e) => {
    const searchResults = this.state.miniSearch.search(e.target.value);
    this.setState({ searchResults });
  };

  render() {
    const { isVisible, onClose, username } = this.props;
    const { searchResults } = this.state;

    return (
      <Modal size="lg" show={isVisible} onHide={onClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Search Messages</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p style={{ fontSize: '12px', marginBottom: '12px' }}>
            Search happens entirely in your browser — your messages stay encrypted.
          </p>
          <input
            id="message-search"
            type="search"
            className="form-control"
            placeholder="Search messages…"
            onChange={this.getSearchResults}
            autoFocus />
          {searchResults.length > 0 && (
            <div className="search-results" style={{ marginTop: '16px' }}>
              {searchResults.sort((a, b) => b.score - a.score).map((result, i) => (
                <Message key={i} username={username} message={result} isGroupStart={true} />
              ))}
            </div>
          )}
        </Modal.Body>
      </Modal>
    );
  }
}

SearchModal.propTypes = {
  username: PropTypes.string.isRequired,
  isVisible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  messages: PropTypes.array.isRequired,
};

export default SearchModal;
