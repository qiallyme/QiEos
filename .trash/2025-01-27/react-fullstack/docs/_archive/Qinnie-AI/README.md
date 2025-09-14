# Qinnie AI Voice Assistant

A comprehensive React-based voice assistant application with ElevenLabs AI integration, designed to provide intelligent responses across multiple business domains including finance, legal, marketing, HR, technical architecture, and project management.

## Features

### 🎤 Voice Interface
- **Speech Recognition**: Real-time voice input using Web Speech API
- **Text-to-Speech**: Natural voice responses using browser's speech synthesis
- **Visual Feedback**: Animated voice visualizer and status indicators
- **Fallback Support**: Text input option when voice is unavailable

### 🧠 AI-Powered Knowledge Base
- **Multi-Domain Support**: Finance, Legal, Marketing, HR, Technical, Project Management
- **Semantic Search**: Intelligent document retrieval and response generation
- **Context Awareness**: Maintains conversation history and context
- **Quick Actions**: Pre-defined common questions for faster interaction

### 📚 Comprehensive Documentation
- **Structured Knowledge Base**: Organized by business domains
- **Interactive Document Browser**: Searchable and expandable sections
- **Document Previews**: Quick access to document summaries
- **Responsive Design**: Works seamlessly across all devices

### 🎨 Modern UI/UX
- **Glassmorphism Design**: Beautiful translucent interface with backdrop blur
- **Smooth Animations**: Framer Motion powered transitions
- **Responsive Layout**: Mobile-first design approach
- **Accessibility**: Keyboard navigation and screen reader support

## Technology Stack

### Frontend
- **React 18**: Modern React with hooks and concurrent features
- **Vite**: Fast build tool and development server
- **Framer Motion**: Smooth animations and transitions
- **Lucide React**: Beautiful icon library
- **React Hot Toast**: Elegant notification system

### Voice & AI
- **Web Speech API**: Browser-native speech recognition and synthesis
- **Custom AI Logic**: Simulated knowledge base queries with domain-specific responses
- **Context Management**: Conversation history and state management

### Styling
- **CSS3**: Modern CSS with custom properties and animations
- **Glassmorphism**: Translucent design with backdrop filters
- **Responsive Grid**: CSS Grid and Flexbox layouts
- **Custom Animations**: Keyframe animations and transitions

## Project Structure

```
qinnie-ai-voice-assistant/
├── public/
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── Header.css
│   │   ├── VoiceAssistant.jsx
│   │   ├── VoiceAssistant.css
│   │   ├── KnowledgeBase.jsx
│   │   └── KnowledgeBase.css
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   └── index.css
├── 1_Knowledge_Base/
│   ├── 00_Knowledge_Base_Architecture.md
│   ├── 01_Finance_Management.md
│   ├── 02_Legal_Framework.md
│   ├── 03_Marketing_Strategy.md
│   ├── 04_Human_Resources.md
│   ├── 05_Technical_Architecture.md
│   ├── 06_Project_Scope.md
│   └── 07_KPIs.md
├── package.json
├── vite.config.js
├── index.html
└── README.md
```

## Knowledge Base Architecture

The application includes a comprehensive knowledge base covering:

### 📊 Finance Management
- Budget planning and control
- Cost structure analysis
- Financial reporting and KPIs
- Tax considerations and compliance

### ⚖️ Legal Framework
- Contract management
- Intellectual property protection
- Regulatory compliance
- Risk management strategies

### 📈 Marketing Strategy
- Campaign management
- Content strategy and calendar
- Performance analytics
- Brand management

### 👥 Human Resources
- Recruitment strategies
- Performance management
- Training and development
- Retention strategies

### 💻 Technical Architecture
- Technology stack selection
- API design and documentation
- Security requirements
- Performance optimization

### 🎯 Project Management
- Scope definition
- Timeline management
- Risk assessment
- Quality assurance

## Installation & Setup

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Modern web browser with Web Speech API support

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd qinnie-ai-voice-assistant
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage Guide

### Voice Interaction

1. **Start Listening**: Click the microphone button to begin voice input
2. **Speak Clearly**: Ask questions about any business domain
3. **Wait for Response**: The AI will process and respond with voice and text
4. **Continue Conversation**: Ask follow-up questions for deeper insights

### Text Interaction

1. **Type Questions**: Use the text input field as an alternative to voice
2. **Quick Actions**: Click pre-defined questions for common topics
3. **Search Knowledge Base**: Browse documents by category

### Knowledge Base Navigation

