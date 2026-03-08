import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import {
  HiOutlineArrowLeft,
  HiOutlineCalendar,
  HiOutlineChat,
  HiOutlineCheckCircle,
} from 'react-icons/hi';
import { useToast } from '../contexts/ToastContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const MainContent = styled.main`
  flex: 1;
  padding: 48px 64px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  animation: ${fadeIn} 0.3s ease;
  overflow-y: auto;

  @media (max-width: 768px) {
    padding: 24px 20px;
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: ${props => props.theme.colors.primary};
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  transition: opacity 0.2s;
  width: fit-content;

  &:hover { opacity: 0.75; }
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
  margin: 0;
`;

const Subtitle = styled.p`
  font-size: 15px;
  color: #777;
  margin: 0;
`;

const Section = styled.section`
  background: #fff;
  border: 1px solid #E0E0E0;
  border-radius: ${props => props.theme.borderRadius.large};
  padding: 28px 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (max-width: 768px) {
    padding: 20px 16px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
  margin: 0 0 4px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid ${props => props.theme.colors.primaryLight};
`;

const StepList = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const StepItem = styled.li`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  color: ${props => props.done ? '#4CAF50' : '#555'};
`;

const StepCheckbox = styled.input`
  width: 18px;
  height: 18px;
  accent-color: ${props => props.theme.colors.primary};
  cursor: pointer;
`;

const DiagnosesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const DiagnosisCard = styled.div`
  background: ${props => props.theme.colors.primaryLight};
  border-radius: ${props => props.theme.borderRadius.medium};
  padding: 14px 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const DiagnosisHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const DiagnosisName = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: ${props => props.theme.colors.primary};
`;

const CONFIDENCE_COLORS = { High: '#2D5016', Moderate: '#F57C00', Low: '#757575' };

const ConfidenceBadge = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  background-color: ${props => CONFIDENCE_COLORS[props.level] || '#757575'};
  padding: 2px 8px;
  border-radius: 99px;
  text-transform: uppercase;
`;

const DiagnosisDesc = styled.p`
  font-size: 13px;
  color: #555;
  margin: 0;
  line-height: 1.5;
`;

const SummaryText = styled.p`
  font-size: 15px;
  color: #444;
  line-height: 1.7;
  margin: 0;
  white-space: pre-wrap;
`;

const ActionRow = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background-color: ${props => props.secondary ? '#fff' : props.theme.colors.primary};
  color: ${props => props.secondary ? props.theme.colors.primary : '#fff'};
  border: 1.5px solid ${props => props.secondary ? props.theme.colors.primary : 'transparent'};
  border-radius: ${props => props.theme.borderRadius.medium};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover { opacity: 0.85; }
`;

const LoadingText = styled.p`
  color: #777;
  font-size: 16px;
`;

const JourneyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [journey, setJourney] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchJourney();
  }, [id]);

  const fetchJourney = async () => {
    try {
      const res = await fetch(`${API_URL}/journeys/${id}`);
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      setJourney(data.journey);
    } catch (err) {
      console.error('Error fetching journey:', err);
      toast.error('Could not load this health journey.');
      navigate('/health-journeys');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStepToggle = async (step, currentlyChecked) => {
    const updatedCompleted = currentlyChecked
      ? (journey.completed_steps || []).filter(s => s !== step)
      : [...(journey.completed_steps || []), step];

    try {
      const res = await fetch(`${API_URL}/journeys/${journey.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completed_steps: updatedCompleted,
          updated_at: new Date().toISOString(),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setJourney(data.journey);
      }
    } catch (err) {
      console.error('Error updating step:', err);
      toast.error('Failed to update progress step.');
    }
  };

  const formatDate = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <MainContent>
        <LoadingText>Loading journey…</LoadingText>
      </MainContent>
    );
  }

  if (!journey) return null;

  const diagnoses = journey.diagnoses || [];
  const progressSteps = journey.progress_steps || [];
  const completedSteps = journey.completed_steps || [];

  return (
    <MainContent>
      <BackButton onClick={() => navigate('/health-journeys')}>
        <HiOutlineArrowLeft size={16} />
        Back to Health Journeys
      </BackButton>

      <Header>
        <Title>Your Health Journey</Title>
        <Subtitle>
          {journey.primary_symptom}
          {journey.created_at && ` · Started ${formatDate(journey.created_at)}`}
        </Subtitle>
      </Header>

      {/* Progress Steps */}
      <Section>
        <SectionTitle>Progress Steps</SectionTitle>
        <StepList>
          {progressSteps.map(step => {
            const done = completedSteps.includes(step);
            return (
              <StepItem key={step} done={done}>
                <StepCheckbox
                  type="checkbox"
                  checked={done}
                  onChange={() => handleStepToggle(step, done)}
                />
                {done && <HiOutlineCheckCircle size={16} color="#4CAF50" />}
                {step}
              </StepItem>
            );
          })}
        </StepList>
      </Section>

      {/* Diagnoses */}
      {diagnoses.length > 0 && (
        <Section>
          <SectionTitle>Possible Diagnoses</SectionTitle>
          <DiagnosesList>
            {diagnoses.map((d, i) => (
              <DiagnosisCard key={i}>
                <DiagnosisHeader>
                  <DiagnosisName>{d.condition}</DiagnosisName>
                  <ConfidenceBadge level={d.confidence}>{d.confidence}</ConfidenceBadge>
                </DiagnosisHeader>
                {d.description && <DiagnosisDesc>{d.description}</DiagnosisDesc>}
              </DiagnosisCard>
            ))}
          </DiagnosesList>
        </Section>
      )}

      {/* Symptom Summary */}
      {journey.symptom_summary && (
        <Section>
          <SectionTitle>Symptom Summary</SectionTitle>
          <SummaryText>{journey.symptom_summary}</SummaryText>
        </Section>
      )}

      {/* Actions */}
      <ActionRow>
        <ActionButton onClick={() => navigate('/appointments')}>
          <HiOutlineCalendar size={16} />
          Book Appointment
        </ActionButton>
        <ActionButton secondary onClick={() => navigate('/chatbot')}>
          <HiOutlineChat size={16} />
          Start New Chat
        </ActionButton>
      </ActionRow>
    </MainContent>
  );
};

export default JourneyDetail;
