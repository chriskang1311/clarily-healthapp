import React from 'react';
import styled from 'styled-components';
import { HiOutlineDownload, HiOutlinePrinter, HiOutlineMail, HiOutlineClipboard } from 'react-icons/hi';

const SummaryContainer = styled.div`
  margin-top: 20px;
  margin-bottom: 16px;
  padding: 24px;
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

const Header = styled.div`
  margin-bottom: 16px;
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
  margin: 0;
  font-style: italic;
`;

const SummaryContent = styled.div`
  background-color: ${props => props.theme.colors.background};
  padding: 20px;
  border-radius: ${props => props.theme.borderRadius.medium};
  margin-bottom: 20px;
  white-space: pre-wrap;
  line-height: 1.8;
  color: ${props => props.theme.colors.text};
  font-size: 15px;
  border: 1px solid #E0E0E0;
`;

const DownloadSection = styled.div`
  border-top: 2px solid ${props => props.theme.colors.primary};
  padding-top: 16px;
  margin-top: 16px;
`;

const DownloadPrompt = styled.p`
  font-size: 15px;
  font-weight: 600;
  color: ${props => props.theme.colors.primary};
  margin: 0 0 12px 0;
  text-align: center;
`;

const DownloadButtons = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
`;

const DownloadButton = styled.button`
  padding: 12px 20px;
  border-radius: ${props => props.theme.borderRadius.medium};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid ${props => props.theme.colors.primary};
  background-color: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.primary};
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover:not(:disabled) {
    background-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.buttonText};
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
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const DisclaimerText = styled.p`
  font-size: 12px;
  color: ${props => props.theme.colors.primary};
  margin: 12px 0 0 0;
  padding: 10px;
  background-color: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.borderRadius.small};
  border-left: 3px solid ${props => props.theme.colors.primary};
  font-style: italic;
  line-height: 1.4;
  text-align: center;
`;

const SymptomSummary = ({ summary, onDownload, onPrint, onEmail, onCopy }) => {
  if (!summary) {
    return null;
  }

  return (
    <SummaryContainer>
      <Header>
        <Title>Symptom Summary</Title>
        <Subtitle>Your concise summary to bring to your doctor</Subtitle>
      </Header>
      
      <SummaryContent>
        {summary}
      </SummaryContent>
      
      <DownloadSection>
        <DownloadPrompt>
          Download or share this summary with your healthcare provider
        </DownloadPrompt>
        <DownloadButtons>
          <DownloadButton onClick={onDownload} title="Download as text file">
            <HiOutlineDownload />
            Download
          </DownloadButton>
          <DownloadButton onClick={onPrint} title="Print summary">
            <HiOutlinePrinter />
            Print
          </DownloadButton>
          <DownloadButton onClick={onEmail} title="Email summary">
            <HiOutlineMail />
            Email
          </DownloadButton>
          <DownloadButton onClick={onCopy} title="Copy to clipboard">
            <HiOutlineClipboard />
            Copy
          </DownloadButton>
        </DownloadButtons>
        <DisclaimerText>
          This summary is for informational purposes only and should not replace professional medical consultation.
        </DisclaimerText>
      </DownloadSection>
    </SummaryContainer>
  );
};

export default SymptomSummary;