1. **Browse by Category**: Expand sections to see available documents
2. **Search Functionality**: Use the search bar to find specific topics
3. **Document Preview**: Click documents to see summaries and access full content

## Browser Compatibility

### Supported Browsers
- **Chrome 25+**: Full voice support
- **Edge 79+**: Full voice support
- **Safari 14.1+**: Limited voice support
- **Firefox**: Text-only mode (voice recognition not supported)

### Required Permissions
- **Microphone Access**: Required for voice input
- **Modern Browser**: Web Speech API support needed

## Customization

### Adding New Knowledge Domains

1. **Create Document**: Add new markdown files to `1_Knowledge_Base/`
2. **Update Components**: Modify `KnowledgeBase.jsx` to include new sections
3. **Enhance AI Logic**: Update response logic in `App.jsx`

### Styling Customization

- **Colors**: Modify CSS custom properties in component files
- **Animations**: Adjust Framer Motion configurations
- **Layout**: Update CSS Grid and Flexbox properties

### Voice Customization

- **Speech Recognition**: Modify language and settings in `VoiceAssistant.jsx`
- **Text-to-Speech**: Adjust voice parameters in the `speakResponse` function
- **Visual Feedback**: Customize voice visualizer animations

## API Integration

### ElevenLabs Integration (Future Enhancement)

To integrate with ElevenLabs API:

1. **Get API Key**: Sign up at [ElevenLabs](https://elevenlabs.io)
2. **Install SDK**: `npm install elevenlabs`
3. **Configure**: Add API key to environment variables
4. **Implement**: Replace Web Speech API with ElevenLabs SDK

```javascript
// Example ElevenLabs integration
import { ElevenLabs } from 'elevenlabs'

const elevenlabs = new ElevenLabs({
  apiKey: process.env.REACT_APP_ELEVENLABS_API_KEY
})

const generateSpeech = async (text) => {
  const audio = await elevenlabs.generate({
    voice: 'rachel',
    text: text,
    model_id: 'eleven_monolingual_v1'
  })
  return audio
}
```

## Performance Optimization

### Current Optimizations
- **Code Splitting**: Lazy loading of components
- **Memoization**: React.memo for expensive components
- **Debounced Search**: Optimized search input handling
- **Efficient Animations**: Hardware-accelerated CSS transforms

### Future Enhancements
- **Service Worker**: Offline functionality
- **Caching**: Intelligent response caching
- **Bundle Optimization**: Tree shaking and minification
- **CDN Integration**: Static asset delivery

## Security Considerations

### Data Privacy
- **No Data Storage**: Conversations are not persisted
- **Local Processing**: Voice recognition happens in browser
- **HTTPS Required**: Secure communication for production

### Best Practices
- **Input Validation**: Sanitize all user inputs
- **Rate Limiting**: Prevent abuse of voice features
- **Error Handling**: Graceful degradation on failures

## Troubleshooting

### Common Issues

**Voice Recognition Not Working**
- Check microphone permissions
- Ensure HTTPS in production
- Verify browser compatibility

**Audio Playback Issues**
- Check browser audio settings
- Verify speech synthesis support
- Test with different browsers

**Performance Issues**
- Clear browser cache
- Disable browser extensions
- Check system resources

### Debug Mode

Enable debug logging by setting:
```javascript
localStorage.setItem('debug', 'true')
```

## Contributing

### Development Workflow

1. **Fork Repository**: Create your own fork
2. **Create Branch**: `git checkout -b feature/new-feature`
3. **Make Changes**: Implement your changes
4. **Test Thoroughly**: Ensure all features work
5. **Submit PR**: Create pull request with description

### Code Standards

- **ESLint**: Follow configured linting rules
- **Prettier**: Consistent code formatting
- **Component Structure**: Follow established patterns
- **Documentation**: Update README for new features

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- **Issues**: Create GitHub issues for bugs
- **Discussions**: Use GitHub discussions for questions
- **Documentation**: Check the knowledge base for detailed guides

## Roadmap

### Phase 1 (Current)
- ✅ Basic voice interface
- ✅ Knowledge base integration
- ✅ Responsive design
- ✅ Core functionality

### Phase 2 (Next)
- 🔄 ElevenLabs API integration
- 🔄 Advanced AI responses
- 🔄 User authentication
- 🔄 Conversation persistence

### Phase 3 (Future)
- 📋 Multi-language support
- 📋 Advanced analytics
- 📋 API integrations
- 📋 Mobile app development

---

**Built with ❤️ for intelligent business assistance**
