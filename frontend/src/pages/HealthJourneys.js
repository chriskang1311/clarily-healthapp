import { api } from '../api';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import styled, { keyframes } from 'styled-components';
import {
  HiOutlineDownload,
  HiOutlineChat,
  HiOutlineArrowRight,
} from 'react-icons/hi';


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

  @media (max-width: 768px) {
    padding: 24px 20px;
  }
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
`;

const Title = styled.h1`
  font-size: 36px;
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
  margin: 0;
`;

const NewJourneyButton = styled.button`
  background-color: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.buttonText};
  border: none;
  border-radius: ${props => props.theme.borderRadius.medium};
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: opacity 0.2s, transform 0.1s;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;

const JourneysContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const JourneyCard = styled.div`
  background-color: ${props => props.theme.colors.background};
  border: 1px solid #E0E0E0;
  border-left: 6px solid ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.borderRadius.large};
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  transition: box-shadow 0.2s;
  cursor: pointer;

  &:hover {
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
  }

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const CardInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
`;

const JourneyTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.colors.primary};
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const JourneyDate = styled.span`
  font-size: 13px;
  color: #888;
`;

const ProgressRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 2px;
`;

const ProgressPill = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.theme.colors.primary};
  background-color: ${props => props.theme.colors.primaryLight};
  padding: 2px 10px;
  border-radius: 99px;
  white-space: nowrap;
`;

const ProgressBarTrack = styled.div`
  flex: 1;
  height: 4px;
  background-color: #E0E0E0;
  border-radius: 99px;
  overflow: hidden;
  max-width: 160px;
`;

const ProgressBarFill = styled.div`
  height: 100%;
  background-color: ${props => props.theme.colors.primary};
  border-radius: 99px;
  width: ${props => props.pct}%;
  transition: width 0.4s ease;
`;

const CardActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`;

const IconButton = styled.button`
  background: none;
  border: 1px solid #E0E0E0;
  border-radius: ${props => props.theme.borderRadius.small};
  padding: 6px 10px;
  cursor: pointer;
  color: ${props => props.theme.colors.primary};
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 500;
  transition: background-color 0.15s;

  &:hover {
    background-color: ${props => props.theme.colors.primaryLight};
  }
`;

const ViewButton = styled.button`
  background-color: ${props => props.theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: ${props => props.theme.borderRadius.small};
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: opacity 0.2s;

  &:hover { opacity: 0.85; }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 64px 24px;
  color: #888;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const EmptyTitle = styled.p`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.colors.primary};
  margin: 0;
`;

const EmptyText = styled.p`
  font-size: 15px;
  color: #777;
  margin: 0;
`;

const StartButton = styled.button`
  background-color: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.buttonText};
  border: none;
  border-radius: ${props => props.theme.borderRadius.medium};
  padding: 12px 28px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.1s;
  margin-top: 8px;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;

const LoadingText = styled.p`
  font-size: 16px;
  color: ${props => props.theme.colors.text};
`;

// ─────────────────────────────────────────────────────────────────────────────

function formatDate(dateString) {
  if (!dateString) return '';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    });
  } catch {
    return '';
  }
}

const JourneyCardItem = ({ journey, onNavigate }) => {
  const completedCount = (journey.completed_steps || []).length;
  const totalCount = (journey.progress_steps || []).length;
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleDownload = (e) => {
    e.stopPropagation();
    const lines = [
      `Health Journey: ${journey.primary_symptom || 'Unknown Symptom'}`,
      `Created: ${formatDate(journey.created_at)}`,
      '',
      'Progress:',
      ...(journey.progress_steps || []).map(step => {
        const done = (journey.completed_steps || []).includes(step);
        return `  ${done ? '[x]' : '[ ]'} ${step}`;
      }),
    ];
    if (journey.diagnoses && journey.diagnoses.length > 0) {
      lines.push('', 'Potential Diagnoses:');
      journey.diagnoses.forEach(d => {
        lines.push(`  • ${d.condition} (${d.confidence} confidence)`);
        if (d.description) lines.push(`    ${d.description}`);
      });
    }
    if (journey.symptom_summary) {
      lines.push('', 'Symptom Summary:', journey.symptom_summary);
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `health-journey-${journey.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <JourneyCard onClick={() => onNavigate(journey.id)}>
      <CardInfo>
        <JourneyTitle>{journey.primary_symptom || 'Health Journey'}</JourneyTitle>
        <JourneyDate>{formatDate(journey.created_at)}</JourneyDate>
        <ProgressRow>
          <ProgressPill>{completedCount} of {totalCount} steps</ProgressPill>
          <ProgressBarTrack>
            <ProgressBarFill pct={pct} />
          </ProgressBarTrack>
        </ProgressRow>
      </CardInfo>
      <CardActions>
        <IconButton onClick={handleDownload} title="Download summary">
          <HiOutlineDownload size={14} />
          Download
        </IconButton>
        <ViewButton onClick={e => { e.stopPropagation(); onNavigate(journey.id); }}>
          View Journey
          <HiOutlineArrowRight size={13} />
        </ViewButton>
      </CardActions>
    </JourneyCard>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

const HealthJourneys = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [journeys, setJourneys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchJourneys();
  }, []);

  const fetchJourneys = async () => {
    try {
      const res = await api.get('/journeys');
      if (res.ok) {
        const data = await res.json();
        setJourneys(data.journeys || []);
      }
    } catch (err) {
      console.error('Error fetching journeys:', err);
      toast.error('Failed to load your health journeys.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainContent>
      <PageHeader>
        <Title>Health Journeys</Title>
        <NewJourneyButton onClick={() => navigate('/chatbot')}>
          <HiOutlineChat size={16} />
          New Journey
        </NewJourneyButton>
      </PageHeader>

      {isLoading ? (
        <LoadingText>Loading your journeys...</LoadingText>
      ) : journeys.length > 0 ? (
        <JourneysContainer>
          {journeys.map(journey => (
            <JourneyCardItem
              key={journey.id}
              journey={journey}
              onNavigate={(id) => navigate(`/journey/${id}`)}
            />
          ))}
        </JourneysContainer>
      ) : (
        <EmptyState>
          <EmptyTitle>No health journeys yet</EmptyTitle>
          <EmptyText>
            Start by describing your symptoms to the Clarily assistant. Your journey will be saved here after you confirm your diagnoses.
          </EmptyText>
          <StartButton onClick={() => navigate('/chatbot')}>
            Start a New Journey
          </StartButton>
        </EmptyState>
      )}
    </MainContent>
  );
};

export default HealthJourneys;
