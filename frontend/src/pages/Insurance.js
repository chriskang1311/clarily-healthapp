import React, { useState, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';
import styled, { keyframes } from 'styled-components';
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineX,
  HiOutlineCheck,
  HiOutlineCreditCard,
} from 'react-icons/hi';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const slideDown = keyframes`
  from { opacity: 0; transform: translateY(-12px); }
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

const PrimaryButton = styled.button`
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

/* ── Form Panel ── */
const FormPanel = styled.div`
  background-color: #FAFAFA;
  border: 1px solid #E0E0E0;
  border-radius: ${props => props.theme.borderRadius.large};
  padding: 28px;
  animation: ${slideDown} 0.25s ease;
`;

const FormTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: ${props => props.theme.colors.primary};
  margin: 0 0 20px 0;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
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

const Select = styled.select`
  padding: 10px 14px;
  border: 1px solid #D0D0D0;
  border-radius: ${props => props.theme.borderRadius.medium};
  font-size: 15px;
  color: #333;
  background-color: white;
  outline: none;
  cursor: pointer;
  transition: border-color 0.2s;

  &:focus {
    border-color: ${props => props.theme.colors.primary};
  }
`;

const FormActions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;
`;

const SecondaryButton = styled.button`
  background: none;
  border: 1px solid #D0D0D0;
  border-radius: ${props => props.theme.borderRadius.medium};
  padding: 10px 20px;
  font-size: 15px;
  font-weight: 500;
  color: #555;
  cursor: pointer;
  transition: background-color 0.15s;

  &:hover {
    background-color: #F0F0F0;
  }
`;

const SaveButton = styled(PrimaryButton)`
  padding: 10px 24px;
`;

/* ── Insurance Cards ── */
const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
`;

const InsuranceCard = styled.div`
  background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, #4A7C2F 100%);
  border-radius: ${props => props.theme.borderRadius.large};
  padding: 28px;
  color: white;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(45, 80, 22, 0.25);

  &::after {
    content: '';
    position: absolute;
    top: -40px;
    right: -40px;
    width: 160px;
    height: 160px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.06);
  }
`;

const CardTypeBadge = styled.span`
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 3px 10px;
  border-radius: 99px;
  display: inline-block;
  margin-bottom: 16px;
`;

const ProviderName = styled.h2`
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 4px 0;
  color: white;
`;

const PlanName = styled.p`
  font-size: 14px;
  opacity: 0.8;
  margin: 0 0 20px 0;
`;

const CardDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 16px;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DetailLabel = styled.span`
  font-size: 12px;
  opacity: 0.7;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const DetailValue = styled.span`
  font-size: 14px;
  font-weight: 600;
  font-family: 'SF Mono', 'Courier New', monospace;
  letter-spacing: 0.04em;
`;

const CardEditBar = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
  justify-content: flex-end;
`;

const CardActionButton = styled.button`
  background-color: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: ${props => props.theme.borderRadius.small};
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 500;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: background-color 0.15s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.25);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 64px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  border: 1px dashed #D0D0D0;
  border-radius: ${props => props.theme.borderRadius.large};
`;

const EmptyTitle = styled.p`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.colors.primary};
  margin: 0;
`;

const EmptyText = styled.p`
  font-size: 15px;
  color: #999;
  margin: 0;
`;

// ─────────────────────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  provider: '',
  plan_name: '',
  member_id: '',
  group_number: '',
  plan_type: 'Primary',
};

