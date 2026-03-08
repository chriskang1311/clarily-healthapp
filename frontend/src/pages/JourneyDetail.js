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
  HiOutlineArrowRight,
} from 'react-icons/hi';
import { useToast } from '../contexts/ToastContext';
import ReactMarkdown from 'react-markdown';


const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  background-color: ${props => props.theme.colors.background};
`;

/* ── Top bar ── */
const TopBar = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 64px 0;

  @media (max-width: 768px) {
    padding: 16px 20px 0;
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

  &:hover { opacity: 0.7; }
`;

const JourneyTitleText = styled.h1`
  font-size: 22px;
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
  margin: 0;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

/* ── Progress Indicator ── */
const ProgressWrapper = styled.div`
  padding: 28px 64px 0;

  @media (max-width: 768px) {
    padding: 20px 20px 0;
  }
`;

const ProgressTrack = styled.div`
  display: flex;
  align-items: center;
`;

const ProgressStep = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  padding: 0;
  cursor: ${props => props.clickable ? 'pointer' : 'default'};
  flex-shrink: 0;

  &:hover .step-circle {
    opacity: ${props => props.clickable ? 0.8 : 1};
  }
`;

const StepCircle = styled.div.attrs({ className: 'step-circle' })`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  transition: background-color 0.2s, border-color 0.2s;

  ${props => props.status === 'done' && `
    background-color: ${props.theme.colors.primary};
    color: #fff;
    border: 2.5px solid ${props.theme.colors.primary};
  `}
  ${props => props.status === 'active' && `
    background-color: ${props.theme.colors.primary};
    color: #fff;
    border: 2.5px solid ${props.theme.colors.primary};
    box-shadow: 0 0 0 4px ${props.theme.colors.primaryLight};
  `}
  ${props => props.status === 'future' && `
    background-color: #fff;
    color: #AAA;
    border: 2.5px solid #D0D0D0;
  `}
`;

const StepLabel = styled.span`
  font-size: 12px;
  font-weight: ${props => props.active ? '700' : '500'};
  color: ${props => props.active ? props.theme.colors.primary : props.done ? props.theme.colors.primary : '#AAA'};
  white-space: nowrap;

  @media (max-width: 480px) {
    display: none;
  }
`;

const ProgressLine = styled.div`
  flex: 1;
  height: 2px;
  background-color: ${props => props.done ? props.theme.colors.primary : '#E0E0E0'};
  transition: background-color 0.3s;
  margin: 0 4px;
  margin-bottom: 22px;

  @media (max-width: 480px) {
    margin-bottom: 0;
  }
`;

/* ── Step Content Area ── */
const StepContent = styled.div`
  flex: 1;
  padding: 36px 64px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  animation: ${fadeIn} 0.25s ease;

  @media (max-width: 768px) {
    padding: 24px 20px;
  }
`;

const StepHeading = styled.h2`
  font-size: 26px;
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
  margin: 0;
`;

const StepSubheading = styled.p`
  font-size: 15px;
  color: #666;
  margin: 0;
  line-height: 1.6;
`;

const Card = styled.div`
  background: #fff;
  border: 1px solid #E0E0E0;
  border-radius: ${props => props.theme.borderRadius.large};
  padding: 24px 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (max-width: 768px) {
    padding: 18px 16px;
  }
`;

const CardTitle = styled.h3`
  font-size: 15px;
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
  margin: 0;
  padding-bottom: 10px;
  border-bottom: 1.5px solid ${props => props.theme.colors.primaryLight};
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

const SummaryText = styled.p`
  font-size: 14px;
  color: #444;
  line-height: 1.7;
  margin: 0;
  white-space: pre-wrap;
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
  text-decoration: none;
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

/* ── Insurance Plan Selector ── */
const PlanSelectorGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const PlanSelectCard = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: ${props => props.theme.borderRadius.medium};
  border: 2px solid ${props => props.selected ? props.theme.colors.primary : '#E0E0E0'};
  background: ${props => props.selected ? props.theme.colors.primaryLight : '#fff'};
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;

  &:hover { border-color: ${props => props.theme.colors.primary}; }
`;

const PlanTypeBadge = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  background-color: ${props => props.theme.colors.primary};
  padding: 2px 8px;
  border-radius: 99px;
  white-space: nowrap;
  flex-shrink: 0;
`;

const PlanInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const PlanProvider = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.primary};
`;

const PlanDetail = styled.span`
  font-size: 12px;
  color: #666;
`;

const PlanCheckmark = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid ${props => props.selected ? props.theme.colors.primary : '#CCC'};
  background: ${props => props.selected ? props.theme.colors.primary : 'transparent'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s;
`;

