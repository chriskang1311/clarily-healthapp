import React, { useState, useEffect, useRef } from 'react';
import useUserName from '../hooks/useUserName';
import { useToast } from '../contexts/ToastContext';
import styled, { keyframes } from 'styled-components';
import ChatMessage from '../components/ChatMessage';
import LoadingIndicator from '../components/LoadingIndicator';
import PossibilitiesDisplay from '../components/PossibilitiesDisplay';
import SymptomSummary from '../components/SymptomSummary';
import { useNavigate } from 'react-router-dom';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { 
  HiQuestionMarkCircle, 
  HiOutlineX, 
  HiOutlineRefresh,
  HiOutlineDocumentText,
  HiOutlineTrash,
  HiOutlineArrowLeft,
  HiOutlineChevronUp,
  HiOutlineChevronDown,
  HiOutlineThumbUp,
  HiOutlineThumbDown,
  HiOutlineClipboard,
  HiOutlinePrinter,
  HiOutlineMail,
  HiOutlineQuestionMarkCircle,
  HiOutlineSave,
  HiOutlineMicrophone
} from 'react-icons/hi';

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  min-height: 0;
  background-color: ${props => props.theme.colors.background};
  overflow: hidden;
`;

const WelcomeSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 32px 20px;
  text-align: center;
  border-bottom: 1px solid #E0E0E0;
  flex-shrink: 0;
  background-color: ${props => props.theme.colors.background};
  z-index: 1;
  transition: all 0.3s ease;
  
  @media (max-width: 768px) {
    padding: 16px 20px 16px;
  }
  
  ${props => props.isCollapsed && `
    padding: 12px 32px;
    
    @media (max-width: 768px) {
      padding: 8px 20px;
    }
  `}
`;

const CollapseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 32px;
  background: none;
  border: none;
  color: ${props => props.theme.colors.primary};
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
  opacity: 0.7;
  
  &:hover {
    background-color: ${props => props.theme.colors.primaryLight};
    opacity: 1;
  }
  
  @media (max-width: 768px) {
    top: 12px;
    right: 20px;
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const WelcomeContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  transition: max-height 0.3s ease, opacity 0.3s ease;
  overflow: hidden;
  
  ${props => props.isCollapsed ? `
    max-height: 0;
    opacity: 0;
    margin: 0;
  ` : `
    max-height: 1000px;
    opacity: 1;
  `}
`;

const IconsContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
`;

const IconWrapper = styled.div`
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.borderRadius.medium};
  transform: rotate(45deg);
  
  svg {
    transform: rotate(-45deg);
    color: ${props => props.theme.colors.buttonText};
    width: 24px;
    height: 24px;
  }
`;

const WelcomeTitle = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
  margin: 0 0 12px 0;
  
  @media (max-width: 768px) {
    font-size: 24px;
    margin: 0 0 8px 0;
  }
`;

const PrimaryPrompt = styled.p`
  font-size: 20px;
  font-weight: 600;
  color: ${props => props.theme.colors.primary};
  margin: 0 0 12px 0;
  
  @media (max-width: 768px) {
    font-size: 18px;
    margin: 0 0 8px 0;
  }
`;

const InstructionText = styled.p`
  font-size: 15px;
  color: ${props => props.theme.colors.primary};
  margin: 0;
  max-width: 600px;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const DisclaimerBanner = styled.div`
  background-color: ${props => props.theme.colors.primaryLight};
  border: 1px solid ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.borderRadius.medium};
  padding: 16px;
  margin: 16px 0;
  font-size: 13px;
  color: ${props => props.theme.colors.primary};
  line-height: 1.6;
`;

const CloseDisclaimerButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.primary};
  cursor: pointer;
  padding: 0;
  margin-left: 8px;
  display: inline-flex;
  align-items: center;
  opacity: 0.7;
  
  &:hover {
    opacity: 1;
  }
`;

const ActionButtonsContainer = styled.div`
  display: flex;
  gap: 8px;
  padding: 16px 32px 0;
  flex-wrap: wrap;
  justify-content: center;
  
  @media (max-width: 768px) {
    padding: 12px 20px 0;
    gap: 6px;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.borderRadius.medium};
  background-color: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.primary};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background-color: ${props => props.theme.colors.primaryLight};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const ProgressContainer = styled.div`
  padding: 12px 32px 0;
  
  @media (max-width: 768px) {
    padding: 8px 20px 0;
  }
`;

const ProgressIndicator = styled.div`
  font-size: 14px;
  color: ${props => props.theme.colors.primary};
  opacity: 0.7;
  margin-bottom: 8px;
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 6px;
  background-color: #E0E0E0;
  border-radius: 3px;
  overflow: hidden;
  margin-top: 4px;
`;

