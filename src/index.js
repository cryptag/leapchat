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
    console.log("Trying to decrypt", msg);
    miniLock.crypto.decryptFile(msg,
                                this.state.mID,
                                this.state.keyPair.secretKey,
                                callback);
  }

  login(callback){
    let that = this;

    let host = document.location.host;
    // TODO: Use https, not http, in production
    fetch("http://" + host + "/api/login", {
      headers: {
        'X-Minilock-Id': this.state.mID
      },
    }).then(function(resp){
      return resp.text();
    }).then(function(body){
      that.decryptMsg(body, function(authToken){
        that.setState({
          authToken: authToken
        })
        callback();
      })
    })
  }

  newWebSocket(url){
    let ws = new WebSocket(url);
    ws.first = true;

    let that = this;

    ws.onopen = function(event){
      let authToken = that.state.authToken;
      console.log("Sending auth token `%s`", authToken);
      ws.send(authToken);
    };

    ws.onmessage = function(event){
      let data = event.data;
      console.log("Event data:", data);
    };

    return ws;
  }

  keypairFromURLHash(){
    let passphrase = document.location.hash;
    console.log("URL hash is", passphrase);
    let email = sha384(passphrase + '@cryptag.org');
    let that = this;
    miniLock.crypto.getKeyPair(passphrase, email, function(keyPair){
      // Code from https://github.com/kaepora/miniLock/blob/ffea0ecb7a619d921129b8b4aed2081050ec48c1/src/js/ui.js#L78
      // May be useful:
      // https://github.com/kaepora/miniLock/blob/master/src/js/miniLock.js#L18
      miniLock.session.keys = keyPair
      miniLock.session.keyPairReady = true

      console.log("keyPair ==", keyPair);
      let mID = miniLock.crypto.getMiniLockID(keyPair.publicKey);
      console.log("mID ==", mID);

      that.setState({
        keyPair: keyPair,
        mID: mID
      });

      let host = document.location.host;

      that.login(function(){
        // TODO: Use wss, not ws, in production
        let wsMsgs = that.newWebSocket("ws://" + host + "/api/ws/messages/all");

        that.setState({
          wsMsgs: wsMsgs
        });
      })
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
