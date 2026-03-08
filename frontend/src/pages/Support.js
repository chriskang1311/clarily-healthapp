import { api } from '../api';
import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineCheck,
  HiOutlineMail,
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
  gap: 48px;
  animation: ${fadeIn} 0.3s ease;

  @media (max-width: 768px) {
    padding: 24px 20px;
  }
`;

const Title = styled.h1`
  font-size: 36px;
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
  margin: 0 0 4px 0;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #777;
  margin: 0;
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SectionTitle = styled.h2`
  font-size: 22px;
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
  margin: 0;
  padding-bottom: 12px;
  border-bottom: 2px solid ${props => props.theme.colors.primaryLight};
`;

/* ── FAQ Accordion ── */
const AccordionItem = styled.div`
  border: 1px solid #E0E0E0;
  border-radius: ${props => props.theme.borderRadius.medium};
  overflow: hidden;
`;

const AccordionHeader = styled.button`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: ${props => props.open ? props.theme.colors.primaryLight : props.theme.colors.background};
  border: none;
  cursor: pointer;
  text-align: left;
  gap: 12px;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${props => props.theme.colors.primaryLight};
  }
`;

const Question = styled.span`
  font-size: 15px;
  font-weight: ${props => props.open ? '600' : '500'};
  color: ${props => props.theme.colors.primary};
  flex: 1;
`;

const AccordionBody = styled.div`
  padding: 0 20px 16px 20px;
  font-size: 15px;
  line-height: 1.6;
  color: #555;
  background-color: ${props => props.theme.colors.background};
  border-top: 1px solid #E0E0E0;
  padding-top: 14px;
`;

/* ── Contact Form ── */
const FormCard = styled.div`
  background-color: #FAFAFA;
  border: 1px solid #E0E0E0;
  border-radius: ${props => props.theme.borderRadius.large};
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 600px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: ${props => props.theme.colors.primary};
`;

const Input = styled.input`
  padding: 10px 14px;
  border: 1px solid #D0D0D0;
  border-radius: ${props => props.theme.borderRadius.medium};
  font-size: 15px;
  color: #333;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: ${props => props.theme.colors.primary};
  }
`;

const Textarea = styled.textarea`
  padding: 10px 14px;
  border: 1px solid #D0D0D0;
  border-radius: ${props => props.theme.borderRadius.medium};
  font-size: 15px;
  color: #333;
  outline: none;
  resize: vertical;
  min-height: 120px;
  font-family: inherit;
  transition: border-color 0.2s;

  &:focus {
    border-color: ${props => props.theme.colors.primary};
  }
`;

const SubmitButton = styled.button`
  background-color: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.buttonText};
  border: none;
  border-radius: ${props => props.theme.borderRadius.medium};
  padding: 12px 28px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  align-self: flex-start;
  transition: opacity 0.2s, transform 0.1s;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const SuccessBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: #E8F5E9;
  border: 1px solid #A5D6A7;
  border-radius: ${props => props.theme.borderRadius.medium};
  padding: 14px 18px;
  font-size: 15px;
  color: #2E7D32;
  font-weight: 500;
`;

const ErrorText = styled.p`
  color: #E53935;
  font-size: 14px;
  margin: 8px 0 0 0;
`;

/* ── Disclaimer ── */
const DisclaimerBox = styled.div`
  background-color: #FFF8E1;
  border: 1px solid #FFE082;
  border-radius: ${props => props.theme.borderRadius.medium};
  padding: 16px 20px;
  font-size: 14px;
  color: #795548;
  line-height: 1.6;
`;

const DisclaimerTitle = styled.strong`
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
`;

