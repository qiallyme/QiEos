import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Volume2, VolumeX, Trash2, Send } from 'lucide-react'
import { toast } from 'react-hot-toast'

const VoiceAssistant = ({
  isListening,
  setIsListening,
  isSpeaking,
  isLoading,
  currentResponse,
  conversationHistory,
  onVoiceResponse,
  onClearConversation
}) => {
  const [textInput, setTextInput] = useState('')
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef(null)
  const conversationRef = useRef(null)

  useEffect(() => {
    // Check for speech recognition support
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsSupported(true)
      initializeSpeechRecognition()
    } else {
      toast.error('Speech recognition not supported in this browser')
    }

    // Scroll to bottom of conversation when new messages are added
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight
    }
  }, [conversationHistory])

  const initializeSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    recognitionRef.current = new SpeechRecognition()
    
    recognitionRef.current.continuous = false
    recognitionRef.current.interimResults = false
    recognitionRef.current.lang = 'en-US'

    recognitionRef.current.onstart = () => {
      setIsListening(true)
      toast.success('Listening...')
    }

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      onVoiceResponse(transcript)
    }

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
      
      switch (event.error) {
        case 'no-speech':
          toast.error('No speech detected. Please try again.')
          break
        case 'audio-capture':
          toast.error('Microphone not accessible. Please check permissions.')
          break
        case 'not-allowed':
          toast.error('Microphone access denied. Please allow microphone access.')
          break
        default:
          toast.error('Speech recognition failed. Please try again.')
      }
    }

    recognitionRef.current.onend = () => {
      setIsListening(false)
    }
  }

  const startListening = () => {
    if (recognitionRef.current && !isListening && !isSpeaking) {
      try {
        recognitionRef.current.start()
      } catch (error) {
        console.error('Error starting speech recognition:', error)
        toast.error('Failed to start listening')
      }
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }

  const handleTextSubmit = (e) => {
    e.preventDefault()
    if (textInput.trim() && !isLoading) {
      onVoiceResponse(textInput.trim())
      setTextInput('')
    }
  }

  const getStatusText = () => {
    if (isLoading) return 'Processing...'
    if (isListening) return 'Listening...'
    if (isSpeaking) return 'Speaking...'
    return 'Ready to help'
  }

  const getStatusClass = () => {
    if (isLoading) return 'loading'
    if (isListening) return 'listening'
    if (isSpeaking) return 'speaking'
    return 'idle'
  }

  return (
    <div className="voice-assistant">
      {/* Status Header */}
      <div className="assistant-header">
        <div className="status-section">
          <div className={`status-indicator ${getStatusClass()}`}>
            <div className="status-dot" />
            <span>{getStatusText()}</span>
          </div>
        </div>
        
        <div className="header-actions">
          <motion.button
            className="btn btn-secondary"
            onClick={onClearConversation}
            disabled={conversationHistory.length === 0}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Trash2 size={16} />
            Clear
          </motion.button>
        </div>
      </div>

      {/* Voice Controls */}
      <div className="voice-controls">
        <motion.button
          className={`voice-button ${isListening ? 'listening' : ''}`}
          onClick={isListening ? stopListening : startListening}
          disabled={!isSupported || isSpeaking || isLoading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <AnimatePresence mode="wait">
            {isListening ? (
              <motion.div
                key="mic-off"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.2 }}
              >
                <MicOff size={32} />
              </motion.div>
            ) : (
              <motion.div
                key="mic-on"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Mic size={32} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        <div className="voice-instructions">
          <p>
            {isListening 
              ? 'Speak now...' 
              : isSpeaking 
                ? 'I\'m speaking...' 
                : isLoading 
                  ? 'Processing your request...' 
                  : 'Click the microphone to start speaking'
            }
          </p>
        </div>
      </div>

      {/* Voice Visualizer */}
      <AnimatePresence>
        {(isListening || isSpeaking) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="voice-visualizer"
          >
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="voice-bar"
                animate={{
                  height: isListening ? [8, 32, 8] : [8, 24, 8],
                  opacity: [0.4, 1, 0.4]
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.1
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Text Input Alternative */}
      <form onSubmit={handleTextSubmit} className="text-input-form">
        <div className="input-group">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Or type your question here..."
            className="text-input"
            disabled={isLoading}
          />
          <motion.button
            type="submit"
            className="btn btn-primary"
            disabled={!textInput.trim() || isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Send size={16} />
          </motion.button>
        </div>
      </form>

      {/* Current Response */}
      <AnimatePresence>
        {currentResponse && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="current-response"
          >
            <div className="response-header">
              <Volume2 size={16} />
              <span>AI Response</span>
            </div>
            <div className="response-content">
              {isLoading ? (
                <div className="loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              ) : (
                <p>{currentResponse}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Conversation History */}
      {conversationHistory.length > 0 && (
        <div className="conversation-section">
          <h3>Conversation History</h3>
          <div className="conversation-container" ref={conversationRef}>
            <AnimatePresence>
              {conversationHistory.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className={`conversation-item ${item.type}`}
                >
                  <div className="conversation-bubble">
                    {item.message}
                  </div>
                  <div className="conversation-timestamp">
                    {item.timestamp.toLocaleTimeString()}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="quick-actions">
        <h4>Quick Questions</h4>
        <div className="action-buttons">
          {[
            'How do I create a business budget?',
            'What business structure should I choose?',
            'How do I start marketing my business?',
            'What licenses do I need?'
          ].map((question, index) => (
            <motion.button
              key={index}
              className="btn btn-secondary"
              onClick={() => onVoiceResponse(question)}
              disabled={isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {question}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default VoiceAssistant
