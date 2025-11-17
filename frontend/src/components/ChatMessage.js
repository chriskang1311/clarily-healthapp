import React, { useState } from 'react';
import styled from 'styled-components';
import { HiOutlineThumbUp, HiOutlineThumbDown, HiOutlineClipboard } from 'react-icons/hi';

const MessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  margin-bottom: 16px;
  animation: fadeIn 0.3s ease-in;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const MessageBubble = styled.div`
  max-width: min(70%, 600px);
  padding: 14px 18px;
  border-radius: ${props => props.theme.borderRadius.medium};
  background-color: ${props => 
    props.isUser 
      ? props.theme.colors.primary 
      : '#F5F5F5'};
  color: ${props => 
    props.isUser 
      ? props.theme.colors.buttonText 
      : props.theme.colors.text};
  font-size: 16px;
  line-height: 1.6;
  word-wrap: break-word;
  
  ${props => props.isUser 
    ? `
      border-bottom-right-radius: 4px;
    `
    : `
      border-bottom-left-radius: 4px;
    `
  }
`;

const Timestamp = styled.span`
  font-size: 12px;
  color: #666;
  margin-top: 6px;
  padding: 0 4px;
  font-weight: 400;
`;

const MessageActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 6px;
  padding: 0 4px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.primary};
  cursor: pointer;
  padding: 4px 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${props => props.theme.borderRadius.small};
  opacity: 0.6;
  transition: all 0.2s;
  
  &:hover {
    opacity: 1;
    background-color: ${props => props.theme.colors.primaryLight};
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const CopyButton = styled(ActionButton)`
  font-size: 11px;
  padding: 4px 8px;
`;

const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  } catch (e) {
    return '';
  }
};

const ChatMessage = ({ message, isUser, timestamp, onFeedback, onCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      if (onCopy) onCopy();
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <MessageContainer isUser={isUser}>
      <MessageBubble isUser={isUser}>
        {message}
      </MessageBubble>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
        {timestamp && <Timestamp>{formatTimestamp(timestamp)}</Timestamp>}
        {!isUser && (
          <MessageActions>
            {onFeedback && (
              <>
                <ActionButton 
                  onClick={() => onFeedback('positive')} 
                  title="This was helpful"
                  aria-label="Thumbs up"
                >
                  <HiOutlineThumbUp />
                </ActionButton>
                <ActionButton 
                  onClick={() => onFeedback('negative')} 
                  title="This wasn't helpful"
                  aria-label="Thumbs down"
                >
                  <HiOutlineThumbDown />
                </ActionButton>
              </>
            )}
            <CopyButton 
              onClick={handleCopy}
              title="Copy message"
              aria-label="Copy message"
            >
              <HiOutlineClipboard size={14} />
              {copied ? 'Copied!' : 'Copy'}
            </CopyButton>
          </MessageActions>
        )}
        {isUser && (
          <CopyButton 
            onClick={handleCopy}
            title="Copy message"
            aria-label="Copy message"
            style={{ marginTop: '4px' }}
          >
            <HiOutlineClipboard size={14} />
            {copied ? 'Copied!' : 'Copy'}
          </CopyButton>
        )}
      </div>
    </MessageContainer>
  );
};

export default ChatMessage;