// ─────────────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: 'What is Clarily and how does it work?',
    a: 'Clarily is an AI-powered health assistant that helps you understand your symptoms through a guided conversation. It asks detailed questions about your symptoms, collects relevant medical history, and generates a list of potential diagnoses — similar to an intake interview with a doctor. You can then share the summary with your healthcare provider.',
  },
  {
    q: 'Is the diagnostic information medically accurate?',
    a: 'Clarily uses advanced AI to analyze your symptoms and suggest potential conditions. However, it is not a licensed medical device and should not replace professional medical advice. The results are meant to help you prepare for a doctor\'s visit, not to diagnose or treat any condition.',
  },
  {
    q: 'How is my health information stored?',
    a: 'Your chat history is saved locally in your browser (localStorage) and health journeys are saved in the app. Your conversations are sent to our AI provider to generate responses, but are not permanently stored on external servers beyond what is needed to process your request.',
  },
  {
    q: 'What is a Health Journey?',
    a: 'A Health Journey is automatically created when you confirm a set of potential diagnoses in the chatbot. It tracks your progress through key steps — gathering symptoms, verifying insurance, visiting a doctor, and receiving a diagnosis — so you have a clear record of your healthcare process.',
  },
  {
    q: 'Can I save or share my symptom summary?',
    a: 'Yes! After your chatbot conversation, you can generate a concise doctor-ready symptom summary. This can be downloaded as a text file, printed, copied to clipboard, or emailed directly from the app — making it easy to share with your healthcare provider.',
  },
  {
    q: 'How do I book an appointment through Clarily?',
    a: 'Navigate to the Appointments page using the sidebar. Click "Book Appointment" and fill in your doctor\'s name, preferred date and time, and the reason for your visit. You can link the appointment to an existing health journey for better tracking.',
  },
  {
    q: 'What should I do in a medical emergency?',
    a: 'If you are experiencing a medical emergency, call 911 (or your local emergency number) immediately. Do not use Clarily to seek emergency medical guidance. Clarily is designed for non-urgent symptom exploration only.',
  },
  {
    q: 'How do I delete my data?',
    a: 'You can clear your chat history from the chatbot page using the "Clear" button. Health journeys and appointments can be managed from their respective pages. For complete data removal, clearing your browser\'s localStorage will remove all locally stored data.',
  },
];

const FAQAccordion = () => {
  const [openIndex, setOpenIndex] = useState(null);
  return (
    <>
      {FAQ_ITEMS.map((item, i) => (
        <AccordionItem key={i}>
          <AccordionHeader open={openIndex === i} onClick={() => setOpenIndex(openIndex === i ? null : i)}>
            <Question open={openIndex === i}>{item.q}</Question>
            {openIndex === i ? <HiOutlineChevronUp size={18} /> : <HiOutlineChevronDown size={18} />}
          </AccordionHeader>
          {openIndex === i && <AccordionBody>{item.a}</AccordionBody>}
        </AccordionItem>
      ))}
    </>
  );
};

const EMPTY_FORM = { name: '', email: '', message: '' };

const Support = () => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await api.post('/support/contact', form);
      if (!res.ok) throw new Error('Server error');
      setSubmitted(true);
      setForm(EMPTY_FORM);
    } catch (err) {
      console.error('Error sending support message:', err);
      setSubmitError('Failed to send your message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainContent>
      <div>
        <Title>Support</Title>
        <Subtitle>Find answers to common questions or contact us directly.</Subtitle>
      </div>

      <DisclaimerBox>
        <DisclaimerTitle>Medical Disclaimer</DisclaimerTitle>
        Clarily is an informational tool only and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider with questions about your health. In an emergency, call 911 or your local emergency number immediately.
      </DisclaimerBox>

      <Section>
        <SectionTitle>Frequently Asked Questions</SectionTitle>
        <FAQAccordion />
      </Section>

      <Section>
        <SectionTitle>Contact Us</SectionTitle>
        <FormCard>
          {submitted ? (
            <SuccessBanner>
              <HiOutlineCheck size={20} />
              Thank you! We received your message and will follow up shortly.
            </SuccessBanner>
          ) : (
            <>
              <FormGroup>
                <Label>Your Name</Label>
                <Input
                  placeholder="Alex Johnson"
                  value={form.name}
                  onChange={e => handleChange('name', e.target.value)}
                />
              </FormGroup>
              <FormGroup>
                <Label>Email Address</Label>
                <Input
                  type="email"
                  placeholder="alex@example.com"
                  value={form.email}
                  onChange={e => handleChange('email', e.target.value)}
                />
              </FormGroup>
              <FormGroup>
                <Label>Message</Label>
                <Textarea
                  placeholder="Describe your question or issue..."
                  value={form.message}
                  onChange={e => handleChange('message', e.target.value)}
                />
              </FormGroup>
              <SubmitButton onClick={handleSubmit} disabled={submitting}>
                <HiOutlineMail size={16} />
                {submitting ? 'Sending…' : 'Send Message'}
              </SubmitButton>
              {submitError && <ErrorText>{submitError}</ErrorText>}
            </>
          )}
        </FormCard>
      </Section>
    </MainContent>
  );
};

export default Support;
