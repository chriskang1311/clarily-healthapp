import React from 'react';
import styled from 'styled-components';

const PossibilitiesContainer = styled.div`
  margin-top: 20px;
  margin-bottom: 16px;
  padding: 20px;
  background-color: ${props => props.theme.colors.primaryLight};
  border: 2px solid ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.borderRadius.medium};
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

const DisclaimerText = styled.p`
  font-size: 13px;
  color: ${props => props.theme.colors.primary};
  margin: 0 0 16px 0;
  padding: 12px;
  background-color: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.borderRadius.small};
  border-left: 3px solid ${props => props.theme.colors.primary};
  font-style: italic;
  line-height: 1.5;
`;

const Title = styled.h3`
  font-size: 22px;
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: ${props => props.theme.colors.primary};
  opacity: 0.8;
  margin: 0 0 20px 0;
  font-style: italic;
`;

const PossibilitiesList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 20px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const PossibilityItem = styled.li`
  padding: 18px 20px;
  background-color: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.borderRadius.medium};
  border: 2px solid #E0E0E0;
  transition: all 0.2s;
  position: relative;
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 2px 8px rgba(45, 80, 22, 0.15);
  }
  
  &:first-child {
    border-color: ${props => props.theme.colors.primary};
    background-color: ${props => props.theme.colors.primaryLight};
  }
`;

const PossibilityHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
  gap: 12px;
`;

const PossibilityName = styled.h4`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.colors.primary};
  margin: 0;
  flex: 1;
`;

const ConfidenceBadge = styled.span`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  background-color: ${props => {
    if (props.confidence === 'High') return '#4CAF50';
    if (props.confidence === 'Moderate') return '#FF9800';
    return '#9E9E9E';
  }};
  color: white;
`;

const PossibilityDescription = styled.p`
  font-size: 15px;
  color: ${props => props.theme.colors.text};
  margin: 0;
  line-height: 1.6;
`;

const ConfirmationPrompt = styled.p`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.primary};
  margin: 20px 0 16px 0;
  text-align: center;
`;

const ConfirmationButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
`;

const ConfirmationButton = styled.button`
  padding: 14px 28px;
  border-radius: ${props => props.theme.borderRadius.medium};
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid ${props => 
    props.variant === 'primary' 
      ? props.theme.colors.primary 
      : props.variant === 'danger'
      ? '#999'
      : props.theme.colors.primary};
  background-color: ${props => 
    props.variant === 'primary' 
      ? props.theme.colors.primary 
      : props.theme.colors.background};
  color: ${props => 
    props.variant === 'primary' 
      ? props.theme.colors.buttonText 
      : props.theme.colors.primary};
  
  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PossibilitiesDisplay = ({ possibilities, onConfirm, onDeny, disabled }) => {
  if (!possibilities || possibilities.length === 0) {
    return null;
  }

  // Limit to top 3-4 diagnoses
  const topDiagnoses = possibilities.slice(0, 4);

  return (
    <PossibilitiesContainer>
      <DisclaimerText>
        <strong>AI Assistant Note:</strong> These are diagnostic suggestions based on the information you've provided. These are not definitive diagnoses and should not replace professional medical evaluation. Please consult with a qualified healthcare provider for proper diagnosis and treatment.
      </DisclaimerText>
      
      <Title>Top Potential Diagnoses</Title>
      <Subtitle>Based on your symptoms and responses, here are the most likely diagnoses:</Subtitle>
      
      <PossibilitiesList>
        {topDiagnoses.map((possibility, index) => (
          <PossibilityItem key={index}>
            <PossibilityHeader>
              <PossibilityName>
                {index + 1}. {possibility.condition}
              </PossibilityName>
              <ConfidenceBadge confidence={possibility.confidence}>
                {possibility.confidence} Confidence
              </ConfidenceBadge>
            </PossibilityHeader>
            {possibility.description && (
              <PossibilityDescription>{possibility.description}</PossibilityDescription>
            )}
          </PossibilityItem>
        ))}
      </PossibilitiesList>
      
      <ConfirmationPrompt>
        Please review these diagnoses. If they align with what you're experiencing, you can sign off to proceed. If not, we can discuss more.
      </ConfirmationPrompt>
      
      <ConfirmationButtons>
        <ConfirmationButton
          variant="primary"
          onClick={onConfirm}
          disabled={disabled}
        >
          Sign off on these diagnoses
        </ConfirmationButton>
        <ConfirmationButton
          variant="secondary"
          onClick={onDeny}
          disabled={disabled}
        >
          I disagree, let's chat more
        </ConfirmationButton>
      </ConfirmationButtons>
    </PossibilitiesContainer>
  );
};

export default PossibilitiesDisplay;

