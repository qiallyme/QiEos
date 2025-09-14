import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Toaster, toast } from 'react-hot-toast'
import VoiceAssistant from './components/VoiceAssistant'
import KnowledgeBase from './components/KnowledgeBase'
import Header from './components/Header'
import './App.css'

function App() {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [currentResponse, setCurrentResponse] = useState('')
  const [conversationHistory, setConversationHistory] = useState([])
  const [activeTab, setActiveTab] = useState('assistant')
  const [isLoading, setIsLoading] = useState(false)

  const handleVoiceResponse = async (transcript) => {
    setIsLoading(true)
    try {
      // Simulate API call to knowledge base
      const response = await simulateKnowledgeBaseQuery(transcript)
      setCurrentResponse(response)
      setConversationHistory(prev => [
        ...prev,
        { type: 'user', message: transcript, timestamp: new Date() },
        { type: 'assistant', message: response, timestamp: new Date() }
      ])
      
      // Trigger text-to-speech
      await speakResponse(response)
    } catch (error) {
      console.error('Error processing voice input:', error)
      toast.error('Sorry, I encountered an error processing your request.')
    } finally {
      setIsLoading(false)
    }
  }

  const simulateKnowledgeBaseQuery = async (query) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock responses based on query content
    const lowerQuery = query.toLowerCase()
    
    if (lowerQuery.includes('budget') || lowerQuery.includes('finance') || lowerQuery.includes('money')) {
      return "I can help you with financial management! We have guides on getting started with business finances, budgeting and planning, and tax planning. These cover everything from setting up your accounting system to understanding deductions and staying compliant. What specific financial topic would you like to explore?"
    } else if (lowerQuery.includes('legal') || lowerQuery.includes('business setup') || lowerQuery.includes('license')) {
      return "Our legal and compliance section covers business setup, choosing the right business structure, getting licenses and permits, and protecting your business legally. This includes everything from sole proprietorship vs LLC to insurance requirements and contracts. What legal aspect would you like help with?"
    } else if (lowerQuery.includes('marketing') || lowerQuery.includes('social media') || lowerQuery.includes('customers')) {
      return "For marketing and sales, we have practical guides on marketing fundamentals and social media marketing. These cover understanding your customers, creating effective messages, choosing the right platforms, and building your following. What marketing challenge are you facing?"
    } else if (lowerQuery.includes('getting started') || lowerQuery.includes('new business') || lowerQuery.includes('start')) {
      return "Welcome! Our Getting Started section will help you understand how to use this knowledge base effectively. We have practical guides organized by business area - from financial management to marketing and legal requirements. What would you like to focus on first?"
    } else if (lowerQuery.includes('operations') || lowerQuery.includes('efficiency') || lowerQuery.includes('process')) {
      return "Our Operations & Efficiency section is coming soon with comprehensive guides on business operations, team management, and improving efficiency. In the meantime, I can help you with financial management, marketing, and legal setup. What would you like to work on?"
    } else if (lowerQuery.includes('growth') || lowerQuery.includes('scaling') || lowerQuery.includes('expand')) {
      return "Our Growth & Scaling section is coming soon with advanced strategies for expanding your business. Right now, I can help you with the fundamentals - financial management, marketing, and legal setup - which are essential foundations for growth. What would you like to focus on?"
    } else {
      return "I'm here to help you start, run, and grow your business! We have practical guides on financial management, marketing and sales, legal requirements, and more. You can ask me about budgeting, social media marketing, business setup, tax planning, or any other business topic. What would you like to know?"
    }
  }

  const speakResponse = async (text) => {
    setIsSpeaking(true)
    
    // Use Web Speech API for text-to-speech
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 0.8
      
      utterance.onend = () => {
        setIsSpeaking(false)
      }
      
      utterance.onerror = () => {
        setIsSpeaking(false)
        toast.error('Speech synthesis failed')
      }
      
      speechSynthesis.speak(utterance)
    } else {
      // Fallback: just stop speaking indicator
      setTimeout(() => setIsSpeaking(false), 2000)
    }
  }

  const clearConversation = () => {
    setConversationHistory([])
    setCurrentResponse('')
    toast.success('Conversation cleared')
  }

  return (
    <div className="app">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(255, 255, 255, 0.95)',
            color: '#333',
            backdropFilter: 'blur(10px)',
          },
        }}
      />
      
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        conversationCount={conversationHistory.length}
      />
      
      <main className="main-content">
        <AnimatePresence mode="wait">
          {activeTab === 'assistant' ? (
            <motion.div
              key="assistant"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="assistant-container"
            >
              <VoiceAssistant
                isListening={isListening}
                setIsListening={setIsListening}
                isSpeaking={isSpeaking}
                isLoading={isLoading}
                currentResponse={currentResponse}
                conversationHistory={conversationHistory}
                onVoiceResponse={handleVoiceResponse}
                onClearConversation={clearConversation}
              />
            </motion.div>
          ) : (
            <motion.div
              key="knowledge"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="knowledge-container"
            >
              <KnowledgeBase />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

export default App
