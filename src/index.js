var React = require('react');
var ReactDOM = require('react-dom');
var sha384 = require('js-sha512').sha384;

export default class App extends React.Component {
  constructor(){
    super(...arguments);

    this.state = {
      username: '',
      authToken: '',
      keyPair: null,
      mID: '', // miniLock ID
      wsMsgs: null, // WebSockets connection for getting/sending messages
      messages: [],
      showUsernameModal: false,
      alertMessage: 'Welcome to miniShare!',
      alertStyle: 'success'
    };

    this.decryptMsg = this.decryptMsg.bind(this);
    this.newWebSocket = this.newWebSocket.bind(this);
    this.keypairFromURLHash = this.keypairFromURLHash.bind(this);
    this.promptForUsername = this.promptForUsername.bind(this);
    this.loadUsername = this.loadUsername.bind(this);
  }

  componentDidMount(){
    this.keypairFromURLHash();
  }

  decryptMsg(msg, callback){
    miniLock.crypto.decryptFile(msg,
                                this.state.mID,
                                this.state.keyPair.secretKey,
                                callback);
  }

  newWebSocket(url){
    let ws = new WebSocket(url);
    ws.first = true;

    let that = this;

    ws.onmessage = function(event){
      let data = event.data;
      if (ws.first) {
        // This is the first message, therefore it's an auth challenge
        that.decryptMsg(data, function(authToken){
          ws.send(authToken);
          that.setState({authToken: authToken});
        });
        ws.first = false;
        return;
      }
      console.log("Event data:", data);
    };

    ws.onopen = function(event){
      ws.send(that.state.mID);
    };

    return ws;
  }

  keypairFromURLHash(){
    let passphrase = document.location.hash;
    let email = sha384(passphrase + '@cryptag.org');
    let that = this;
    miniLock.crypto.getKeyPair(passphrase, email, function(keyPair){
      // Code from https://github.com/kaepora/miniLock/blob/ffea0ecb7a619d921129b8b4aed2081050ec48c1/src/js/ui.js#L78
      // May be useful:
      // https://github.com/kaepora/miniLock/blob/master/src/js/miniLock.js#L18
      miniLock.session.keys = keyPair
      miniLock.session.keyPairReady = true

      let mID = miniLock.crypto.getMiniLockID(keyPair.publicKey);

      that.setState({
        keyPair: keyPair,
        mID: mID
      });

      let host = document.location.host;
      // TODO: Use wss, not ws, in production
      let wsMsgs = that.newWebSocket("ws://" + host + "/api/ws/messages/all");

      that.setState({
        wsMsgs: wsMsgs
      });
    })
  }

  promptForUsername(){
    this.setState({
      showUsernameModal: true
    });
  }

  loadUsername(){
    let { username } = this.state;

    if (!username){
      this.promptForUsername();
    }
  }

  render(){
    let { username, showUsernameModal } = this.state;

    return (
      <div className="app">
        <h2>LeapChat</h2>
      </div>
    )
  }
}

App.propTypes = {}

ReactDOM.render(<App />, document.getElementById('root'));
