import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Tooltip, OverlayTrigger } from 'react-bootstrap';

import { FaMicrophone } from 'react-icons/fa';
import { FaMicrophoneAlt } from 'react-icons/fa';
import { FaMicrophoneSlash } from 'react-icons/fa';

const errorStyles = {'color': 'red'};

const startSpeechCaptureTooltip = (
  <Tooltip id="start-audio-capture">Start Audio Capture</Tooltip>
);

const stopSpeechCaptureTooltip = (
  <Tooltip id="stop-audio-capture">Stop Audio Capture</Tooltip>
);

const StartSpeechCaptureIcon = ({ onStartRecordAudio }) => (
  <OverlayTrigger overlay={startSpeechCaptureTooltip} placement="top" delayShow={300} delayHide={150}>
    <FaMicrophone size={24} onClick={onStartRecordAudio} />
  </OverlayTrigger>
);

const StopSpeechCaptureIcon = ({ onStopRecordAudio }) => (
  <OverlayTrigger overlay={stopSpeechCaptureTooltip} placement="top" delayShow={300} delayHide={150}>
    <FaMicrophoneAlt size={24} onClick={onStopRecordAudio} className="is-recording" />
  </OverlayTrigger>
);

class SpeechCaptureIcon extends Component {
  constructor(props) {
    super(props);

    this.state = {
      speechRecognition: null,
      isRecording: false,
      errorMessage: null
    };

    this.onTranscribeResults = this.onTranscribeResults.bind(this);
    this.onPermissionGranted = this.onPermissionGranted.bind(this);
    this.onError = this.onError.bind(this);
  }

  onPermissionGranted = (mediaStream) => {
    window.localStream = mediaStream;
    this.onStartRecordAudio();
  }

  onError = (errorMessage) => {
    console.error(errorMessage);
    this.setState({
      errorMessage: errorMessage
    });
  }

  onCheckAudioPermissions = () => {
    navigator.mediaDevices
      .getUserMedia({ video: false, audio: true })
      .then(this.onPermissionGranted)
      .catch(this.onError);
  }

  onTranscribeResults = (event) => {
    let transcript = [];
    for (let i = 0; i < event.results.length; i++) {
      transcript.push(event.results[i][0].transcript);
    }
    this.props.onCapture(transcript.join(""));
  }

  onStartRecordAudio = () => {
    const SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition;
    const speechRecognition = new SpeechRecognition();

    speechRecognition.continuous = true;

    speechRecognition.onresult = this.onTranscribeResults;

    speechRecognition.onerror = (error) => {
      let errorMessage = "There was an error capturing audio from your microphone.";
      if (error.error) {
        if (error.error === "service-not-allowed"){
          // Safari users must have dictation enabled
          errorMessage = errorMessage + " You may need to enable dictation in your browser.";
        } else {
          errorMessage = errorMessage + " Your browser may not support this.";
        }
      }
      this.onError(errorMessage);
    };

    speechRecognition.start();
    this.setState({
      speechRecognition: speechRecognition,
      isRecording: true
    });
  }

  onStopRecordAudio = () => {
    const { speechRecognition } = this.state;
    if (speechRecognition) {
      speechRecognition.stop();
    }
    this.setState({
      isRecording: false
    });
  }

  render() {
    const { isRecording, errorMessage } = this.state;

    let audioIcon;
    if (errorMessage) {
      const errorTooltip = <Tooltip id="audio-capture-error">{errorMessage}</Tooltip>;
      audioIcon = (
        <OverlayTrigger overlay={errorTooltip} placement="top" delayShow={300} delayHide={150}>
          <FaMicrophoneSlash size={24} style={errorStyles} />
        </OverlayTrigger>
      );
    } else {
      if (isRecording) {
        audioIcon = (
          <StopSpeechCaptureIcon onStopRecordAudio={this.onStopRecordAudio} />
        );
      } else {
        audioIcon = (
          <StartSpeechCaptureIcon onStartRecordAudio={this.onCheckAudioPermissions} />
        );
      }
    }
    
    return (
      <div className="capture-audio">
        {audioIcon}
      </div>
    );
  }
  
};

SpeechCaptureIcon.propTypes = {
  onCapture: PropTypes.func.isRequired,
};

export default SpeechCaptureIcon;
