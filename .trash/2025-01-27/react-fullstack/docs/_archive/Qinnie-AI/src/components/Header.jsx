import React from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, BookOpen, Mic, MicOff } from 'lucide-react'

const Header = ({ activeTab, setActiveTab, conversationCount }) => {
  return (
    <header className="header">
      <div className="header-content">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="header-brand"
        >
          <div className="brand-icon">
            <Mic className="icon" />
          </div>
          <div className="brand-text">
            <h1>Qinnie AI</h1>
            <p>Voice Assistant</p>
          </div>
        </motion.div>

        <nav className="header-nav">
          <motion.button
            className={`nav-button ${activeTab === 'assistant' ? 'active' : ''}`}
            onClick={() => setActiveTab('assistant')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MessageCircle className="nav-icon" />
            <span>Assistant</span>
            {conversationCount > 0 && (
              <span className="nav-badge">{conversationCount}</span>
            )}
          </motion.button>

          <motion.button
            className={`nav-button ${activeTab === 'knowledge' ? 'active' : ''}`}
            onClick={() => setActiveTab('knowledge')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <BookOpen className="nav-icon" />
            <span>Knowledge Base</span>
          </motion.button>
        </nav>
      </div>
    </header>
  )
}

export default Header
