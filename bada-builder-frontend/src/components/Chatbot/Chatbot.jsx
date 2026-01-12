import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './Chatbot.css';

const Chatbot = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: 'Hello! 👋 I\'m your Bada Builder assistant. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Quick action buttons
  const quickActions = [
    { label: '🏠 Search Properties', action: 'search' },
    { label: '📍 Find by Location', action: 'location' },
    { label: '💰 Check Prices', action: 'price' },
    { label: '🏢 Our Services', action: 'services' },
    { label: '📞 Contact Us', action: 'contact' }
  ];

  // AI Response Logic
  const generateResponse = (userMessage) => {
    const message = userMessage.toLowerCase();

    // Property search queries
    if (message.includes('search') || message.includes('find') || message.includes('looking for') || message.includes('want to buy')) {
      if (message.includes('flat') || message.includes('apartment')) {
        return {
          text: 'Great! I can help you find flats/apartments. What\'s your preferred location and budget?',
          suggestions: ['Mumbai', 'Delhi', 'Bangalore', 'Under 50L', '50L-1Cr', 'Above 1Cr']
        };
      }
      if (message.includes('house') || message.includes('villa')) {
        return {
          text: 'Looking for an independent house or villa? What location are you interested in?',
          suggestions: ['Luxury Villas', 'Budget Houses', 'Gated Communities']
        };
      }
      if (message.includes('plot') || message.includes('land')) {
        return {
          text: 'I can help you find plots/land. Which city or area are you looking at?',
          suggestions: ['Residential Plots', 'Commercial Land', 'Agricultural Land']
        };
      }
      if (message.includes('commercial') || message.includes('office') || message.includes('shop')) {
        return {
          text: 'Looking for commercial property? What type - office space, shop, or warehouse?',
          suggestions: ['Office Space', 'Retail Shop', 'Warehouse', 'Showroom']
        };
      }
      return {
        text: 'I can help you search for properties! What type are you looking for?',
        suggestions: ['Flat/Apartment', 'House/Villa', 'Plot/Land', 'Commercial'],
        action: () => navigate('/search')
      };
    }

    // Location-based queries
    if (message.includes('location') || message.includes('where') || message.includes('city') || message.includes('area')) {
      const cities = ['mumbai', 'delhi', 'bangalore', 'hyderabad', 'pune', 'ahmedabad', 'chennai', 'kolkata'];
      const foundCity = cities.find(city => message.includes(city));

      if (foundCity) {
        return {
          text: `Great choice! ${foundCity.charAt(0).toUpperCase() + foundCity.slice(1)} has many excellent properties. Let me show you available options.`,
          action: () => navigate(`/search?location=${foundCity}`)
        };
      }
      return {
        text: 'We have properties across India! Which city are you interested in?',
        suggestions: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Pune', 'Ahmedabad']
      };
    }

    // BHK queries
    if (message.includes('bhk') || message.includes('bedroom')) {
      return {
        text: 'How many bedrooms are you looking for?',
        suggestions: ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5+ BHK']
      };
    }

    // Price/Budget queries
    if (message.includes('price') || message.includes('budget') || message.includes('cost') || message.includes('expensive')) {
      return {
        text: 'What\'s your budget range? I can show you properties within your budget.',
        suggestions: ['Under 50L', '50L - 1Cr', '1Cr - 2Cr', '2Cr - 5Cr', 'Above 5Cr']
      };
    }

    // Services queries
    if (message.includes('service') || message.includes('help') || message.includes('assist')) {
      return {
        text: 'We offer comprehensive real estate services:\n\n🏠 Property Search & Listing\n📄 Legal Documentation\n🏦 Home Loan Assistance\n🔍 Property Verification\n📐 Vastu Consultation\n🏗️ Interior Design\n\nWhich service interests you?',
        action: () => navigate('/services')
      };
    }

    // Exhibition queries
    if (message.includes('exhibition') || message.includes('event') || message.includes('property show')) {
      return {
        text: 'Check out our property exhibitions! We showcase:\n\n🏢 Developer Projects\n👤 Individual Properties\n🎯 Live Grouping Events\n\nWould you like to explore?',
        action: () => navigate('/exhibition')
      };
    }

    // Post property queries
    if (message.includes('sell') || message.includes('list') || message.includes('post property') || message.includes('advertise')) {
      return {
        text: 'Want to list your property? You can post it on our platform!\n\n✅ Free listing for subscribers\n✅ Wide reach\n✅ Verified buyers\n\nWould you like to post a property?',
        action: () => navigate('/post-property')
      };
    }

    // Subscription queries
    if (message.includes('subscription') || message.includes('plan') || message.includes('pricing') || message.includes('membership')) {
      return {
        text: 'We offer flexible subscription plans:\n\n📦 Basic Plan\n⭐ Premium Plan\n💎 Enterprise Plan\n\nEach with different benefits. Want to see details?',
        action: () => navigate('/subscription-plans')
      };
    }

    // Contact queries
    if (message.includes('contact') || message.includes('call') || message.includes('email') || message.includes('reach')) {
      return {
        text: 'You can reach us at:\n\n📞 Phone: +91-XXXXXXXXXX\n📧 Email: info@badabuilder.com\n📍 Office: [Your Address]\n\nOr book a site visit directly!',
        action: () => navigate('/book-site-visit')
      };
    }

    // Login/Register queries
    if (message.includes('login') || message.includes('register') || message.includes('sign up') || message.includes('account')) {
      return {
        text: 'You can create an account or login to:\n\n✅ Save favorite properties\n✅ Post your properties\n✅ Get personalized recommendations\n✅ Track your searches\n\nWould you like to login?',
        action: () => navigate('/login')
      };
    }

    // RERA queries
    if (message.includes('rera') || message.includes('legal') || message.includes('verified') || message.includes('authentic')) {
      return {
        text: 'All our listed properties are RERA verified! We ensure:\n\n✅ Legal documentation\n✅ Clear titles\n✅ Verified developers\n✅ Transparent pricing\n\nYour safety is our priority!'
      };
    }

    // Home loan queries
    if (message.includes('loan') || message.includes('emi') || message.includes('finance') || message.includes('mortgage')) {
      return {
        text: 'We provide home loan assistance!\n\n🏦 Multiple bank options\n💰 Best interest rates\n📊 EMI calculator\n📄 Documentation support\n\nWant to check your eligibility?',
        suggestions: ['Calculate EMI', 'Check Eligibility', 'Compare Banks']
      };
    }

    // Possession queries
    if (message.includes('possession') || message.includes('ready') || message.includes('under construction')) {
      return {
        text: 'What possession status are you looking for?',
        suggestions: ['Ready to Move', 'Under Construction', 'Just Launched']
      };
    }

    // Amenities queries
    if (message.includes('amenities') || message.includes('facilities') || message.includes('features')) {
      return {
        text: 'Our properties come with modern amenities:\n\n🏊 Swimming Pool\n🏋️ Gym\n🅿️ Parking\n🔒 Security\n🌳 Garden\n⚡ Power Backup\n\nWhat amenities are important to you?'
      };
    }

    // Greeting responses
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return {
        text: 'Hello! 👋 How can I assist you with your property search today?',
        suggestions: ['Search Properties', 'Our Services', 'Contact Us']
      };
    }

    // Thank you responses
    if (message.includes('thank') || message.includes('thanks')) {
      return {
        text: 'You\'re welcome! 😊 Is there anything else I can help you with?',
        suggestions: ['Search More', 'View Services', 'Contact Support']
      };
    }

    // Default response
    return {
      text: 'I can help you with:\n\n🏠 Property search\n📍 Location-based search\n💰 Budget planning\n🏢 Our services\n📞 Contact information\n\nWhat would you like to know?',
      suggestions: ['Search Properties', 'Find by Location', 'Our Services', 'Contact Us']
    };
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = {
      type: 'user',
      text: inputValue,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Generate bot response
    setTimeout(() => {
      const response = generateResponse(inputValue);
      const botMessage = {
        type: 'bot',
        text: response.text,
        suggestions: response.suggestions,
        action: response.action,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleQuickAction = (action) => {
    let message = '';
    switch (action) {
      case 'search':
        message = 'I want to search for properties';
        break;
      case 'location':
        message = 'Show me properties by location';
        break;
      case 'price':
        message = 'What are the price ranges?';
        break;
      case 'services':
        message = 'Tell me about your services';
        break;
      case 'contact':
        message = 'How can I contact you?';
        break;
      default:
        message = 'Help me';
    }
    setInputValue(message);
    handleSend();
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    setTimeout(() => handleSend(), 100);
  };

  return (
    <>
      {/* Chat Button */}
      <motion.button
        className="chatbot-button"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={isOpen ? { scale: 0 } : { scale: 1 }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        <span className="chat-badge">AI</span>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="chatbot-window"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="chatbot-header">
              <div className="header-content">
                <div className="bot-avatar">🏠</div>
                <div>
                  <h3>Bada Builder Assistant</h3>
                  <p className="status">
                    <span className="status-dot"></span>
                    <span className="status-text">Online</span>
                  </p>
                </div>
              </div>
              <button className="close-btn" onClick={() => setIsOpen(false)}>
                ✕
              </button>
            </div>

            {/* Messages */}
            <div className="chatbot-messages">
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  className={`message ${msg.type}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {msg.type === 'bot' && <div className="message-avatar">🤖</div>}
                  <div className="message-content">
                    <p>{msg.text}</p>
                    {msg.suggestions && (
                      <div className="suggestions">
                        {msg.suggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            className="suggestion-btn"
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                    {msg.action && (
                      <button className="action-btn" onClick={msg.action}>
                        View Details →
                      </button>
                    )}
                  </div>
                  {msg.type === 'user' && <div className="message-avatar user">👤</div>}
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  className="message bot"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="message-avatar">🤖</div>
                  <div className="message-content typing">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {messages.length === 1 && (
              <div className="quick-actions">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    className="quick-action-btn"
                    onClick={() => handleQuickAction(action.action)}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="chatbot-input">
              <input
                type="text"
                placeholder="Type your message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              />
              <button className="send-btn" onClick={handleSend}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