const ReadOnlyBanner = styled.div`
  background: #F5F5F5;
  border: 1px solid #E0E0E0;
  border-radius: ${props => props.theme.borderRadius.medium};
  padding: 12px 20px;
  font-size: 14px;
  color: #777;
  display: flex;
  align-items: center;
  gap: 8px;
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

  h1, h2, h3 { color: #33691E; font-size: 15px; margin: 12px 0 6px; }
  strong { color: #2E7D32; }
  ul, ol { padding-left: 20px; margin: 6px 0; }
  li { margin: 4px 0; }
  hr { border: none; border-top: 1px solid #AED581; margin: 12px 0; }
  blockquote { border-left: 3px solid #8BC34A; margin: 8px 0; padding-left: 12px; color: #558B2F; }
  p { margin: 6px 0; }
`;

/* ── Checklist ── */
const ChecklistItem = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 14px;
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

const ApptConfirmBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #E8F5E9;
  border: 1px solid #A5D6A7;
  border-radius: ${props => props.theme.borderRadius.medium};
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 500;
  color: #2E7D32;
`;

const ApptModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 20px;
`;

const ApptModalBox = styled.div`
  background: #fff;
  border-radius: ${props => props.theme.borderRadius.large};
  padding: 28px 32px;
  max-width: 440px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ApptModalTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
  margin: 0;
`;

const ApptFieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const ApptLabel = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: #555;
`;

const ApptInput = styled.input`
  border: 1.5px solid #D0D0D0;
  border-radius: ${props => props.theme.borderRadius.medium};
  padding: 10px 12px;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
  &:focus { border-color: ${props => props.theme.colors.primary}; }
`;

const ApptModalButtons = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 4px;
`;

/* ── Nav Footer ── */
const NavFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 64px 40px;
  border-top: 1px solid #F0F0F0;

  @media (max-width: 768px) {
    padding: 16px 20px 32px;
  }
