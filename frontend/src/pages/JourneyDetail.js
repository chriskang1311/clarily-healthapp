import { api } from '../api';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import {
  HiOutlineArrowLeft,
  HiOutlineCalendar,
  HiOutlineChat,
  HiOutlineCheckCircle,
  HiOutlineShieldCheck,
  HiOutlineClipboardList,
  HiOutlineSearch,
  HiOutlinePencilAlt,
  HiOutlineCheck,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
} from 'react-icons/hi';
import { useToast } from '../contexts/ToastContext';


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

/* ── Step Panels ── */
const StepPanel = styled.div`
  background: #fff;
  border: 1.5px solid ${props => props.active ? props.theme.colors.primary : '#E0E0E0'};
  border-radius: ${props => props.theme.borderRadius.large};
  overflow: hidden;
  transition: border-color 0.2s;
`;

const StepHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px 24px;
  cursor: pointer;
  user-select: none;

  &:hover { background: #FAFAFA; }
`;

const StepNumber = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
  background-color: ${props => props.done ? props.theme.colors.primary : '#E8E8E8'};
  color: ${props => props.done ? '#fff' : '#888'};
`;

const StepHeaderText = styled.div`
  flex: 1;
`;

const StepName = styled.p`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.primary};
  margin: 0 0 2px 0;
`;

const StepStatus = styled.p`
  font-size: 13px;
  color: ${props => props.done ? '#4CAF50' : '#999'};
  margin: 0;
  font-weight: ${props => props.done ? '600' : '400'};
`;

const StepBody = styled.div`
  padding: 0 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border-top: 1px solid #F0F0F0;
`;

const SummaryText = styled.p`
  font-size: 15px;
  color: #444;
  line-height: 1.7;
  margin: 0;
  white-space: pre-wrap;
`;

/* ── Diagnoses ── */
const DiagnosesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const DiagnosisCard = styled.div`
  background: ${props => props.theme.colors.primaryLight};
  border-radius: ${props => props.theme.borderRadius.medium};
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
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

/* ── Action Buttons ── */
const ButtonRow = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const PrimaryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background-color: ${props => props.theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: ${props => props.theme.borderRadius.medium};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover { opacity: 0.85; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const SecondaryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background-color: #fff;
  color: ${props => props.theme.colors.primary};
  border: 1.5px solid ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.borderRadius.medium};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover { background-color: ${props => props.theme.colors.primaryLight}; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

/* ── Insurance Analysis ── */
const AnalysisBox = styled.div`
  background: #F1F8E9;
  border: 1px solid #AED581;
  border-radius: ${props => props.theme.borderRadius.medium};
  padding: 16px 20px;
  font-size: 14px;
  color: #33691E;
  line-height: 1.7;
  white-space: pre-wrap;
`;

/* ── Checklist ── */
const ChecklistItem = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 14px;
  color: #444;
  line-height: 1.5;
  cursor: pointer;
  text-decoration: ${props => props.checked ? 'line-through' : 'none'};
  color: ${props => props.checked ? '#AAA' : '#444'};
`;

const ChecklistCheckbox = styled.input`
  width: 16px;
  height: 16px;
  margin-top: 2px;
  flex-shrink: 0;
  accent-color: ${props => props.theme.colors.primary};
  cursor: pointer;
`;

/* ── Notepad ── */
const NotepadSection = styled.div`
  background: #fff;
  border: 1.5px solid #E0E0E0;
  border-radius: ${props => props.theme.borderRadius.large};
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const NotepadTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const NotepadTextarea = styled.textarea`
  border: 1px solid #D0D0D0;
  border-radius: ${props => props.theme.borderRadius.medium};
  padding: 12px 14px;
  font-size: 14px;
  font-family: inherit;
  color: #333;
  line-height: 1.6;
  resize: vertical;
  min-height: 140px;
  outline: none;
  transition: border-color 0.2s;

  &:focus { border-color: ${props => props.theme.colors.primary}; }
  &::placeholder { color: #BBB; }
`;

const SavedIndicator = styled.span`
  font-size: 13px;
  color: #4CAF50;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: ${props => props.visible ? 1 : 0};
  transition: opacity 0.4s;
`;

const CompleteCheckRow = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #555;
  cursor: pointer;
  margin-top: 4px;
`;

const LoadingText = styled.p`
  color: #777;
  font-size: 16px;
`;

// ─────────────────────────────────────────────────────────────────────────────

const JourneyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [journey, setJourney] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(null);
  const [generatingAnalysis, setGeneratingAnalysis] = useState(false);
  const [generatingChecklist, setGeneratingChecklist] = useState(false);
  const [checkedItems, setCheckedItems] = useState({});
  const [notes, setNotes] = useState('');
  const [notesSaved, setNotesSaved] = useState(false);
  const notesTimer = useRef(null);

  useEffect(() => {
    fetchJourney();
  }, [id]);

  const fetchJourney = async () => {
    try {
      const res = await api.get(`/journeys/${id}`);
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      setJourney(data.journey);
      setNotes(data.journey.notes || '');
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
      const res = await api.put(`/journeys/${journey.id}`, {
        completed_steps: updatedCompleted,
        updated_at: new Date().toISOString(),
      });
      if (res.ok) {
        const data = await res.json();
        setJourney(data.journey);
      }
    } catch (err) {
      toast.error('Failed to update progress step.');
    }
  };

  const handleAnalyzeCoverage = async () => {
    setGeneratingAnalysis(true);
    try {
      const res = await api.post(`/journeys/${journey.id}/insurance-analysis`, {});
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to analyze coverage');
      setJourney(prev => ({ ...prev, insurance_analysis: data.analysis }));
      toast.success('Coverage analysis ready!');
    } catch (err) {
      toast.error(err.message || 'Failed to generate coverage analysis.');
    } finally {
      setGeneratingAnalysis(false);
    }
  };

  const handleGetChecklist = async () => {
    setGeneratingChecklist(true);
    try {
      const res = await api.post(`/journeys/${journey.id}/checklist`, {});
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate checklist');
      setJourney(prev => ({ ...prev, checklist: data.checklist }));
      toast.success('Pre-visit checklist ready!');
    } catch (err) {
      toast.error('Failed to generate checklist.');
    } finally {
      setGeneratingChecklist(false);
    }
  };

  const handleNotesChange = useCallback((value) => {
    setNotes(value);
    setNotesSaved(false);
    if (notesTimer.current) clearTimeout(notesTimer.current);
    notesTimer.current = setTimeout(async () => {
      try {
        await api.put(`/journeys/${journey.id}/notes`, { notes: value });
        setNotesSaved(true);
        setTimeout(() => setNotesSaved(false), 2000);
      } catch (_) {}
    }, 500);
  }, [journey]);

  const buildZocDocUrl = () => {
    const diagnoses = journey.diagnoses || [];
    const topDiagnosis = diagnoses[0]?.condition || '';
    const insurance = journey.insurance_analysis; // we use plan info from journey context if available
    const params = new URLSearchParams();
    if (topDiagnosis) params.set('reason_visit', topDiagnosis);
    return `https://www.zocdoc.com/search?${params.toString()}`;
  };

  const getTopDiagnosis = () => (journey.diagnoses || [])[0]?.condition || '';

  const formatDate = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (isLoading) return <MainContent><LoadingText>Loading journey…</LoadingText></MainContent>;
  if (!journey) return null;

  const diagnoses = journey.diagnoses || [];
  const completedSteps = journey.completed_steps || [];
  const checklist = journey.checklist || [];

  const stepDone = (step) => completedSteps.includes(step);

  const toggleStep = (stepKey) =>
    setActiveStep(prev => prev === stepKey ? null : stepKey);

  return (
    <MainContent>
      <BackButton onClick={() => navigate('/health-journeys')}>
        <HiOutlineArrowLeft size={16} />
        Back to Health Journeys
      </BackButton>

      <Header>
        <Title>{journey.primary_symptom || 'Your Health Journey'}</Title>
        <Subtitle>Started {formatDate(journey.created_at)}</Subtitle>
      </Header>

      {/* ── Step 1: Symptoms ── */}
      <StepPanel active={activeStep === 'symptoms'}>
        <StepHeader onClick={() => toggleStep('symptoms')}>
          <StepNumber done={stepDone('Symptoms')}>
            {stepDone('Symptoms') ? <HiOutlineCheck size={15} /> : '1'}
          </StepNumber>
          <StepHeaderText>
            <StepName>Symptoms</StepName>
            <StepStatus done={stepDone('Symptoms')}>{stepDone('Symptoms') ? 'Complete' : 'In progress'}</StepStatus>
          </StepHeaderText>
          {activeStep === 'symptoms' ? <HiOutlineChevronUp size={18} color="#999" /> : <HiOutlineChevronDown size={18} color="#999" />}
        </StepHeader>

        {activeStep === 'symptoms' && (
          <StepBody>
            {diagnoses.length > 0 && (
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
            )}
            {journey.symptom_summary && <SummaryText>{journey.symptom_summary}</SummaryText>}
            <CompleteCheckRow>
              <input
                type="checkbox"
                checked={stepDone('Symptoms')}
                onChange={() => handleStepToggle('Symptoms', stepDone('Symptoms'))}
                style={{ accentColor: '#2D5016', width: 16, height: 16, cursor: 'pointer' }}
              />
              Mark step complete
            </CompleteCheckRow>
          </StepBody>
        )}
      </StepPanel>

      {/* ── Step 2: Insurance ── */}
      <StepPanel active={activeStep === 'insurance'}>
        <StepHeader onClick={() => toggleStep('insurance')}>
          <StepNumber done={stepDone('Insurance')}>
            {stepDone('Insurance') ? <HiOutlineCheck size={15} /> : '2'}
          </StepNumber>
          <StepHeaderText>
            <StepName>Insurance</StepName>
            <StepStatus done={stepDone('Insurance')}>{stepDone('Insurance') ? 'Complete' : 'Review your coverage'}</StepStatus>
          </StepHeaderText>
          {activeStep === 'insurance' ? <HiOutlineChevronUp size={18} color="#999" /> : <HiOutlineChevronDown size={18} color="#999" />}
        </StepHeader>

        {activeStep === 'insurance' && (
          <StepBody>
            <ButtonRow>
              <SecondaryButton onClick={() => navigate('/insurance')}>
                <HiOutlineShieldCheck size={16} />
                View / Add Insurance
              </SecondaryButton>
              <PrimaryButton onClick={handleAnalyzeCoverage} disabled={generatingAnalysis}>
                <HiOutlineSearch size={16} />
                {generatingAnalysis ? 'Analyzing…' : 'Analyze My Coverage'}
              </PrimaryButton>
            </ButtonRow>

            {journey.insurance_analysis && (
              <AnalysisBox>{journey.insurance_analysis}</AnalysisBox>
            )}

            <CompleteCheckRow>
              <input
                type="checkbox"
                checked={stepDone('Insurance')}
                onChange={() => handleStepToggle('Insurance', stepDone('Insurance'))}
                style={{ accentColor: '#2D5016', width: 16, height: 16, cursor: 'pointer' }}
              />
              Mark step complete
            </CompleteCheckRow>
          </StepBody>
        )}
      </StepPanel>

      {/* ── Step 3: Doctor Visit ── */}
      <StepPanel active={activeStep === 'doctor'}>
        <StepHeader onClick={() => toggleStep('doctor')}>
          <StepNumber done={stepDone('Doctor Visit')}>
            {stepDone('Doctor Visit') ? <HiOutlineCheck size={15} /> : '3'}
          </StepNumber>
          <StepHeaderText>
            <StepName>Doctor Visit</StepName>
            <StepStatus done={stepDone('Doctor Visit')}>{stepDone('Doctor Visit') ? 'Complete' : 'Find a doctor & prepare'}</StepStatus>
          </StepHeaderText>
          {activeStep === 'doctor' ? <HiOutlineChevronUp size={18} color="#999" /> : <HiOutlineChevronDown size={18} color="#999" />}
        </StepHeader>

        {activeStep === 'doctor' && (
          <StepBody>
            <ButtonRow>
              <PrimaryButton as="a" href={buildZocDocUrl()} target="_blank" rel="noopener noreferrer">
                <HiOutlineSearch size={16} />
                Find a Doctor on ZocDoc
              </PrimaryButton>
              <SecondaryButton onClick={() => navigate('/appointments', { state: { journeyId: journey.id, reason: getTopDiagnosis() } })}>
                <HiOutlineCalendar size={16} />
                Log My Appointment
              </SecondaryButton>
            </ButtonRow>

            <SecondaryButton
              onClick={handleGetChecklist}
              disabled={generatingChecklist}
              style={{ alignSelf: 'flex-start' }}
            >
              <HiOutlineClipboardList size={16} />
              {generatingChecklist ? 'Generating…' : checklist.length > 0 ? 'Refresh Checklist' : 'Get Pre-Visit Checklist'}
            </SecondaryButton>

            {checklist.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {checklist.map((item, i) => (
                  <ChecklistItem key={i} checked={!!checkedItems[i]}>
                    <ChecklistCheckbox
                      type="checkbox"
                      checked={!!checkedItems[i]}
                      onChange={() => setCheckedItems(prev => ({ ...prev, [i]: !prev[i] }))}
                    />
                    {item}
                  </ChecklistItem>
                ))}
              </div>
            )}

            <CompleteCheckRow>
              <input
                type="checkbox"
                checked={stepDone('Doctor Visit')}
                onChange={() => handleStepToggle('Doctor Visit', stepDone('Doctor Visit'))}
                style={{ accentColor: '#2D5016', width: 16, height: 16, cursor: 'pointer' }}
              />
              Mark step complete
            </CompleteCheckRow>
          </StepBody>
        )}
      </StepPanel>

      {/* ── Step 4: Diagnosis ── */}
      <StepPanel active={activeStep === 'diagnosis'}>
        <StepHeader onClick={() => toggleStep('diagnosis')}>
          <StepNumber done={stepDone('Diagnosis')}>
            {stepDone('Diagnosis') ? <HiOutlineCheck size={15} /> : '4'}
          </StepNumber>
          <StepHeaderText>
            <StepName>Diagnosis</StepName>
            <StepStatus done={stepDone('Diagnosis')}>{stepDone('Diagnosis') ? 'Complete' : 'Pending doctor visit'}</StepStatus>
          </StepHeaderText>
          {activeStep === 'diagnosis' ? <HiOutlineChevronUp size={18} color="#999" /> : <HiOutlineChevronDown size={18} color="#999" />}
        </StepHeader>

        {activeStep === 'diagnosis' && (
          <StepBody>
            <p style={{ fontSize: 14, color: '#666', margin: 0 }}>
              Mark this step complete after receiving your official diagnosis from your doctor.
            </p>
            <CompleteCheckRow>
              <input
                type="checkbox"
                checked={stepDone('Diagnosis')}
                onChange={() => handleStepToggle('Diagnosis', stepDone('Diagnosis'))}
                style={{ accentColor: '#2D5016', width: 16, height: 16, cursor: 'pointer' }}
              />
              Mark step complete
            </CompleteCheckRow>
          </StepBody>
        )}
      </StepPanel>

      {/* ── Notepad ── */}
      <NotepadSection>
        <NotepadTitle>
          <HiOutlinePencilAlt size={20} />
          My Questions &amp; Notes
          <SavedIndicator visible={notesSaved}>
            <HiOutlineCheckCircle size={14} /> Saved
          </SavedIndicator>
        </NotepadTitle>
        <NotepadTextarea
          placeholder="Write your questions for the doctor, things to remember, or any notes about your symptoms…"
          value={notes}
          onChange={e => handleNotesChange(e.target.value)}
        />
      </NotepadSection>

      {/* ── Bottom actions ── */}
      <ButtonRow>
        <SecondaryButton onClick={() => navigate('/chatbot')}>
          <HiOutlineChat size={16} />
          Start New Chat
        </SecondaryButton>
      </ButtonRow>
    </MainContent>
  );
};

export default JourneyDetail;
