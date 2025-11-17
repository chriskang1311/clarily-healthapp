import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

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

const JourneysContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const JourneyCard = styled.div`
  background-color: ${props => props.theme.colors.background};
  border: 1px solid #E0E0E0;
  border-left: 6px solid ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.borderRadius.medium};
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: box-shadow 0.2s;
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const JourneyHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const JourneyTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: ${props => props.theme.colors.primary};
  margin: 0;
`;

const JourneyDescription = styled.p`
  font-size: 16px;
  color: ${props => props.theme.colors.text};
  margin: 0;
  line-height: 1.5;
`;

const ProgressContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid #E0E0E0;
`;

const ProgressText = styled.p`
  font-size: 14px;
  color: ${props => props.theme.colors.text};
  margin: 0;
  font-weight: 500;
`;

const ProgressSteps = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
`;

const ProgressStep = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: ${props => props.isCompleted ? props.theme.colors.primary : '#999'};
  font-weight: ${props => props.isCompleted ? '600' : '400'};
`;

const StepIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${props => props.isCompleted ? props.theme.colors.primary : '#E0E0E0'};
  color: ${props => props.isCompleted ? props.theme.colors.buttonText : '#999'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
`;

const StartJourneyButton = styled.button`
  background-color: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.buttonText};
  border: none;
  border-radius: ${props => props.theme.borderRadius.medium};
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.1s;
  align-self: flex-start;
  margin-top: 8px;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const NewSymptomButton = styled.button`
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

const EmptyState = styled.div`
  text-align: center;
  padding: 48px 24px;
  color: ${props => props.theme.colors.text};
`;

const EmptyStateText = styled.p`
  font-size: 16px;
  margin: 16px 0 0 0;
  color: #666;
`;

const LoadingText = styled.p`
  font-size: 16px;
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const Homepage = () => {
  const navigate = useNavigate();
  const [journeys, setJourneys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchJourneys();
  }, []);

  const fetchJourneys = async () => {
    try {
      const response = await fetch(`${API_URL}/journeys`);
      if (response.ok) {
        const data = await response.json();
        setJourneys(data.journeys || []);
      }
    } catch (err) {
      console.error('Error fetching journeys:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewSymptom = () => {
    navigate('/chatbot');
  };

  const handleStartJourney = (journeyId) => {
    // Navigate to journey flow page - route to be defined later
    navigate(`/journey/${journeyId}`); // Placeholder route
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch (e) {
      return '';
    }
  };

  return (
    <MainContent>
      <Title>Your Health Journeys</Title>
      
      {isLoading ? (
        <LoadingText>Loading your journeys...</LoadingText>
      ) : journeys.length > 0 ? (
        <JourneysContainer>
          {journeys.map((journey) => (
            <JourneyCard key={journey.id}>
              <JourneyHeader>
                <JourneyTitle>
                  Your Health Journey: {journey.primary_symptom || 'Symptoms'}
                </JourneyTitle>
                <JourneyDescription>
                  Your personalized healthcare journey designed to help you understand and manage your symptoms.
                </JourneyDescription>
              </JourneyHeader>
              
              <ProgressContainer>
                <ProgressText>
                  {journey.completed_steps?.length || 0} of {journey.progress_steps?.length || 0} steps completed
                </ProgressText>
                <ProgressSteps>
                  {(journey.progress_steps || []).map((step, index) => {
                    const isCompleted = (journey.completed_steps || []).includes(step);
                    return (
                      <ProgressStep key={index} isCompleted={isCompleted}>
                        <StepIcon isCompleted={isCompleted}>
                          {isCompleted ? '✓' : index + 1}
                        </StepIcon>
                        <span>{step}</span>
                      </ProgressStep>
                    );
                  })}
                </ProgressSteps>
              </ProgressContainer>
              
              <StartJourneyButton onClick={() => handleStartJourney(journey.id)}>
                Start Journey
              </StartJourneyButton>
            </JourneyCard>
          ))}
        </JourneysContainer>
      ) : (
        <EmptyState>
          <EmptyStateText>
            You haven't started any health journeys yet.
          </EmptyStateText>
        </EmptyState>
      )}
      
      <NewSymptomButton onClick={handleNewSymptom}>
        Ask About a New Symptom
      </NewSymptomButton>
    </MainContent>
  );
};

export default Homepage;

