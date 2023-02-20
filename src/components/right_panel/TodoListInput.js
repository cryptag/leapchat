import React, { Component } from 'react';

import miniLock from '../../utils/miniLock';


class TodoListInput extends Component {
  constructor(props) {
    super(props);

    this.state = {
      title: ''
    };
  }

  createTodoList = (e) => {
    const title = this.state.title;
    if (!title.trim()) {
      return;
    }

    console.log("Creating todo list with title `%s`", title);

    const contents = {
      title: title,
    };

    const fileBlob = new Blob(
      [JSON.stringify(contents)],
      {type: 'application/json'}
    );

    const saveName = [
      'from:' + this.props.chat.username,
      'type:tasklist'
    ].join('|||');

    fileBlob.name = saveName;

    console.log("Encrypting file blob");

    const { mID, secretKey } = this.props.getCryptoInfo();

    miniLock.crypto.encryptFile(
      fileBlob,
      saveName,
      [mID],
      mID,
      secretKey,
      this.sendTodoListToServer
    );
  };

  sendTodoListToServer = (fileBlob, saveName, senderMinilockID) => {
    const that = this;

    const reader = new FileReader();
    reader.addEventListener("loadend", function() {
      // From https://stackoverflow.com/questions/9267899/arraybuffer-to-base64-encoded-string#comment55137593_11562550
      const b64encMinilockFile = btoa([].reduce.call(
        new Uint8Array(reader.result),
        function(p, c) {
          return p + String.fromCharCode(c);
        }, ''));

      const forServer = {
        todo_lists: [{
          title_enc: b64encMinilockFile
        }]
      };

      // ASSUMPTION: getWsConn() !== undefined
      that.props.getWsConn().send( JSON.stringify(forServer) );
    });

    reader.readAsArrayBuffer(fileBlob);  // TODO: Add error handling
  };

  onTitleChange = (e) => {
    this.setState({ title: e.target.value });
  };

  render() {
    return (
      <div style={styleTodoListInputCtn}>
        <h3>New Todo List</h3>

        <span style={styleTodoListInputRow}>
          <input
            type="text"
            value={this.state.title}
            onChange={this.onTitleChange}
            style={styleTodoListInput}
            placeholder="Title"
          />

          {/* TODO: Replace button using Bootstrap */}
          <button onClick={this.createTodoList}>
            Create!!!
          </button>
        </span>
      </div>
    );
  }
}

const styleTodoListInputCtn = {
  display: 'flex',
  flexDirection: 'column'
};

const styleTodoListInputRow = {
  display: 'flex',
  flexDirection: 'row'
};

const styleTodoListInput = {
  width: '100%',
  height: '36px',
  lineHeight: '32px',
  border: 'solid 1px #eee',
  borderRadius: '7px',
  paddingLeft: '8px'
};

export default TodoListInput;
