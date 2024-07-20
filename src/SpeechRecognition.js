import React, { useState } from 'react';

const SpeechRecognition = () => {
  const [status, setStatus] = useState('Not started');
  const [transcript, setTranscript] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('French');

  const startRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setStatus('SpeechRecognition API not supported');
      return;
    }

    let recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setStatus('Listening...');
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      setTranscript(finalTranscript);

      if (finalTranscript.length > 0) {
        fetch('http://127.0.0.1:5000/update_text', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: finalTranscript, target_language: targetLanguage }),
        })
        .then(response => response.json())
        .then(data => {
          setDetectedLanguage(data.detected_language);
          setTranslatedText(data.translated_text);
        });
      }
    };

    recognition.onerror = (event) => {
      setStatus('Error - ' + event.error);
    };

    recognition.onend = () => {
      setStatus('Stopped');
    };

    recognition.start();
  };

  return (
    <div>
      <h1>Real-time Voice Language Detection and Translation App</h1>
      <label htmlFor="target-language">Select target language:</label>
      <select id="target-language" value={targetLanguage} onChange={(e) => setTargetLanguage(e.target.value)}>
        <option value="French">French</option>
        <option value="Spanish">Spanish</option>
        <option value="German">German</option>
        <option value="Chinese">Chinese</option>
        <option value="Japanese">Japanese</option>
      </select>
      <br /><br />
      <button onClick={startRecognition}>Start Recording</button>
      <p>Status: {status}</p>
      <p>Transcript: {transcript}</p>
      <p>Detected Language: {detectedLanguage}</p>
      <p>Translated Text: {translatedText}</p>
    </div>
  );
};

export default SpeechRecognition;
