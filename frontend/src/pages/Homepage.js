import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const MainContent = styled.main`
  flex: 1;
  padding: 48px 64px;
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const Title = styled.h1`
  font-size: 48px;
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
  margin: 0;
`;

const Button = styled.button`
  background-color: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.buttonText};
  border: none;
  border-radius: ${props => props.theme.borderRadius.medium};
  padding: 16px 32px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.1s;
  align-self: flex-start;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const Homepage = () => {
  const navigate = useNavigate();

  const handleNewSymptom = () => {
    navigate('/chatbot');
  };

  return (
    <MainContent>
      <Title>Your Health Journeys</Title>
      <Button onClick={handleNewSymptom}>
        Ask About a New Symptom
      </Button>
    </MainContent>
  );
};

export default Homepage;

