import React from 'react';
import styled from 'styled-components';

const ButtonsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
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

const QuickReplyButton = styled.button`
  padding: 10px 16px;
  border: 2px solid ${props => props.isSkip ? '#999' : props.theme.colors.primary};
  border-radius: ${props => props.theme.borderRadius.medium};
  background-color: ${props => props.theme.colors.background};
  color: ${props => props.isSkip ? '#666' : props.theme.colors.primary};
  font-size: 14px;
  font-weight: ${props => props.isSkip ? '400' : '500'};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: ${props => props.isSkip ? 'rgba(0,0,0,0.1)' : props.theme.colors.primaryLight};
    transform: translate(-50%, -50%);
    transition: width 0.3s ease, height 0.3s ease;
  }

  &:hover {
    background-color: ${props => props.isSkip ? '#F5F5F5' : props.theme.colors.primaryLight};
    transform: translateY(-1px);
    border-color: ${props => props.isSkip ? '#666' : props.theme.colors.primary};
  }

  &:active::before {
    width: 200px;
    height: 200px;
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  span {
    position: relative;
    z-index: 1;
  }
`;

const QuickReplyButtons = ({ options, onSelect, disabled }) => {
  if (!options || options.length === 0) {
    return null;
  }

  return (
    <ButtonsContainer>
      {options.map((option, index) => {
        const isSkip = option.toLowerCase() === 'skip';
        return (
          <QuickReplyButton
            key={index}
            onClick={() => onSelect(option)}
            disabled={disabled}
            isSkip={isSkip}
          >
            <span>{option}</span>
          </QuickReplyButton>
        );
      })}
    </ButtonsContainer>
  );
};

export default QuickReplyButtons;

