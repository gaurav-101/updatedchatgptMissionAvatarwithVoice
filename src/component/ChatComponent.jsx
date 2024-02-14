
import { useState, useEffect, useRef } from 'react';

import {
  MainContainer,
  MessageList,
  Message,
  TypingIndicator,
} from '@chatscope/chat-ui-kit-react';
// import Speech from 'speak-tts'


// const API_KEY = "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";

const API_KEY = "";
const ChatComponent = () => {
  const [messages, setMessages] = useState([
    {
      message: "Hello, I'm Omni! Ask me anything!",
      sentTime: "just now",
      sender: "Omni",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
 // New state
  const messageListRef = useRef(null);

  useEffect(() => {
    // Scroll to the bottom of the message list whenever a new message is added
    if (messageListRef.current) {
      setTimeout(() => {
        messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
      }, 0);
    }
  }, [messages]);

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (inputValue.trim() === '') {
      return; // Don't send empty messages
    }

    const newMessage = {
      message: inputValue,
      direction: 'outgoing',
      sender: "user",
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setIsTyping(true);

    try {
      const response = await processMessageToChatGPT([...messages, newMessage]);
      const content = response.choices[0]?.message?.content;
      if (content) {
        const chatGPTResponse = {
          message: content,
          sender: "ChatGPT",
        };
        setMessages((prevMessages) => [...prevMessages, chatGPTResponse]);
        speakText(content);

      }
    } catch (error) {
      console.error("Error processing message:", error);
    } finally {
      setIsTyping(false);

      setInputValue(''); // Clear input after sending


    }
  };

  async function processMessageToChatGPT(chatMessages) {
    const apiMessages = chatMessages.map((messageObject) => {
        const role = messageObject.sender === "ChatGPT" ? "assistant" : "user";
        return { role, content: messageObject.message };
      });
  
      const apiRequestBody = {
        "model": "gpt-3.5-turbo",
        "messages": [
          { role: "system", content: "I'm a Student using ChatGPT for learning" },
          ...apiMessages,
        ],
      };
  
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiRequestBody),
      });
  
      return response.json();
  }
  const [audioStatus, setAudioStatus] = useState(' ');

 const speakText = (text) => {
  setAudioStatus('Preparing Voice');
  
  // synth.speak(utterance);
  if ('speechSynthesis' in window) {
    
    const msg = new SpeechSynthesisUtterance();
    let voices = window.speechSynthesis.getVoices();

    // If voices are not available, use a timeout to wait for voices to be loaded
    if (voices.length === 0) {
      setTimeout(() => {
        voices = window.speechSynthesis.getVoices();
        setVoiceAndSpeak();
      }, 1000);
    } else {
      setVoiceAndSpeak();
    }

    

    function setVoiceAndSpeak() {
      setAudioStatus('🔊');
      // Find a female voice
      const femaleVoice = voices.find((voice) => voice.name.includes('Female'));

      // Set the chosen voice
      msg.voice = femaleVoice || voices[0]; // Default to the first available voice if not found
      msg.text = text;

      // Speak the text
      msg.addEventListener('end', () => {
        // Update audio status to empty string when voice is finished
        setAudioStatus(' ');
      });

      speechSynthesis.speak(msg);
    }
  } else {
    console.error('SpeechSynthesis is not supported in this browser.');
  }
  
  };


// const speakText = async (text) => {
//   try {
//     const speech = new Speech()
//     speech.setVoice('female')

//     // Convert array buffer to Blob
//     speech.speak({
//       text: text,
//   }).then(() => {
//       console.log("Success !")
//   }).catch(e => {
//       console.error("An error occurred :", e)
//   })

//   } catch (error) {
//     console.error("Error processing text-to-speech request:", error);
//     setIsSpeaking(false);
//   }
// };




// ... (existing code)




  return (
    <div className="app-container" style={{ backgroundColor: "rgba(0, 0, 0, 0)", color: "#ccc", minHeight: "50vh", display: "flex", alignItems: "center", justifyContent: "center", zIndex: "3" }}>
  <div style={{ width: "50%", maxWidth: "700px", borderRadius: "10px", overflow: "hidden", padding: "20px" }}>
        <MessageList
          ref={messageListRef}
          style={{ maxHeight: "400px", overflowY: "auto" }}
          scrollBehavior="smooth"
          typingIndicator={isTyping ? <TypingIndicator content="Omni is typing" /> : null}
        >
          {messages.map((message, i) => (
            <Message
              key={i}
              model={message}
              style={{
                marginBottom: "10px",
                background: message.sender === "user" ? "#007BFF" : "#6C757D", // Different background for user and AI messages
                color: "#fff", // Text color
                borderRadius: "8px",
                padding: "8px",
                alignSelf: message.sender === "user" ? "flex-end" : "flex-start", // Align user messages to the right, AI messages to the left
                fontSize: "14px", // Set the font size to your desired value
              }}
            />
          ))}
        </MessageList>
        
        <form onSubmit={handleSendRequest}>
          <div style={{ display: "flex", marginTop: "10px" }}>
          
            <input
              type="text"
              style={{ flex: "1", marginRight: "10px", padding: "8px", borderRadius: "8px", border: "1px solid #ccc" }}
              placeholder="Type a message"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button
              type="submit"
              style={{
                backgroundColor: "#28a745", // Button color
                color: "#fff", // Text color
                border: "none",
                padding: "10px",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Send
            </button>
          </div>
          
        </form>
        
          <div className='audioStatus'>{`${audioStatus}`}</div>
        
      </div>
    </div>
  )
}

export default ChatComponent;
