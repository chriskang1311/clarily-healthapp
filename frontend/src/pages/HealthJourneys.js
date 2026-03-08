import { api } from '../api';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import styled, { keyframes } from 'styled-components';
import {
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineDownload,
  HiOutlineChat,
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
  gap: 20px;
`;

const JourneyCard = styled.div`
  background-color: ${props => props.theme.colors.background};
  border: 1px solid #E0E0E0;
  border-left: 6px solid ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.borderRadius.large};
  overflow: hidden;
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px;
  cursor: pointer;
  gap: 16px;
`;

const CardHeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
`;

const JourneyTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: ${props => props.theme.colors.primary};
  margin: 0;
`;

const JourneyDate = styled.span`
  font-size: 13px;
  color: #888;
`;

const ProgressSummary = styled.div`
  font-size: 13px;
  color: ${props => props.theme.colors.primary};
  font-weight: 500;
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

const ChevronButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${props => props.theme.colors.primary};
  display: flex;
  align-items: center;
  padding: 4px;
`;

const CardBody = styled.div`
  border-top: 1px solid #E0E0E0;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SectionLabel = styled.h3`
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #888;
  margin: 0;
`;

/* ── Step checklist ── */
const StepList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const StepRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StepCheckbox = styled.div`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  flex-shrink: 0;
  background-color: ${props => props.checked ? props.theme.colors.primary : 'transparent'};
  border: 2px solid ${props => props.checked ? props.theme.colors.primary : '#BDBDBD'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background-color: ${props => props.checked ? props.theme.colors.primary : props.theme.colors.primaryLight};
  }
`;

const StepLabel = styled.span`
  font-size: 15px;
  color: ${props => props.completed ? props.theme.colors.primary : '#555'};
  font-weight: ${props => props.completed ? '600' : '400'};
  text-decoration: ${props => props.completed ? 'none' : 'none'};
`;

/* ── Diagnoses ── */
const DiagnosesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const DiagnosisRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border: 1px solid #E0E0E0;
  border-radius: ${props => props.theme.borderRadius.medium};
  background-color: #FAFAFA;
`;

const ConfidenceBadge = styled.span`
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 99px;
  background-color: ${props =>
    props.level === 'High' ? '#E8F5E9' :
    props.level === 'Moderate' ? '#FFF3E0' :
    '#F5F5F5'};
  color: ${props =>
    props.level === 'High' ? '#2E7D32' :
    props.level === 'Moderate' ? '#E65100' :
    '#757575'};
  flex-shrink: 0;
`;

const DiagnosisName = styled.span`
  font-size: 15px;
  font-weight: 500;
  color: ${props => props.theme.colors.text};
  flex: 1;
`;

const DiagnosisDesc = styled.span`
  font-size: 13px;
  color: #777;
`;

/* ── Symptom summary ── */
const SummaryBox = styled.pre`
  font-family: inherit;
  font-size: 14px;
  line-height: 1.6;
  color: #444;
  white-space: pre-wrap;
  background-color: #F9F9F9;
  border: 1px solid #E0E0E0;
  border-radius: ${props => props.theme.borderRadius.medium};
  padding: 16px;
  margin: 0;
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

const JourneyCardItem = ({ journey, onStepToggle }) => {
  const [expanded, setExpanded] = useState(false);

  const completedCount = (journey.completed_steps || []).length;
  const totalCount = (journey.progress_steps || []).length;

  const handleDownload = () => {
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
    <JourneyCard>
      <CardHeader onClick={() => setExpanded(e => !e)}>
        <CardHeaderLeft>
          <JourneyTitle>Journey: {journey.primary_symptom || 'Symptoms'}</JourneyTitle>
          <JourneyDate>{formatDate(journey.created_at)}</JourneyDate>
          <ProgressSummary>{completedCount} of {totalCount} steps completed</ProgressSummary>
        </CardHeaderLeft>
        <CardActions onClick={e => e.stopPropagation()}>
          <IconButton onClick={handleDownload} title="Download summary">
            <HiOutlineDownload size={15} />
            Download
          </IconButton>
        </CardActions>
        <ChevronButton>
          {expanded ? <HiOutlineChevronUp size={20} /> : <HiOutlineChevronDown size={20} />}
        </ChevronButton>
      </CardHeader>

      {expanded && (
        <CardBody>
          {/* Progress Steps */}
          <Section>
            <SectionLabel>Progress Steps</SectionLabel>
            <StepList>
              {(journey.progress_steps || []).map((step) => {
                const checked = (journey.completed_steps || []).includes(step);
                return (
                  <StepRow key={step}>
                    <StepCheckbox
                      checked={checked}
                      onClick={() => onStepToggle(journey, step, checked)}
                      title={checked ? 'Mark incomplete' : 'Mark complete'}
                    >
                      {checked && '✓'}
                    </StepCheckbox>
                    <StepLabel completed={checked}>{step}</StepLabel>
                  </StepRow>
                );
              })}
            </StepList>
          </Section>

          {/* Diagnoses */}
          {journey.diagnoses && journey.diagnoses.length > 0 && (
            <Section>
              <SectionLabel>Potential Diagnoses</SectionLabel>
              <DiagnosesList>
                {journey.diagnoses.map((d, i) => (
                  <DiagnosisRow key={i}>
                    <ConfidenceBadge level={d.confidence}>{d.confidence}</ConfidenceBadge>
                    <DiagnosisName>{d.condition}</DiagnosisName>
                    {d.description && <DiagnosisDesc>{d.description}</DiagnosisDesc>}
                  </DiagnosisRow>
                ))}
              </DiagnosesList>
            </Section>
          )}

          {/* Symptom Summary */}
          {journey.symptom_summary && (
            <Section>
              <SectionLabel>Symptom Summary</SectionLabel>
              <SummaryBox>{journey.symptom_summary}</SummaryBox>
            </Section>
          )}
        </CardBody>
      )}
    </JourneyCard>
  );
};

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

  const handleStepToggle = async (journey, step, currentlyChecked) => {
    const updatedCompleted = currentlyChecked
      ? (journey.completed_steps || []).filter(s => s !== step)
      : [...(journey.completed_steps || []), step];

    try {
      const res = await api.put(`/journeys/${journey.id}`, {
        completed_steps: updatedCompleted,
        updated_at: new Date().toISOString(),
      });
      if (res.ok) {
        const data = await res.json();
        setJourneys(prev => prev.map(j => j.id === journey.id ? data.journey : j));
      }
    } catch (err) {
      console.error('Error updating step:', err);
      toast.error('Failed to update progress step.');
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
              onStepToggle={handleStepToggle}
            />
          ))}
        </JourneysContainer>
      ) : (
        <EmptyState>
          <EmptyTitle>No health journeys yet</EmptyTitle>
          <EmptyText>
            Start by describing your symptoms to the Clarily assistant. Your journey will be saved here after you receive a diagnosis.
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