const ProgressBar = styled.div`
  height: 100%;
  background-color: ${props => props.theme.colors.primary};
  border-radius: 3px;
  transition: width 0.3s ease;
  width: ${props => props.progress}%;
`;

const ChatArea = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 24px 32px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  
  @media (max-width: 768px) {
    padding: 16px 20px;
  }
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.primary};
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #1e3a0f;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: ${props => props.theme.colors.primary};
  opacity: 0.6;
`;

const EmptyStateTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: ${props => props.theme.colors.primary};
`;

const EmptyStateText = styled.p`
  font-size: 15px;
  margin: 0 0 24px 0;
  max-width: 500px;
  line-height: 1.6;
`;

const ExamplePrompts = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 400px;
  width: 100%;
`;

const ExamplePrompt = styled.button`
  padding: 12px 16px;
  border: 1px solid ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.borderRadius.medium};
  background-color: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.primary};
  font-size: 14px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.theme.colors.primaryLight};
    transform: translateX(4px);
  }
`;

const InputContainer = styled.div`
  padding: 20px 32px;
  border-top: 1px solid #E0E0E0;
  background-color: ${props => props.theme.colors.background};
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    padding: 16px 20px;
  }
`;

const InputSuggestions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 12px;
  
  @media (max-width: 768px) {
    margin-bottom: 8px;
  }
`;

const SuggestionChip = styled.button`
  padding: 6px 12px;
  border: 1px solid ${props => props.theme.colors.primary};
  border-radius: 16px;
  background-color: ${props => props.theme.colors.primaryLight};
  color: ${props => props.theme.colors.primary};
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.buttonText};
  }
`;

const InputWrapper = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  max-width: 1000px;
  margin: 0 auto;
`;

const Input = styled.input`
  flex: 1;
  padding: 14px 20px;
  border: 2px solid #E0E0E0;
  border-radius: ${props => props.theme.borderRadius.medium};
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s;
  
  &:focus {
    border-color: ${props => props.theme.colors.primary};
  }
  
  &::placeholder {
    color: #999;
  }
`;

const SendButton = styled.button`
  padding: 14px 32px;
  background-color: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.buttonText};
  border: none;
  border-radius: ${props => props.theme.borderRadius.medium};
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.1s;
  
  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(229, 57, 53, 0.4); }
  50%       { box-shadow: 0 0 0 6px rgba(229, 57, 53, 0); }
`;

const MicButton = styled.button`
  padding: 14px 18px;
  background-color: ${props => props.listening ? '#E53935' : '#f5f5f5'};
  color: ${props => props.listening ? '#fff' : props.theme.colors.primary};
  border: 1.5px solid ${props => props.listening ? '#E53935' : '#E0E0E0'};
  border-radius: ${props => props.theme.borderRadius.medium};
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s, color 0.2s, border-color 0.2s;
  animation: ${props => props.listening ? pulse : 'none'} 1.2s ease infinite;

  &:hover:not(:disabled) {
    background-color: ${props => props.listening ? '#C62828' : '#eee'};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  padding: 14px 18px;
  background-color: #ffebee;
  color: #c62828;
  border-radius: ${props => props.theme.borderRadius.medium};
  margin-bottom: 16px;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-left: 4px solid #c62828;
`;

const ErrorText = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const ErrorDetail = styled.div`
  font-size: 12px;
  opacity: 0.8;
  margin-top: 4px;
`;

const RetryButton = styled.button`
  padding: 6px 12px;
  background-color: #c62828;
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.small};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    opacity: 0.9;
  }
`;

const SummaryModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.2s ease-in;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const SummaryContent = styled.div`
  background-color: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.borderRadius.medium};
  padding: 32px;
  max-width: 700px;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  animation: slideUp 0.3s ease-out;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  
  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  @media (max-width: 768px) {
    padding: 24px 20px;
    max-width: 100%;
    max-height: 90vh;
  }
`;

const SummaryActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #E0E0E0;
  flex-wrap: wrap;
`;

const SummaryActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.borderRadius.medium};
  background-color: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.primary};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.theme.colors.primaryLight};
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const HelpButton = styled.button`
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.buttonText};
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.2s;
  z-index: 100;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }
  
  svg {
    width: 24px;
    height: 24px;
  }
  
  @media (max-width: 768px) {
    bottom: 20px;
    right: 20px;
    width: 48px;
    height: 48px;
    
    svg {
      width: 20px;
      height: 20px;
    }
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  color: ${props => props.theme.colors.primary};
  cursor: pointer;
  font-size: 24px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  
  &:hover {
    background-color: ${props => props.theme.colors.primaryLight};
  }
`;

const SummaryTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
  margin: 0 0 20px 0;
`;

const SummaryText = styled.div`
  font-size: 16px;
  color: ${props => props.theme.colors.text};
  line-height: 1.6;
  white-space: pre-wrap;