const Insurance = () => {
  const { toast } = useToast();
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchInsurance();
  }, []);

  const fetchInsurance = async () => {
    try {
      const res = await fetch(`${API_URL}/insurance`);
      if (res.ok) {
        const data = await res.json();
        setPlans(data.insurance || []);
      }
    } catch (err) {
      console.error('Error fetching insurance:', err);
      toast.error('Failed to load insurance plans.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!form.provider.trim() || !form.plan_name.trim() || !form.member_id.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        const res = await fetch(`${API_URL}/insurance/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          const data = await res.json();
          setPlans(prev => prev.map(p => p.id === editingId ? data.insurance : p));
        }
      } else {
        const res = await fetch(`${API_URL}/insurance`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          const data = await res.json();
          setPlans(prev => [...prev, data.insurance]);
        }
      }
      setForm(EMPTY_FORM);
      setEditingId(null);
      setShowForm(false);
    } catch (err) {
      console.error('Error saving insurance:', err);
      toast.error('Failed to save insurance plan. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (plan) => {
    setForm({
      provider: plan.provider,
      plan_name: plan.plan_name,
      member_id: plan.member_id,
      group_number: plan.group_number,
      plan_type: plan.plan_type,
    });
    setEditingId(plan.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this insurance plan?')) return;
    try {
      const res = await fetch(`${API_URL}/insurance/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPlans(prev => prev.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error('Error deleting insurance:', err);
      toast.error('Failed to remove insurance plan.');
    }
  };

  return (
    <MainContent>
      <PageHeader>
        <Title>Insurance</Title>
        {!showForm && (
          <PrimaryButton onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY_FORM); }}>
            <HiOutlinePlus size={16} />
            Add Plan
          </PrimaryButton>
        )}
      </PageHeader>

      {showForm && (
        <FormPanel>
          <FormTitle>{editingId ? 'Edit Insurance Plan' : 'Add Insurance Plan'}</FormTitle>
          <FormGrid>
            <FormGroup>
              <Label>Insurance Provider *</Label>
              <Input
                placeholder="e.g. Blue Cross Blue Shield"
                value={form.provider}
                onChange={e => handleChange('provider', e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label>Plan Name *</Label>
              <Input
                placeholder="e.g. PPO Gold Plus"
                value={form.plan_name}
                onChange={e => handleChange('plan_name', e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label>Member ID *</Label>
              <Input
                placeholder="e.g. XYZ123456789"
                value={form.member_id}
                onChange={e => handleChange('member_id', e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label>Group Number</Label>
              <Input
                placeholder="e.g. GRP-98765"
                value={form.group_number}
                onChange={e => handleChange('group_number', e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label>Plan Type</Label>
              <Select value={form.plan_type} onChange={e => handleChange('plan_type', e.target.value)}>
                <option value="Primary">Primary</option>
                <option value="Secondary">Secondary</option>
                <option value="Dental">Dental</option>
                <option value="Vision">Vision</option>
              </Select>
            </FormGroup>
          </FormGrid>
          <FormActions>
            <SaveButton onClick={handleSave} disabled={saving}>
              <HiOutlineCheck size={15} />
              {saving ? 'Saving…' : editingId ? 'Update Plan' : 'Add Plan'}
            </SaveButton>
            <SecondaryButton onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setEditingId(null); }}>
              <HiOutlineX size={15} style={{ marginRight: 4 }} />
              Cancel
            </SecondaryButton>
          </FormActions>
        </FormPanel>
      )}

      {isLoading ? (
        <p style={{ color: '#888' }}>Loading insurance plans...</p>
      ) : plans.length > 0 ? (
        <CardsGrid>
          {plans.map(plan => (
            <InsuranceCard key={plan.id}>
              <CardTypeBadge>{plan.plan_type}</CardTypeBadge>
              <ProviderName>{plan.provider}</ProviderName>
              <PlanName>{plan.plan_name}</PlanName>
              <CardDetails>
                <DetailRow>
                  <DetailLabel>Member ID</DetailLabel>
                  <DetailValue>{plan.member_id}</DetailValue>
                </DetailRow>
                {plan.group_number && (
                  <DetailRow>
                    <DetailLabel>Group #</DetailLabel>
                    <DetailValue>{plan.group_number}</DetailValue>
                  </DetailRow>
                )}
              </CardDetails>
              <CardEditBar>
                <CardActionButton onClick={() => handleEdit(plan)}>
                  <HiOutlinePencil size={13} />
                  Edit
                </CardActionButton>
                <CardActionButton onClick={() => handleDelete(plan.id)}>
                  <HiOutlineTrash size={13} />
                  Remove
                </CardActionButton>
              </CardEditBar>
            </InsuranceCard>
          ))}
        </CardsGrid>
      ) : (
        <EmptyState>
          <HiOutlineCreditCard size={36} color="#CCC" />
          <EmptyTitle>No insurance plans added</EmptyTitle>
          <EmptyText>
            Add your health insurance information so it's ready when you need it during your health journeys.
          </EmptyText>
          <PrimaryButton onClick={() => setShowForm(true)}>
            <HiOutlinePlus size={16} />
            Add Your First Plan
          </PrimaryButton>
        </EmptyState>
      )}
    </MainContent>
  );
};

export default Insurance;
