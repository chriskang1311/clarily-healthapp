import React from 'react';
import styled, { keyframes } from 'styled-components';

const bounce = keyframes`
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px 16px;
`;

const DotsContainer = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
`;

const Dot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${props => props.theme.colors.primary};
  animation: ${bounce} 1.4s infinite ease-in-out both;
  
  &:nth-child(1) {
    animation-delay: -0.32s;
  }
  
  &:nth-child(2) {
    animation-delay: -0.16s;
  }
`;

const LoadingText = styled.span`
  font-size: 14px;
  color: ${props => props.theme.colors.primary};
  opacity: 0.7;
  font-style: italic;
`;

const LoadingIndicator = ({ message }) => {
  return (
    <LoadingContainer>
      <DotsContainer>
        <Dot />
        <Dot />
        <Dot />
      </DotsContainer>
      {message && <LoadingText>{message}</LoadingText>}
    </LoadingContainer>
  );
};

export default LoadingIndicator;