`;

const ConfirmModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.2s ease-in;
`;

const ConfirmContent = styled.div`
  background-color: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.borderRadius.medium};
  padding: 24px;
  max-width: 400px;
  animation: slideUp 0.3s ease-out;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
`;

const ConfirmButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;
  justify-content: flex-end;
`;

const ConfirmButton = styled.button`
  padding: 10px 20px;
  border-radius: ${props => props.theme.borderRadius.medium};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  
  &.primary {
    background-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.buttonText};
    border: none;
  }
  
  &.secondary {
    background-color: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.primary};
    border: 1px solid ${props => props.theme.colors.primary};
  }
  
  &:hover {
    opacity: 0.9;
  }
`;

const STORAGE_KEY = 'clarily-chat-history';
const DISCLAIMER_KEY = 'clarily-disclaimer-accepted';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const Chatbot = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const userName = useUserName();
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFailedMessage, setLastFailedMessage] = useState(null);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [showSummary, setShowSummary] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [summaryText, setSummaryText] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isWelcomeCollapsed, setIsWelcomeCollapsed] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [currentPossibilities, setCurrentPossibilities] = useState(null);
  const [symptomSummary, setSymptomSummary] = useState(null);
  const [isGeneratingSymptomSummary, setIsGeneratingSymptomSummary] = useState(false);
  const [hasRequestedPossibilities, setHasRequestedPossibilities] = useState(false);
  const chatEndRef = useRef(null);
  const chatAreaRef = useRef(null);

  // Load messages and disclaimer status from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem(STORAGE_KEY);
    const disclaimerAccepted = localStorage.getItem(DISCLAIMER_KEY) === 'true';
    
    setShowDisclaimer(!disclaimerAccepted);
    
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        setMessages(parsed);
      } catch (e) {
        console.error('Error loading chat history:', e);
      }
    } else {
      const welcomeMessage = {
        role: 'bot',
        content: `Welcome, ${userName}! Can you describe the symptoms you're experiencing?`,
        timestamp: new Date().toISOString()
      };
      setMessages([welcomeMessage]);
      saveMessages([welcomeMessage]);
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // When voice recognition stops, populate input with transcript
  useEffect(() => {
    if (!listening && transcript) {
      setInputValue(transcript);
      resetTranscript();
    }
  }, [listening, transcript, resetTranscript]);

  // Ensure possibilities are shown after enough exchanges
  useEffect(() => {
    const userMessages = messages.filter(msg => msg.role === 'user');
    const hasPossibilities = messages.some(msg => msg.possibilities && msg.possibilities.length > 0);
    const lastMessage = messages[messages.length - 1];
    const lastMessageHasPossibilities = lastMessage && lastMessage.possibilities && lastMessage.possibilities.length > 0;
    
    // If user has sent 10+ messages, no possibilities have been shown, 
    // last message was from bot (not loading), and doesn't have possibilities,
    // automatically request possibilities (but only once)
    if (
      userMessages.length >= 10 && 
      !hasPossibilities && 
      !hasRequestedPossibilities &&
      !isLoading && 
      lastMessage && 
      lastMessage.role === 'bot' &&
      !lastMessageHasPossibilities &&
      !lastMessage.symptomSummary
    ) {
      setHasRequestedPossibilities(true);
      // Small delay to avoid immediate re-request
      const timer = setTimeout(() => {
        sendMessage("Based on all the information I've provided, can you please provide your assessment of potential diagnoses? I would like to see the diagnostic possibilities.");
      }, 1000);
      
      return () => clearTimeout(timer);
    }
    
    // Reset the flag if possibilities are now shown
    if (hasPossibilities && hasRequestedPossibilities) {
      setHasRequestedPossibilities(false);
    }
  }, [messages, isLoading, hasRequestedPossibilities]);

  const scrollToBottom = () => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  };

  const saveMessages = (msgs) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
  };

  const handleAcceptDisclaimer = () => {
    setShowDisclaimer(false);
    localStorage.setItem(DISCLAIMER_KEY, 'true');
  };

  const handleRetry = () => {
    if (lastFailedMessage) {
      setError(null);
      sendMessage(lastFailedMessage, true);
    }
  };

  const handleUndoLastMessage = () => {
    if (messages.length > 0 && messages[messages.length - 1].role === 'user') {
      const newMessages = messages.slice(0, -1);
      setMessages(newMessages);
      saveMessages(newMessages);
    }
  };

  const handleClearConversation = () => {
    setShowConfirmClear(true);
  };

  const confirmClearConversation = () => {
    const welcomeMessage = {
      role: 'bot',
      content: `Welcome back, ${userName}! Can you describe the symptoms you're experiencing?`,
      timestamp: new Date().toISOString()
    };
    setMessages([welcomeMessage]);
    saveMessages([welcomeMessage]);
    setShowConfirmClear(false);
    setError(null);
    setHasRequestedPossibilities(false); // Reset flag when clearing conversation
  };

  const generateSummary = async () => {
    if (messages.length <= 1) {
      setSummaryText('No conversation to summarize yet. Please have a conversation first.');
      setShowSummary(true);
      return;
    }

    setIsGeneratingSummary(true);
    
    try {
      // Build conversation history for API
      const conversationHistory = messages
        .filter(msg => msg.role !== 'bot' || msg.content !== messages[0].content) // Exclude welcome message
        .map(msg => {
          const msgObj = {
            role: msg.role === 'bot' ? 'assistant' : 'user',
            content: msg.content
          };
          // Include possibilities in summary if they exist
          if (msg.possibilities) {
            msgObj.content += '\n\nPotential Conditions Identified:\n';
            msg.possibilities.forEach((p, idx) => {
              msgObj.content += `${idx + 1}. ${p.condition} (${p.confidence} confidence)${p.description ? ': ' + p.description : ''}\n`;
            });
          }
          return msgObj;
        });

      const response = await fetch(`${API_URL}/summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation: conversationHistory
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate summary');
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setSummaryText(data.summary || 'Unable to generate summary.');
      setShowSummary(true);
    } catch (err) {
      console.error('Error generating summary:', err);
      setSummaryText('Sorry, there was an error generating the summary. Please try again.');
      setShowSummary(true);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const sendMessage = async (messageText, isRetry = false) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: messageText.trim(),
      timestamp: new Date().toISOString()
    };

    if (!isRetry) {
      setError(null);
    }

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    saveMessages(updatedMessages);
    if (!isRetry) {
      setInputValue('');
    }
    setIsLoading(true);

    try {
      const conversationHistory = updatedMessages
        .slice(0, -1)
        .map(msg => ({
          role: msg.role === 'bot' ? 'assistant' : 'user',
          content: msg.content
        }));

      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText.trim(),
          conversation: conversationHistory
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from server. Please check your connection and try again.');
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const botResponse = data.response;
      const possibilities = data.possibilities;

      const botMessage = {
        role: 'bot',
        content: botResponse,
        possibilities: possibilities,
        timestamp: new Date().toISOString()
      };

      const finalMessages = [...updatedMessages, botMessage];
      setMessages(finalMessages);
      saveMessages(finalMessages);
      
      // Set possibilities if provided
      if (possibilities && possibilities.length > 0) {
        setCurrentPossibilities(possibilities);
      } else {
        setCurrentPossibilities(null);
      }
      
      setLastFailedMessage(null);
      setError(null);
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message || 'Failed to send message. Please try again.');
      setLastFailedMessage(messageText.trim());
      
      // Remove the user message on error so they can retry
      if (!isRetry) {
        const messagesWithoutLast = messages;
        setMessages(messagesWithoutLast);
        saveMessages(messagesWithoutLast);
      }
    } finally {
      setIsLoading(false);
    }
  };


  // Extract primary symptom from conversation
  const extractPrimarySymptom = () => {
    // Find the first user message that describes symptoms (skip welcome message)
    const userMessages = messages.filter(msg => msg.role === 'user');
    if (userMessages.length === 0) return 'Symptoms';
    
    const firstUserMessage = userMessages[0].content.toLowerCase();
    
    // Common symptom keywords to extract
    const symptomKeywords = {
      'headache': 'Headache',
      'fever': 'Fever',
      'cough': 'Cough',
      'stomach': 'Stomach Pain',
      'stomach pain': 'Stomach Pain',
      'nausea': 'Nausea',
      'dizziness': 'Dizziness',
      'fatigue': 'Fatigue',
      'pain': 'Pain',
      'chest pain': 'Chest Pain',
      'back pain': 'Back Pain',
      'joint pain': 'Joint Pain',
      'shortness of breath': 'Shortness of Breath',
      'rash': 'Rash',
      'sore throat': 'Sore Throat',
      'diarrhea': 'Diarrhea',
      'constipation': 'Constipation'
    };
    
    // Try to match symptom keywords
    for (const [keyword, symptom] of Object.entries(symptomKeywords)) {
      if (firstUserMessage.includes(keyword)) {
        return symptom;
      }
    }
    
    // If no match, extract first few words from first user message
    const words = userMessages[0].content.split(' ').slice(0, 3).join(' ');
    return words.charAt(0).toUpperCase() + words.slice(1);
  };

  const handleConfirmPossibilities = async () => {
    // Store the confirmed possibilities
    localStorage.setItem('clarily-confirmed-possibilities', JSON.stringify(currentPossibilities));
    
    // Generate symptom summary
    setIsGeneratingSymptomSummary(true);
    
    try {
      // Build conversation history for API
      const conversationHistory = messages
        .filter(msg => msg.role !== 'bot' || msg.content !== messages[0]?.content) // Exclude welcome message
        .map(msg => {
          const msgObj = {
            role: msg.role === 'bot' ? 'assistant' : 'user',
            content: msg.content
          };
          return msgObj;
        });

      const response = await fetch(`${API_URL}/symptom-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation: conversationHistory,
          possibilities: currentPossibilities
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate symptom summary');
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const summary = data.summary || 'Unable to generate summary.';
      setSymptomSummary(summary);

      // Add summary as the last bot message
      const summaryMessage = {
        role: 'bot',
        content: 'Here is your concise symptom summary to bring to your doctor:',
        symptomSummary: summary,
        timestamp: new Date().toISOString()
      };

      const updatedMessages = [...messages, summaryMessage];
      setMessages(updatedMessages);
      saveMessages(updatedMessages);
      
      // Hide possibilities display
      setCurrentPossibilities(null);
      
      // Extract primary symptom and create journey
      const primarySymptom = extractPrimarySymptom();
      const now = new Date().toISOString();
      
      // Create journey via API
      const journeyResponse = await fetch(`${API_URL}/journeys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          primary_symptom: primarySymptom,
          symptom_summary: summary,
          diagnoses: currentPossibilities || [],
          progress_steps: ['Symptoms', 'Insurance', 'Doctor Visit', 'Diagnosis'],
          completed_steps: ['Symptoms'],
          created_at: now,
          updated_at: now
        }),
      });

      if (journeyResponse.ok) {
        // Navigate to homepage after a short delay to show the summary
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        // Still navigate even if journey creation fails
        console.error('Failed to create journey');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
      
    } catch (err) {
      console.error('Error generating symptom summary:', err);
      // Still add a message even if summary generation fails
      const errorMessage = {
        role: 'bot',
        content: 'Thank you for confirming. Your conversation has been saved. Please consult with your healthcare provider.',
        timestamp: new Date().toISOString()
      };
      const updatedMessages = [...messages, errorMessage];
      setMessages(updatedMessages);
      saveMessages(updatedMessages);
      setCurrentPossibilities(null);
      
      // Still try to create journey and navigate
      try {
        const primarySymptom = extractPrimarySymptom();
        const now = new Date().toISOString();
        
        await fetch(`${API_URL}/journeys`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            primary_symptom: primarySymptom,
            symptom_summary: '',
            diagnoses: currentPossibilities || [],
            progress_steps: ['Symptoms', 'Insurance', 'Doctor Visit', 'Diagnosis'],
            completed_steps: ['Symptoms'],
            created_at: now,
            updated_at: now
          }),
        });
      } catch (journeyErr) {
        console.error('Error creating journey:', journeyErr);
      }
      
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } finally {
      setIsGeneratingSymptomSummary(false);
    }
  };

  const handleDenyPossibilities = () => {
    // Continue conversation with more questions
    setCurrentPossibilities(null);
    setHasRequestedPossibilities(false); // Reset flag to allow re-requesting after more info
    sendMessage("I disagree with these diagnoses. Can you ask me more questions to better understand my symptoms?");
  };

  const handleNotSurePossibilities = () => {
    // This handler is no longer used but kept for backwards compatibility
    // Continue conversation with clarification
    setCurrentPossibilities(null);
    sendMessage("I'm not sure about these diagnoses. Can you help me understand better with more questions?");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const getProgressInfo = () => {
    const userMessages = messages.filter(m => m.role === 'user');
    if (messages.length === 0) return '';
    return `${userMessages.length} response${userMessages.length !== 1 ? 's' : ''} provided`;
  };

  const calculateProgress = () => {
    const userMessages = messages.filter(m => m.role === 'user');
    // Estimate progress based on number of exchanges (rough estimate)
    // More exchanges = more complete information
    if (userMessages.length === 0) return 0;
    // Scale progress: 0-10 responses = 0-70%, 10+ = 70-100%
    return Math.min(70 + (userMessages.length - 10) * 3, 95);
  };

  const handleMessageFeedback = (type, messageIndex) => {
    // Feedback functionality - could be sent to backend for analytics
    console.log(`Feedback: ${type} on message ${messageIndex}`);
  };

  const handleCopyMessage = () => {
    console.log('Message copied');
  };

  const handleSaveSummary = () => {
    if (!summaryText) return;
    const blob = new Blob([summaryText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clarily-summary-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrintSummary = () => {
    if (!summaryText) return;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Clarily Conversation Summary</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; color: #333; }
            h1 { color: #2D5016; }
            pre { white-space: pre-wrap; }
          </style>
        </head>
        <body>
          <h1>Clarily Conversation Summary</h1>
          <pre>${summaryText}</pre>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleEmailSummary = () => {
    if (!summaryText) return;
    const subject = encodeURIComponent('Clarily Conversation Summary');
    const body = encodeURIComponent(summaryText);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  // Symptom summary download handlers
  const handleDownloadSymptomSummary = () => {
    if (!symptomSummary) return;
    const blob = new Blob([symptomSummary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clarily-symptom-summary-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrintSymptomSummary = () => {
    if (!symptomSummary) return;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Clarily Symptom Summary</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.8; color: #333; }
            h1 { color: #2D5016; }
            pre { white-space: pre-wrap; font-size: 14px; }
          </style>
        </head>
        <body>
          <h1>Symptom Summary</h1>
          <pre>${symptomSummary}</pre>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleEmailSymptomSummary = () => {
    if (!symptomSummary) return;
    const subject = encodeURIComponent('Clarily Symptom Summary - For Doctor');
    const body = encodeURIComponent(symptomSummary);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleCopySymptomSummary = async () => {
    if (!symptomSummary) return;
    try {
      await navigator.clipboard.writeText(symptomSummary);
      toast.success('Symptom summary copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy to clipboard. Please try again.');
    }
  };

  const getErrorDetails = (errorMessage) => {
    const lowerError = errorMessage.toLowerCase();
    if (lowerError.includes('failed to fetch') || lowerError.includes('network')) {
      return {
        main: 'Connection Error',
        detail: 'Unable to connect to the server. Please check your internet connection and try again.',
        suggestion: 'Make sure your backend server is running and try again.'
      };
    } else if (lowerError.includes('timeout')) {
      return {
        main: 'Request Timeout',
        detail: 'The request took too long to process.',
        suggestion: 'Please try again or check your connection.'
      };
    } else if (lowerError.includes('500') || lowerError.includes('server')) {
      return {
        main: 'Server Error',
        detail: 'There was an issue processing your request.',
        suggestion: 'Please try again in a moment.'
      };
    }
    return {
      main: 'Error',
      detail: errorMessage,
      suggestion: 'Please try again or contact support if the problem persists.'
    };
  };

  const examplePrompts = [
    'What does this symptom mean?',
    'When should I see a doctor?',
    'What should I do next?',
    'Is this serious?'
  ];

  return (
    <ChatContainer>
      <WelcomeSection isCollapsed={isWelcomeCollapsed} style={{ position: 'relative' }}>
        {messages.length > 0 && (
          <CollapseButton 
            onClick={() => setIsWelcomeCollapsed(!isWelcomeCollapsed)}
            aria-label={isWelcomeCollapsed ? 'Expand welcome section' : 'Collapse welcome section'}
            title={isWelcomeCollapsed ? 'Show welcome' : 'Hide welcome'}
          >
            {isWelcomeCollapsed ? <HiOutlineChevronDown /> : <HiOutlineChevronUp />}
          </CollapseButton>
        )}
        <WelcomeContent isCollapsed={isWelcomeCollapsed}>
          <IconsContainer>
            <IconWrapper>
              <HiQuestionMarkCircle />
            </IconWrapper>
            <IconWrapper>
              <HiQuestionMarkCircle />
            </IconWrapper>
          </IconsContainer>
          <WelcomeTitle>Welcome, {userName}!</WelcomeTitle>
          <PrimaryPrompt>Can you describe the symptoms you're experiencing?</PrimaryPrompt>
          <InstructionText>
            Share as much or as little detail as you'd like and I'll follow up to help you better understand your health.
          </InstructionText>
          
          {showDisclaimer && (
            <DisclaimerBanner>
              <strong>Important:</strong> This is an AI assistant for informational purposes only and does not replace professional medical care, diagnosis, or treatment. Always consult with a qualified healthcare provider for medical advice. Your conversation data is stored locally on your device.
              <CloseDisclaimerButton onClick={handleAcceptDisclaimer} aria-label="Close disclaimer">
                <HiOutlineX size={16} />
              </CloseDisclaimerButton>
            </DisclaimerBanner>
          )}
        </WelcomeContent>
      </WelcomeSection>

      {messages.length > 1 && (
        <ActionButtonsContainer>
          <ActionButton 
            onClick={generateSummary}
            disabled={isLoading || isGeneratingSummary}
            title="Generate conversation summary"
          >
            <HiOutlineDocumentText />
            {isGeneratingSummary ? 'Generating...' : 'Summary'}
          </ActionButton>
          <ActionButton 
            onClick={handleUndoLastMessage}
            disabled={isLoading || messages.length === 0 || messages[messages.length - 1].role !== 'user'}
            title="Undo your last message"
          >
            <HiOutlineArrowLeft />
            Undo
          </ActionButton>
          <ActionButton 
            onClick={handleClearConversation}
            disabled={isLoading}
            title="Clear conversation and start over"
          >
            <HiOutlineTrash />
            Clear
          </ActionButton>
        </ActionButtonsContainer>
      )}

      {messages.length > 0 && (
        <ProgressContainer>
          <ProgressIndicator>
            {getProgressInfo()}
          </ProgressIndicator>
          <ProgressBarContainer>
            <ProgressBar progress={calculateProgress()} />
          </ProgressBarContainer>
        </ProgressContainer>
      )}

      <ChatArea ref={chatAreaRef}>
        {messages.length === 0 ? (
          <EmptyState>
            <EmptyStateTitle>Start Your Health Journey</EmptyStateTitle>
            <EmptyStateText>
              I'm here to help you understand your symptoms better. Describe what you're experiencing, and I'll ask follow-up questions to get a complete picture.
            </EmptyStateText>
            <ExamplePrompts>
              {examplePrompts.map((prompt, idx) => (
                <ExamplePrompt key={idx} onClick={() => sendMessage(prompt)}>
                  {prompt}
                </ExamplePrompt>
              ))}
            </ExamplePrompts>
          </EmptyState>
        ) : (
          <>
            {messages.map((message, index) => (
              <div key={index}>
                <ChatMessage 
                  message={message.content} 
                  isUser={message.role === 'user'}
                  timestamp={message.timestamp}
                  onFeedback={(type) => handleMessageFeedback(type, index)}
                  onCopy={handleCopyMessage}
                />
                {message.role === 'bot' && 
                 message.possibilities && 
                 message.possibilities.length > 0 &&
                 index === messages.length - 1 && 
                 !isLoading && (
                  <PossibilitiesDisplay
                    possibilities={message.possibilities}
                    onConfirm={handleConfirmPossibilities}
                    onDeny={handleDenyPossibilities}
                    disabled={isLoading || isGeneratingSymptomSummary}
                  />
                )}
                {message.role === 'bot' && 
                 message.symptomSummary && 
                 index === messages.length - 1 && 
                 !isLoading && (
                  <SymptomSummary
                    summary={message.symptomSummary}
                    onDownload={() => {
                      const blob = new Blob([message.symptomSummary], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `clarily-symptom-summary-${new Date().toISOString().split('T')[0]}.txt`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                    onPrint={() => {
                      const printWindow = window.open('', '_blank');
                      printWindow.document.write(`
                        <html>
                          <head>
                            <title>Clarily Symptom Summary</title>
                            <style>
                              body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.8; color: #333; }
                              h1 { color: #2D5016; }
                              pre { white-space: pre-wrap; font-size: 14px; }
                            </style>
                          </head>
                          <body>
                            <h1>Symptom Summary</h1>
                            <pre>${message.symptomSummary}</pre>
                          </body>
                        </html>
                      `);
                      printWindow.document.close();
                      printWindow.print();
                    }}
                    onEmail={() => {
                      const subject = encodeURIComponent('Clarily Symptom Summary - For Doctor');
                      const body = encodeURIComponent(message.symptomSummary);
                      window.location.href = `mailto:?subject=${subject}&body=${body}`;
                    }}
                    onCopy={async () => {
                      try {
                        await navigator.clipboard.writeText(message.symptomSummary);
                        toast.success('Symptom summary copied to clipboard!');
                      } catch (err) {
                        console.error('Failed to copy:', err);
                        toast.error('Failed to copy to clipboard. Please try again.');
                      }
                    }}
                  />
                )}
              </div>
            ))}
            {isLoading && (
              <LoadingIndicator message="Dr. AI is thinking..." />
            )}
            {isGeneratingSymptomSummary && (
              <LoadingIndicator message="Generating your symptom summary..." />
            )}
            {error && (() => {
              const errorDetails = getErrorDetails(error);
              return (
                <ErrorMessage>
                  <ErrorText>
                    <div>
                      <strong>{errorDetails.main}</strong>
                      <ErrorDetail>{errorDetails.detail}</ErrorDetail>
                      <ErrorDetail style={{ marginTop: '4px', fontStyle: 'italic' }}>
                        {errorDetails.suggestion}
                      </ErrorDetail>
                    </div>
                    {lastFailedMessage && (
                      <RetryButton onClick={handleRetry}>
                        <HiOutlineRefresh size={14} style={{ marginRight: '4px' }} />
                        Retry
                      </RetryButton>
                    )}
                  </ErrorText>
                </ErrorMessage>
              );
            })()}
          </>
        )}
        <div ref={chatEndRef} />
      </ChatArea>

      <InputContainer>
        {messages.length === 0 && !isLoading && (
          <InputSuggestions>
            {examplePrompts.map((prompt, idx) => (
              <SuggestionChip key={idx} onClick={() => sendMessage(prompt)}>
                {prompt}
              </SuggestionChip>
            ))}
          </InputSuggestions>
        )}
        <form onSubmit={handleSubmit}>
          <InputWrapper>
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={messages.length === 0 ? "Describe your symptoms..." : "Type your response..."}
              disabled={isLoading || isGeneratingSymptomSummary}
              aria-label="Message input"
            />
            {browserSupportsSpeechRecognition && (
              <MicButton
                type="button"
                listening={listening}
                disabled={isLoading || isGeneratingSymptomSummary}
                onClick={() => listening
                  ? SpeechRecognition.stopListening()
                  : SpeechRecognition.startListening({ continuous: false })
                }
                title={listening ? 'Stop listening' : 'Speak your symptoms'}
              >
                <HiOutlineMicrophone />
              </MicButton>
            )}
            <SendButton type="submit" disabled={isLoading || isGeneratingSymptomSummary || !inputValue.trim()}>
              Send
            </SendButton>
          </InputWrapper>
        </form>
        {messages.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '12px', color: '#999' }}>
            You can ask: "What does this mean?" or "When should I see a doctor?"
          </div>
        )}
      </InputContainer>

      <HelpButton 
        onClick={() => setShowHelp(true)}
        aria-label="Help"
        title="Get help"
      >
        <HiOutlineQuestionMarkCircle />
      </HelpButton>

      {showHelp && (
        <SummaryModal onClick={() => setShowHelp(false)}>
          <SummaryContent onClick={(e) => e.stopPropagation()}>
            <CloseButton onClick={() => setShowHelp(false)} aria-label="Close help">
              <HiOutlineX />
            </CloseButton>
            <SummaryTitle>Help & Support</SummaryTitle>
            <SummaryText style={{ whiteSpace: 'pre-wrap' }}>
              <strong>How to use Clarily:</strong>

              • Describe your symptoms clearly and in detail
              • Type your responses to answer the chatbot's questions
              • Ask "What does this mean?" or "When should I see a doctor?" anytime

              <strong>Features:</strong>

              • <strong>Summary:</strong> Generate a summary of your conversation
              • <strong>Undo:</strong> Remove your last message
              • <strong>Clear:</strong> Start a new conversation
              • <strong>Copy:</strong> Copy any message to clipboard
              • <strong>Feedback:</strong> Rate bot responses with thumbs up/down

              <strong>Important:</strong>

              This is an AI assistant for informational purposes only. Always consult with a qualified healthcare provider for medical advice, diagnosis, or treatment.

              <strong>Need more help?</strong>

              If you're experiencing technical issues, please try refreshing the page or contact support.
            </SummaryText>
          </SummaryContent>
        </SummaryModal>
      )}

      {showSummary && (
        <SummaryModal onClick={() => setShowSummary(false)}>
          <SummaryContent onClick={(e) => e.stopPropagation()}>
            <CloseButton onClick={() => setShowSummary(false)} aria-label="Close summary">
              <HiOutlineX />
            </CloseButton>
            <SummaryTitle>Conversation Summary</SummaryTitle>
            {isGeneratingSummary ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                <LoadingIndicator message="Generating your summary..." />
              </div>
            ) : (
              <>
                <SummaryText style={{ whiteSpace: 'pre-wrap' }}>{summaryText || 'No summary available.'}</SummaryText>
                {summaryText && (
                  <SummaryActions>
                    <SummaryActionButton onClick={handleSaveSummary} title="Save summary as text file">
                      <HiOutlineSave />
                      Save
                    </SummaryActionButton>
                    <SummaryActionButton onClick={handlePrintSummary} title="Print summary">
                      <HiOutlinePrinter />
                      Print
                    </SummaryActionButton>
                    <SummaryActionButton onClick={handleEmailSummary} title="Email summary">
                      <HiOutlineMail />
                      Email
                    </SummaryActionButton>
                    <SummaryActionButton
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(summaryText);
                          toast.success('Summary copied to clipboard!');
                        } catch {
                          toast.error('Failed to copy. Please try again.');
                        }
                      }}
                      title="Copy summary to clipboard"
                    >
                      <HiOutlineClipboard />
                      Copy
                    </SummaryActionButton>
                  </SummaryActions>
                )}
              </>
            )}
          </SummaryContent>
        </SummaryModal>
      )}

      {showConfirmClear && (
        <ConfirmModal onClick={() => setShowConfirmClear(false)}>
          <ConfirmContent onClick={(e) => e.stopPropagation()}>
            <p style={{ margin: 0, fontSize: '16px', color: '#2D5016' }}>
              Are you sure you want to clear this conversation? This action cannot be undone.
            </p>
            <ConfirmButtons>
              <ConfirmButton className="secondary" onClick={() => setShowConfirmClear(false)}>
                Cancel
              </ConfirmButton>
              <ConfirmButton className="primary" onClick={confirmClearConversation}>
                Clear Conversation
              </ConfirmButton>
            </ConfirmButtons>
          </ConfirmContent>
        </ConfirmModal>
      )}
    </ChatContainer>
  );
};

export default Chatbot;