`;

const NavButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: ${props => props.theme.borderRadius.medium};
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s, background-color 0.2s;

  ${props => props.primary ? `
    background-color: ${props.theme.colors.primary};
    color: #fff;
    border: none;
    &:hover { opacity: 0.88; }
  ` : `
    background-color: #fff;
    color: ${props.theme.colors.primary};
    border: 1.5px solid #D0D0D0;
    &:hover { background-color: #F5F5F5; }
  `}
`;

const LoadingText = styled.p`
  color: #777;
  font-size: 16px;
  padding: 48px 64px;
`;

// ─────────────────────────────────────────────────────────────────────────────

const STEPS = ['Symptoms', 'Insurance', 'Doctor Visit', 'Diagnosis'];

const JourneyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [journey, setJourney] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [generatingAnalysis, setGeneratingAnalysis] = useState(false);
  const [generatingChecklist, setGeneratingChecklist] = useState(false);
  const [appointmentLogged, setAppointmentLogged] = useState(false);
  const [showApptModal, setShowApptModal] = useState(false);
  const [apptForm, setApptForm] = useState({ doctor_name: '', date: '', time: '', reason: '' });
  const [apptSaving, setApptSaving] = useState(false);
  const [insurancePlans, setInsurancePlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
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
      const j = data.journey;
      setJourney(j);
      setNotes(j.notes || '');
      // Start on the furthest completed step
      const completed = j.completed_steps || [];
      const lastDone = STEPS.reduce((acc, s, i) => completed.includes(s) ? i : acc, -1);
      setCurrentStep(Math.min(lastDone + 1, STEPS.length - 1));
      // Returning users: don't re-block Doctor Visit step if already logged
      if (completed.includes('Doctor Visit')) setAppointmentLogged(true);

      // Fetch insurance plans for the selector
      try {
        const insRes = await api.get('/insurance');
        if (insRes.ok) {
          const insData = await insRes.json();
          const plans = insData.insurance || [];
          setInsurancePlans(plans);
          if (plans.length > 0) setSelectedPlanId(plans[0].id);
        }
      } catch (_) {}
    } catch (err) {
      console.error('Error fetching journey:', err);
      toast.error('Could not load this health journey.');
      navigate('/health-journeys');
    } finally {
      setIsLoading(false);
    }
  };

  const markStepComplete = async (stepName) => {
    const updatedCompleted = [...new Set([...(journey.completed_steps || []), stepName])];
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
      console.error('Error updating step:', err);
    }
  };

  const handleContinue = async () => {
    await markStepComplete(STEPS[currentStep]);
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      navigate('/health-journeys');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
    else navigate('/health-journeys');
  };

  const handleAnalyzeCoverage = async () => {
    setGeneratingAnalysis(true);
    try {
      const res = await api.post(`/journeys/${journey.id}/insurance-analysis`, { insurance_id: selectedPlanId });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
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
      if (!res.ok) throw new Error(data.error || 'Failed');
      setJourney(prev => ({ ...prev, checklist: data.checklist }));
      toast.success('Pre-visit checklist ready!');
    } catch (err) {
      toast.error('Failed to generate checklist.');
    } finally {
      setGeneratingChecklist(false);
    }
  };

  const handleLogAppointment = async () => {
    if (!apptForm.doctor_name.trim() || !apptForm.date || !apptForm.time) return;
    setApptSaving(true);
    try {
      const res = await api.post('/appointments', {
        ...apptForm,
        journey_id: journey.id,
        created_at: new Date().toISOString(),
      });
      if (!res.ok) throw new Error('Failed');
      setAppointmentLogged(true);
      setShowApptModal(false);
      setApptForm({ doctor_name: '', date: '', time: '', reason: '' });
      toast.success('Appointment logged!');
    } catch {
      toast.error('Failed to save appointment. Please try again.');
    } finally {
      setApptSaving(false);
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
    const topDiagnosis = (journey.diagnoses || [])[0]?.condition || '';
    const params = new URLSearchParams();
    if (topDiagnosis) params.set('reason_visit', topDiagnosis);
    return `https://www.zocdoc.com/search?${params.toString()}`;
  };

  const getTopDiagnosis = () => (journey.diagnoses || [])[0]?.condition || '';

  const canContinue = () => {
    if (currentStep === 0) return true;
    if (currentStep === 1) return !!journey.insurance_analysis;
    if (currentStep === 2) return appointmentLogged;
    return true;
  };

  const getContinueHint = () => {
    if (currentStep === 1 && !journey.insurance_analysis) return 'Please analyze your coverage before continuing.';
    if (currentStep === 2 && !appointmentLogged) return 'Please log your appointment before continuing.';
    return '';
  };

  const formatDate = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (isLoading) return <MainContent><LoadingText>Loading journey…</LoadingText></MainContent>;
  if (!journey) return null;

  const diagnoses = journey.diagnoses || [];
  const checklist = journey.checklist || [];
  const completedSteps = journey.completed_steps || [];
  const isReadOnly = journey.status === 'archived' || completedSteps.length === STEPS.length;
  const stepStatus = (i) => {
    if (completedSteps.includes(STEPS[i])) return 'done';
    if (i === currentStep) return 'active';
    return 'future';
  };

  return (
    <MainContent>
      {/* ── Top Bar ── */}
      <TopBar>
        <BackButton onClick={() => navigate('/health-journeys')}>
          <HiOutlineArrowLeft size={16} />
          Back
        </BackButton>
        <JourneyTitleText>{journey.primary_symptom || 'Your Health Journey'}</JourneyTitleText>
        <span style={{ fontSize: 13, color: '#999', flexShrink: 0 }}>
          Started {formatDate(journey.created_at)}
        </span>
      </TopBar>

      {/* ── Progress Indicator ── */}
      <ProgressWrapper>
        <ProgressTrack>
          {STEPS.map((step, i) => {
            const status = stepStatus(i);
            const clickable = status === 'done' || i < currentStep;
            return (
              <React.Fragment key={step}>
                <ProgressStep
                  clickable={clickable}
                  onClick={() => clickable && setCurrentStep(i)}
                  title={clickable ? `Go to ${step}` : step}
                >
                  <StepCircle status={status}>
                    {status === 'done' ? <HiOutlineCheck size={15} /> : i + 1}
                  </StepCircle>
                  <StepLabel active={status === 'active'} done={status === 'done'}>{step}</StepLabel>
                </ProgressStep>
                {i < STEPS.length - 1 && (
                  <ProgressLine done={completedSteps.includes(STEPS[i])} />
                )}
              </React.Fragment>
            );
          })}
        </ProgressTrack>
      </ProgressWrapper>

      {/* ── Step Content ── */}
      <StepContent key={currentStep}>

        {/* STEP 0: Symptoms */}
        {currentStep === 0 && (
          <>
            <div>
              <StepHeading>Your Symptoms</StepHeading>
              <StepSubheading>Here's a summary of what you reported and the potential diagnoses identified.</StepSubheading>
            </div>

            {diagnoses.length > 0 && (
              <Card>
                <CardTitle>Possible Diagnoses</CardTitle>
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
              </Card>
            )}

            {journey.symptom_summary && (
              <Card>
                <CardTitle>Symptom Summary</CardTitle>
                <SummaryText>{journey.symptom_summary}</SummaryText>
              </Card>
            )}
          </>
        )}

        {/* STEP 1: Insurance */}
        {currentStep === 1 && (
          <>
            <div>
              <StepHeading>Review Your Insurance</StepHeading>
              <StepSubheading>Make sure your insurance information is up to date, then get an AI-powered analysis of what your plan covers for your diagnoses.</StepSubheading>
            </div>

            <Card>
              <CardTitle>Select Your Insurance Plan</CardTitle>
              {insurancePlans.length === 0 ? (
                <div>
                  <p style={{ fontSize: 14, color: '#666', margin: '0 0 12px' }}>
                    No insurance plans found. Add your insurance before analyzing coverage.
                  </p>
                  <SecondaryButton onClick={() => navigate('/insurance')}>
                    <HiOutlineShieldCheck size={16} />
                    Add Insurance
                  </SecondaryButton>
                </div>
              ) : (
                <>
                  <PlanSelectorGrid>
                    {insurancePlans.map(plan => (
                      <PlanSelectCard
                        key={plan.id}
                        selected={selectedPlanId === plan.id}
                        onClick={() => {
                          if (selectedPlanId !== plan.id) {
                            setSelectedPlanId(plan.id);
                            setJourney(prev => ({ ...prev, insurance_analysis: null }));
                          }
                        }}
                      >
                        <PlanTypeBadge>{plan.plan_type || 'Primary'}</PlanTypeBadge>
                        <PlanInfo>
                          <PlanProvider>{plan.provider}</PlanProvider>
                          <PlanDetail>{plan.plan_name} · Member ID: {plan.member_id}{plan.group_number ? ` · Group: ${plan.group_number}` : ''}</PlanDetail>
                        </PlanInfo>
                        <PlanCheckmark selected={selectedPlanId === plan.id}>
                          {selectedPlanId === plan.id && <HiOutlineCheck size={12} color="#fff" />}
                        </PlanCheckmark>
                      </PlanSelectCard>
                    ))}
                  </PlanSelectorGrid>
                  <ButtonRow>
                    <SecondaryButton onClick={() => navigate('/insurance')}>
                      <HiOutlineShieldCheck size={16} />
                      Manage Insurance
                    </SecondaryButton>
                    <PrimaryButton onClick={handleAnalyzeCoverage} disabled={generatingAnalysis || !selectedPlanId}>
                      <HiOutlineSearch size={16} />
                      {generatingAnalysis ? 'Analyzing…' : 'Analyze My Coverage'}
                    </PrimaryButton>
                  </ButtonRow>
                </>
              )}
              {journey.insurance_analysis && (
                <AnalysisBox>
                  <ReactMarkdown>{journey.insurance_analysis}</ReactMarkdown>
                </AnalysisBox>
              )}
            </Card>
          </>
        )}

        {/* STEP 2: Doctor Visit */}
        {currentStep === 2 && (
          <>
            <div>
              <StepHeading>Doctor Visit</StepHeading>
              <StepSubheading>Find a doctor, prepare for your visit, and log your appointment once booked.</StepSubheading>
            </div>

            <Card>
              <CardTitle>Find &amp; Book a Doctor</CardTitle>
              <ButtonRow>
                <PrimaryButton as="a" href={buildZocDocUrl()} target="_blank" rel="noopener noreferrer">
                  <HiOutlineSearch size={16} />
                  Find a Doctor on ZocDoc
                </PrimaryButton>
                <SecondaryButton onClick={() => {
                  setApptForm(prev => ({ ...prev, reason: getTopDiagnosis() }));
                  setShowApptModal(true);
                }}>
                  <HiOutlineCalendar size={16} />
                  Log My Appointment
                </SecondaryButton>
              </ButtonRow>
              {appointmentLogged && (
                <ApptConfirmBanner>
                  <HiOutlineCheckCircle size={16} />
                  Appointment logged — it has been saved to your Appointments tab.
                </ApptConfirmBanner>
              )}
            </Card>

            <Card>
              <CardTitle>Pre-Visit Checklist</CardTitle>
              <SecondaryButton
                onClick={handleGetChecklist}
                disabled={generatingChecklist}
                style={{ alignSelf: 'flex-start' }}
              >
                <HiOutlineClipboardList size={16} />
                {generatingChecklist ? 'Generating…' : checklist.length > 0 ? 'Refresh Checklist' : 'Get My Checklist'}
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
            </Card>

            <Card>
              <CardTitle style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <HiOutlinePencilAlt size={16} />
                My Questions &amp; Notes
                <SavedIndicator visible={notesSaved}>
                  <HiOutlineCheckCircle size={13} /> Saved
                </SavedIndicator>
              </CardTitle>
              <NotepadTextarea
                placeholder="Write your questions for the doctor, things to remember, or anything about your symptoms…"
                value={notes}
                onChange={e => handleNotesChange(e.target.value)}
              />
            </Card>
          </>
        )}

        {/* STEP 3: Diagnosis */}
        {currentStep === 3 && (
          <>
            <div>
              <StepHeading>Diagnosis</StepHeading>
              <StepSubheading>After your doctor visit, record your official diagnosis here to complete your health journey.</StepSubheading>
            </div>

            <Card>
              <CardTitle>Complete Your Journey</CardTitle>
              <p style={{ fontSize: 14, color: '#555', margin: 0, lineHeight: 1.7 }}>
                Once you've received your official diagnosis from your doctor, mark this step complete to close out your health journey. You can always come back to review your symptom summary and notes.
              </p>
              <ButtonRow>
                <SecondaryButton onClick={() => navigate('/chatbot')}>
                  <HiOutlineChat size={16} />
                  Start a New Chat
                </SecondaryButton>
              </ButtonRow>
            </Card>
          </>
        )}

      </StepContent>

      {/* ── Navigation Footer ── */}
      <NavFooter>
        <NavButton onClick={handleBack}>
          <HiOutlineArrowLeft size={15} />
          {currentStep === 0 ? 'All Journeys' : 'Back'}
        </NavButton>
        {isReadOnly ? (
          <ReadOnlyBanner>
            <HiOutlineCheckCircle size={16} />
            {journey.status === 'archived' ? 'This journey is archived' : 'Journey Complete'}
          </ReadOnlyBanner>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            {getContinueHint() && (
              <span style={{ fontSize: 12, color: '#E65100', fontStyle: 'italic' }}>
                {getContinueHint()}
              </span>
            )}
            <NavButton
              primary
              onClick={handleContinue}
              disabled={!canContinue()}
              style={!canContinue() ? { opacity: 0.45, cursor: 'not-allowed' } : {}}
            >
              {currentStep === STEPS.length - 1 ? 'Complete Journey' : 'Continue'}
              {currentStep < STEPS.length - 1 && <HiOutlineArrowRight size={15} />}
            </NavButton>
          </div>
        )}
      </NavFooter>

      {/* ── Log Appointment Modal ── */}
      {showApptModal && (
        <ApptModalOverlay onClick={() => setShowApptModal(false)}>
          <ApptModalBox onClick={e => e.stopPropagation()}>
            <ApptModalTitle>Log My Appointment</ApptModalTitle>

            <ApptFieldGroup>
              <ApptLabel>Doctor Name *</ApptLabel>
              <ApptInput
                placeholder="Dr. Jane Smith"
                value={apptForm.doctor_name}
                onChange={e => setApptForm(prev => ({ ...prev, doctor_name: e.target.value }))}
              />
            </ApptFieldGroup>

            <ApptFieldGroup>
              <ApptLabel>Date *</ApptLabel>
              <ApptInput
                type="date"
                value={apptForm.date}
                onChange={e => setApptForm(prev => ({ ...prev, date: e.target.value }))}
              />
            </ApptFieldGroup>

            <ApptFieldGroup>
              <ApptLabel>Time *</ApptLabel>
              <ApptInput
                type="time"
                value={apptForm.time}
                onChange={e => setApptForm(prev => ({ ...prev, time: e.target.value }))}
              />
            </ApptFieldGroup>

            <ApptFieldGroup>
              <ApptLabel>Reason for Visit</ApptLabel>
              <ApptInput
                placeholder="e.g. Lower back pain"
                value={apptForm.reason}
                onChange={e => setApptForm(prev => ({ ...prev, reason: e.target.value }))}
              />
            </ApptFieldGroup>

            <ApptModalButtons>
              <NavButton onClick={() => setShowApptModal(false)}>Cancel</NavButton>
              <NavButton
                primary
                onClick={handleLogAppointment}
                disabled={apptSaving || !apptForm.doctor_name.trim() || !apptForm.date || !apptForm.time}
                style={(apptSaving || !apptForm.doctor_name.trim() || !apptForm.date || !apptForm.time) ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
              >
                {apptSaving ? 'Saving…' : 'Log Appointment'}
              </NavButton>
            </ApptModalButtons>
          </ApptModalBox>
        </ApptModalOverlay>
      )}
    </MainContent>
  );
};

export default JourneyDetail;
