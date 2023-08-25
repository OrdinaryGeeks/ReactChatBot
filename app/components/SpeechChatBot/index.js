/**
 *
 * SpeechChatBot
 *
 */

import io from 'socket.io-client';
import React from 'react';
// import annyang from 'annyang';
import { ChatbotButton } from './styles';
// import PropTypes from 'prop-types';
// import styled from 'styled-components';

class SpeechChatBot extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hello: '',
      start: false,
      stop: false,
      input: '...',
      ouput: '...',
    };
  }

  componentDidMount() {
    const installFontAwesome = () => {
      const elem = document.createElement('link');
      elem.rel = 'stylesheet';
      elem.href =
        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css';
      elem.async = true;
      elem.defer = true;
      document.body.insertBefore(elem, document.body.firstChild);
    };
    installFontAwesome();

    let DialogFlowReplyText = '';

    const socket = io();
    socket.on('now', data => {
      this.setState({
        hello: data.message,
      });
    });

    this.recognition = new (window.SpeechRecognition ||
      window.webkitSpeechRecognition ||
      window.mozSpeechRecognition ||
      window.msSpeechRecognition)();
    this.recognition.lang = 'en-US';
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;

    // document.querySelector("button").addEventListener("click", () => {
    //   this.recognition.start();
    // });

    this.recognition.onstart = () => {
      // this.setState({start: true});
      console.log('Speech has been detected.');
    };
    this.recognition.onresult = e => {
      // this.setState({stop: true});
      // this.setState({start: false});

      console.log('Result has been detected.');

      const last = e.results.length - 1;
      const text = e.results[0][0].transcript;

      // outputYou.textContent = text;
      this.setState({ input: text });
      console.log(`Confidence: ${e.results[0][0].confidence}`);

      socket.emit('chat message', text);
    };
    this.recognition.onend = () => {
      this.recognition.stop();
    };
    // this.recognition.addEventListener('speechend', () => {
    //   this.recognition.stop();
    // });

    this.recognition.onerror = e => {
      // outputBot.textContent = `Error: ${e.error}`;
      this.setState({ output: e.error });
    };

    socket.on('bot reply', replyText => {
      this.synthVoice(replyText);
      this.DialogFlowReplyText = replyText;
      if (replyText === '') {
        // outputBot.textContent = "(No answer...)";
        this.setState({ output: '(No answer...)' });
      }
      // outputBot.textContent = replyText;
      this.setState({ output: replyText });
    });
    // synth voice
    this.synth = window.speechSynthesis;
    this.utterance = new SpeechSynthesisUtterance();
    this.voice = this.synth.getVoices()[48];
  }

  componentWillUnmount() {}

  synthVoice(text) {
    this.utterance.voice = this.voice;
    this.utterance.text = text;
    this.synth.speak(this.utterance);
  }

  render() {
    return (
      <section>
        <h3>Talk to Our Chatbot</h3>
        <p>Click the button and ask about shipping or return policy</p>

        <ChatbotButton
          onClick={() => {
            this.recognition.start();
          }}
        >
          <i className="fa fa-microphone" />
        </ChatbotButton>
        <div>
          <p>
            You said: <em className="output-you">{this.state.input}</em>
          </p>
          <p>
            Bot replied: <em className="output-bot">{this.state.output}</em>
          </p>
        </div>
      </section>
    );
  }
}

SpeechChatBot.propTypes = {};

export default SpeechChatBot;
