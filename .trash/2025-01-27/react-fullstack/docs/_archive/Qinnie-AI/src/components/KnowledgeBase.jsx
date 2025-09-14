import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileText, 
  Search, 
  ChevronRight, 
  ChevronDown, 
  BookOpen,
  DollarSign,
  Scale,
  Megaphone,
  Users,
  Code,
  Target,
  BarChart3
} from 'lucide-react'

const KnowledgeBase = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedSections, setExpandedSections] = useState({})
  const [selectedDocument, setSelectedDocument] = useState(null)

  const knowledgeSections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: BookOpen,
      color: '#6366f1',
      documents: [
        { id: 'welcome', title: 'Welcome to Your Business Success Hub', description: 'How to use this knowledge base and get the most value for your business' }
      ]
    },
    {
      id: 'finance',
      title: 'Financial Management',
      icon: DollarSign,
      color: '#10b981',
      documents: [
        { id: 'getting-started-finance', title: 'Getting Started with Business Finances', description: 'Essential financial concepts, setting up your system, and monthly tasks' },
        { id: 'budgeting', title: 'Budgeting and Financial Planning', description: 'How to create budgets, track expenses, and plan for growth' },
        { id: 'tax-planning', title: 'Tax Planning and Compliance', description: 'Understanding business taxes, deductions, and staying compliant' }
      ]
    },
    {
      id: 'marketing',
      title: 'Marketing & Sales',
      icon: Megaphone,
      color: '#f59e0b',
      documents: [
        { id: 'marketing-fundamentals', title: 'Marketing Fundamentals', description: 'Understanding customers, creating messages, and choosing marketing channels' },
        { id: 'social-media', title: 'Social Media Marketing', description: 'Platform selection, content creation, and building your following' }
      ]
    },
    {
      id: 'legal',
      title: 'Legal & Compliance',
      icon: Scale,
      color: '#3b82f6',
      documents: [
        { id: 'business-setup', title: 'Business Setup and Legal Requirements', description: 'Choosing business structure, getting licenses, and legal protection' }
      ]
    },
    {
      id: 'operations',
      title: 'Operations & Efficiency',
      icon: Target,
      color: '#06b6d4',
      documents: [
        { id: 'coming-soon', title: 'Operations Guides Coming Soon', description: 'We\'re working on comprehensive guides for business operations, team management, and efficiency' }
      ]
    },
    {
      id: 'growth',
      title: 'Growth & Scaling',
      icon: BarChart3,
      color: '#8b5cf6',
      documents: [
        { id: 'growth-coming-soon', title: 'Growth Strategies Coming Soon', description: 'Advanced guides for scaling your business, hiring, and expanding operations' }
      ]
    }
  ]

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

  const filteredSections = knowledgeSections.filter(section =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.documents.some(doc =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  const handleDocumentClick = (document) => {
    setSelectedDocument(document)
  }

  return (
    <div className="knowledge-base">
      <div className="kb-header">
        <div className="kb-title">
          <BookOpen size={24} />
          <h2>Knowledge Base</h2>
        </div>
        <p className="kb-subtitle">
          Practical guides and resources to help you start, run, and grow your business successfully
        </p>
      </div>

      {/* Search Bar */}
      <div className="search-section">
        <div className="search-input-group">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search knowledge base..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Knowledge Sections */}
      <div className="knowledge-sections">
        <AnimatePresence>
          {filteredSections.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className="knowledge-section"
            >
              <div
                className="section-header"
                onClick={() => toggleSection(section.id)}
              >
                <div className="section-title">
                  <section.icon size={20} style={{ color: section.color }} />
                  <span>{section.title}</span>
                </div>
                <motion.div
                  animate={{ rotate: expandedSections[section.id] ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight size={20} />
                </motion.div>
              </div>

              <AnimatePresence>
                {expandedSections[section.id] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="section-content"
                  >
                    <div className="documents-grid">
                      {section.documents.map((doc) => (
                        <motion.div
                          key={doc.id}
                          className="document-card"
                          onClick={() => handleDocumentClick(doc)}
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="document-header">
                            <FileText size={16} />
                            <h4>{doc.title}</h4>
                          </div>
                          <p className="document-description">{doc.description}</p>
                          <div className="document-footer">
                            <span className="document-type">Document</span>
                            <ChevronRight size={16} />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Document Modal */}
      <AnimatePresence>
        {selectedDocument && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="document-modal-overlay"
            onClick={() => setSelectedDocument(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="document-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>{selectedDocument.title}</h3>
                <button
                  className="modal-close"
                  onClick={() => setSelectedDocument(null)}
                >
                  ×
                </button>
              </div>
              <div className="modal-content">
                <p>{selectedDocument.description}</p>
                <div className="modal-actions">
                  <button className="btn btn-primary">
                    <FileText size={16} />
                    View Full Document
                  </button>
                  <button className="btn btn-secondary">
                    Download PDF
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Stats */}
      <div className="kb-stats">
        <div className="stat-card">
          <BarChart3 size={20} />
          <div className="stat-content">
            <span className="stat-number">6</span>
            <span className="stat-label">Business Areas</span>
          </div>
        </div>
        <div className="stat-card">
          <FileText size={20} />
          <div className="stat-content">
            <span className="stat-number">8+</span>
            <span className="stat-label">Guides</span>
          </div>
        </div>
        <div className="stat-card">
          <BookOpen size={20} />
          <div className="stat-content">
            <span className="stat-number">Growing</span>
            <span className="stat-label">Content</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default KnowledgeBase
