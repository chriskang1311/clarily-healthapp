import { api } from '../api';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import styled, { keyframes } from 'styled-components';
import {
  HiOutlineDownload,
  HiOutlineChat,
  HiOutlineArrowRight,
  HiOutlineDotsVertical,
  HiOutlineArchive,
  HiOutlineTrash,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineExclamation,
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
  position: relative;

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

/* ── Three-dot menu ── */
const MenuWrapper = styled.div`
  position: relative;
`;

const MenuButton = styled.button`
  background: none;
  border: 1px solid #E0E0E0;
  border-radius: ${props => props.theme.borderRadius.small};
  padding: 6px 8px;
  cursor: pointer;
  color: #888;
  display: flex;
  align-items: center;
  transition: background-color 0.15s, color 0.15s;

  &:hover {
    background-color: #F5F5F5;
    color: #444;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  right: 0;
  top: calc(100% + 6px);
  background: #fff;
  border: 1px solid #E0E0E0;
  border-radius: ${props => props.theme.borderRadius.medium};
  box-shadow: 0 4px 16px rgba(0,0,0,0.10);
  min-width: 160px;
  z-index: 50;
  overflow: hidden;
`;

const DropdownItem = styled.button`
  width: 100%;
  background: none;
  border: none;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  color: ${props => props.danger ? '#D32F2F' : '#333'};
  transition: background-color 0.12s;

  &:hover {
    background-color: ${props => props.danger ? '#FFF3F3' : '#F5F5F5'};
  }
`;

/* ── Delete Modal ── */
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 20px;
`;

const ModalBox = styled.div`
  background: #fff;
  border-radius: ${props => props.theme.borderRadius.large};
  padding: 28px 32px;
  max-width: 420px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ModalIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #FFF3E0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #E65100;
`;

const ModalTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #1A1A1A;
  margin: 0;
`;

const ModalText = styled.p`
  font-size: 14px;
  color: #555;
  margin: 0;
  line-height: 1.6;
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;

const CancelButton = styled.button`
  padding: 10px 20px;
  border: 1.5px solid #D0D0D0;
  border-radius: ${props => props.theme.borderRadius.medium};
  background: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  color: #555;
  &:hover { background: #F5F5F5; }
`;

const DeleteConfirmButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: ${props => props.theme.borderRadius.medium};
  background: #D32F2F;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  color: #fff;
  &:hover { opacity: 0.88; }
`;

/* ── Past Section ── */
const SectionHeader = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: ${props => props.theme.colors.primary};
`;

const SectionTitle = styled.h2`
  font-size: 22px;
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
  margin: 0;
`;

const SectionCount = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  background-color: ${props => props.theme.colors.primary};
  padding: 1px 9px;
  border-radius: 99px;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #E8E8E8;
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

const STEPS = ['Symptoms', 'Insurance', 'Doctor Visit', 'Diagnosis'];

function isPast(journey) {
  const completed = journey.completed_steps || [];
  return journey.status === 'archived' || STEPS.every(s => completed.includes(s));
}

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

const JourneyCardItem = ({ journey, onNavigate, onArchive, onDelete, menuOpenId, onMenuToggle }) => {
  const completedCount = (journey.completed_steps || []).length;
  const totalCount = (journey.progress_steps || []).length || 4;
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const past = isPast(journey);
  const isMenuOpen = menuOpenId === journey.id;

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
      <CardActions onClick={e => e.stopPropagation()}>
        <IconButton onClick={handleDownload} title="Download summary">
          <HiOutlineDownload size={14} />
          Download
        </IconButton>
        <ViewButton onClick={() => onNavigate(journey.id)}>
          View Journey
          <HiOutlineArrowRight size={13} />
        </ViewButton>
        <MenuWrapper>
          <MenuButton
            onClick={e => { e.stopPropagation(); onMenuToggle(journey.id); }}
            title="More options"
          >
            <HiOutlineDotsVertical size={16} />
          </MenuButton>
          {isMenuOpen && (
            <DropdownMenu onClick={e => e.stopPropagation()}>
              {!past && (
                <DropdownItem onClick={() => onArchive(journey.id)}>
                  <HiOutlineArchive size={15} />
                  Archive
                </DropdownItem>
              )}
              <DropdownItem danger onClick={() => onDelete(journey.id)}>
                <HiOutlineTrash size={15} />
                Delete
              </DropdownItem>
            </DropdownMenu>
          )}
        </MenuWrapper>
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
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [pastOpen, setPastOpen] = useState(false);

  useEffect(() => {
    fetchJourneys();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = () => setMenuOpenId(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
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

  const handleMenuToggle = (id) => {
    setMenuOpenId(prev => prev === id ? null : id);
  };

  const handleArchive = async (id) => {
    setMenuOpenId(null);
    try {
      const res = await api.put(`/journeys/${id}`, { status: 'archived' });
      if (res.ok) {
        setJourneys(prev => prev.map(j => j.id === id ? { ...j, status: 'archived' } : j));
        toast.success('Journey archived.');
        setPastOpen(true);
      }
    } catch (err) {
      toast.error('Failed to archive journey.');
    }
  };

  const handleDeleteClick = (id) => {
    setMenuOpenId(null);
    setDeleteTarget(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      const res = await api.delete(`/journeys/${deleteTarget}`);
      if (res.ok || res.status === 404) {
        setJourneys(prev => prev.filter(j => j.id !== deleteTarget));
        toast.success('Journey deleted.');
      } else {
        throw new Error('Delete failed');
      }
    } catch (err) {
      toast.error('Failed to delete journey.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const activeJourneys = journeys.filter(j => !isPast(j));
  const pastJourneys = journeys.filter(j => isPast(j));

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
      ) : activeJourneys.length > 0 || pastJourneys.length > 0 ? (
        <>
          {/* Active Journeys */}
          {activeJourneys.length > 0 && (
            <JourneysContainer>
              {activeJourneys.map(journey => (
                <JourneyCardItem
                  key={journey.id}
                  journey={journey}
                  onNavigate={(id) => navigate(`/journey/${id}`)}
                  onArchive={handleArchive}
                  onDelete={handleDeleteClick}
                  menuOpenId={menuOpenId}
                  onMenuToggle={handleMenuToggle}
                />
              ))}
            </JourneysContainer>
          )}

          {/* No active journeys message */}
          {activeJourneys.length === 0 && pastJourneys.length > 0 && (
            <EmptyState>
              <EmptyTitle>No active journeys</EmptyTitle>
              <EmptyText>All your journeys are archived or completed. Start a new one below.</EmptyText>
              <StartButton onClick={() => navigate('/chatbot')}>
                Start a New Journey
              </StartButton>
            </EmptyState>
          )}

          {/* Past Journeys */}
          {pastJourneys.length > 0 && (
            <>
              {activeJourneys.length > 0 && <Divider />}
              <div>
                <SectionHeader onClick={() => setPastOpen(prev => !prev)}>
                  <SectionTitle>Past Health Journeys</SectionTitle>
                  <SectionCount>{pastJourneys.length}</SectionCount>
                  {pastOpen
                    ? <HiOutlineChevronUp size={20} />
                    : <HiOutlineChevronDown size={20} />}
                </SectionHeader>
              </div>
              {pastOpen && (
                <JourneysContainer>
                  {pastJourneys.map(journey => (
                    <JourneyCardItem
                      key={journey.id}
                      journey={journey}
                      onNavigate={(id) => navigate(`/journey/${id}`)}
                      onArchive={() => {}}
                      onDelete={handleDeleteClick}
                      menuOpenId={menuOpenId}
                      onMenuToggle={handleMenuToggle}
                    />
                  ))}
                </JourneysContainer>
              )}
            </>
          )}
        </>
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

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <ModalOverlay onClick={() => setDeleteTarget(null)}>
          <ModalBox onClick={e => e.stopPropagation()}>
            <ModalIcon>
              <HiOutlineExclamation size={24} />
            </ModalIcon>
            <ModalTitle>Delete Health Journey?</ModalTitle>
            <ModalText>
              Are you sure you want to delete this health journey? This cannot be undone.
            </ModalText>
            <ModalButtons>
              <CancelButton onClick={() => setDeleteTarget(null)}>Cancel</CancelButton>
              <DeleteConfirmButton onClick={handleDeleteConfirm}>Delete</DeleteConfirmButton>
            </ModalButtons>
          </ModalBox>
        </ModalOverlay>
      )}
    </MainContent>
  );
};

export default HealthJourneys;
