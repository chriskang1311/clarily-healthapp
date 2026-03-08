import { api } from '../api';
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import styled, { keyframes } from 'styled-components';
import {
  HiOutlinePlus,
  HiOutlineCalendar,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineX,
  HiOutlineCheck,
} from 'react-icons/hi';


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

const FormGroupFull = styled(FormGroup)`
  grid-column: 1 / -1;
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
  min-height: 80px;
  font-family: inherit;
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

/* ── Section label ── */
const SectionLabel = styled.h2`
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #888;
  margin: 0;
`;

const SectionGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

/* ── Appointment Cards ── */
const AppointmentCard = styled.div`
  background-color: ${props => props.theme.colors.background};
  border: 1px solid #E0E0E0;
  border-left: 5px solid ${props =>
    props.status === 'cancelled' ? '#BDBDBD' :
    props.isPast ? '#9E9E9E' :
    props.theme.colors.primary};
  border-radius: ${props => props.theme.borderRadius.large};
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  opacity: ${props => props.status === 'cancelled' ? 0.6 : 1};
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
  }
`;

const AppointmentInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;

const AppointmentDoctor = styled.h3`
  font-size: 17px;
  font-weight: 600;
  color: ${props => props.theme.colors.primary};
  margin: 0;
`;

const AppointmentMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
  flex-wrap: wrap;
`;

const Dot = styled.span`
  color: #CCC;
`;

const AppointmentReason = styled.p`
  font-size: 14px;
  color: #777;
  margin: 4px 0 0 0;
  line-height: 1.4;
`;

const StatusBadge = styled.span`
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  padding: 2px 10px;
  border-radius: 99px;
  background-color: ${props =>
    props.status === 'upcoming' ? '#E8F5E9' :
    props.status === 'completed' ? '#E3F2FD' :
    '#F5F5F5'};
  color: ${props =>
    props.status === 'upcoming' ? '#2E7D32' :
    props.status === 'completed' ? '#1565C0' :
    '#757575'};
`;

const CardButtons = styled.div`
  display: flex;
  gap: 6px;
  flex-shrink: 0;
`;

const SmallIconButton = styled.button`
  background: none;
  border: 1px solid #E0E0E0;
  border-radius: ${props => props.theme.borderRadius.small};
  padding: 6px;
  cursor: pointer;
  color: ${props => props.danger ? '#E53935' : props.theme.colors.primary};
  display: flex;
  align-items: center;
  transition: background-color 0.15s;

  &:hover {
    background-color: ${props => props.danger ? '#FFEBEE' : props.theme.colors.primaryLight};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px 24px;
  color: #888;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  border: 1px dashed #D0D0D0;
  border-radius: ${props => props.theme.borderRadius.large};
`;

const EmptyText = styled.p`
  font-size: 15px;
  color: #999;
  margin: 0;
`;

// ─────────────────────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  doctor_name: '',
  date: '',
  time: '',
  reason: '',
};

const Appointments = () => {
  const { toast } = useToast();
  const location = useLocation();
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [successId, setSuccessId] = useState(null);

  useEffect(() => {
    fetchAppointments();
    // Pre-fill form if navigated from JourneyDetail
    const state = location.state;
    if (state?.reason || state?.journeyId) {
      setForm(prev => ({
        ...prev,
        reason: state.reason || '',
        journey_id: state.journeyId || '',
      }));
      setShowForm(true);
    }
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments');
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments || []);
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
      toast.error('Failed to load appointments.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!form.doctor_name.trim() || !form.date || !form.time) return;
    setSaving(true);
    try {
      if (editingId) {
        const res = await api.put(`/appointments/${editingId}`, form);
        if (res.ok) {
          const data = await res.json();
          setAppointments(prev => prev.map(a => a.id === editingId ? data.appointment : a));
          flashSuccess(editingId);
        }
      } else {
        const res = await api.post('/appointments', { ...form, created_at: new Date().toISOString() });
        if (res.ok) {
          const data = await res.json();
          setAppointments(prev => [...prev, data.appointment]);
          flashSuccess(data.appointment.id);
        }
      }
      setForm(EMPTY_FORM);
      setEditingId(null);
      setShowForm(false);
    } catch (err) {
      console.error('Error saving appointment:', err);
      toast.error('Failed to save appointment. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (appt) => {
    setForm({
      doctor_name: appt.doctor_name,
      date: appt.date,
      time: appt.time,
      reason: appt.reason,
    });
    setEditingId(appt.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      const res = await api.delete('/appointments/${id}');
      if (res.ok) {
        setAppointments(prev => prev.filter(a => a.id !== id));
      }
    } catch (err) {
      console.error('Error deleting appointment:', err);
      toast.error('Failed to cancel appointment.');
    }
  };

  const flashSuccess = (id) => {
    setSuccessId(id);
    setTimeout(() => setSuccessId(null), 2000);
  };

  const today = new Date().toISOString().split('T')[0];
  const upcoming = appointments.filter(a => a.date >= today && a.status !== 'cancelled');
  const past = appointments.filter(a => a.date < today || a.status === 'cancelled');

  return (
    <MainContent>
      <PageHeader>
        <Title>Appointments</Title>
        {!showForm && (
          <PrimaryButton onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY_FORM); }}>
            <HiOutlinePlus size={16} />
            Book Appointment
          </PrimaryButton>
        )}
      </PageHeader>

      {showForm && (
        <FormPanel>
          <FormTitle>{editingId ? 'Edit Appointment' : 'Book New Appointment'}</FormTitle>
          <FormGrid>
            <FormGroup>
              <Label>Doctor / Provider *</Label>
              <Input
                placeholder="e.g. Dr. Sarah Kim"
                value={form.doctor_name}
                onChange={e => handleChange('doctor_name', e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label>Date *</Label>
              <Input
                type="date"
                value={form.date}
                onChange={e => handleChange('date', e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label>Time *</Label>
              <Input
                type="time"
                value={form.time}
                onChange={e => handleChange('time', e.target.value)}
              />
            </FormGroup>
            <FormGroupFull>
              <Label>Reason for Visit</Label>
              <Textarea
                placeholder="Briefly describe the reason for your appointment..."
                value={form.reason}
                onChange={e => handleChange('reason', e.target.value)}
              />
            </FormGroupFull>
          </FormGrid>
          <FormActions>
            <SaveButton onClick={handleSave} disabled={saving}>
              <HiOutlineCheck size={15} />
              {saving ? 'Saving…' : editingId ? 'Update' : 'Book Appointment'}
            </SaveButton>
            <SecondaryButton onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setEditingId(null); }}>
              <HiOutlineX size={15} style={{ marginRight: 4 }} />
              Cancel
            </SecondaryButton>
          </FormActions>
        </FormPanel>
      )}

      {isLoading ? (
        <p style={{ color: '#888' }}>Loading appointments...</p>
      ) : (
        <>
          <SectionGroup>
            <SectionLabel>Upcoming</SectionLabel>
            {upcoming.length > 0 ? upcoming.map(appt => (
              <AppointmentCard key={appt.id} status={appt.status}>
                <AppointmentInfo>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <AppointmentDoctor>{appt.doctor_name}</AppointmentDoctor>
                    <StatusBadge status={successId === appt.id ? 'completed' : appt.status}>
                      {successId === appt.id ? 'Saved!' : appt.status}
                    </StatusBadge>
                  </div>
                  <AppointmentMeta>
                    <HiOutlineCalendar size={14} />
                    {formatDate(appt.date)}
                    <Dot>·</Dot>
                    {formatTime(appt.time)}
                  </AppointmentMeta>
                  {appt.reason && <AppointmentReason>{appt.reason}</AppointmentReason>}
                </AppointmentInfo>
                <CardButtons>
                  <SmallIconButton onClick={() => handleEdit(appt)} title="Edit">
                    <HiOutlinePencil size={16} />
                  </SmallIconButton>
                  <SmallIconButton danger onClick={() => handleDelete(appt.id)} title="Cancel">
                    <HiOutlineTrash size={16} />
                  </SmallIconButton>
                </CardButtons>
              </AppointmentCard>
            )) : (
              <EmptyState>
                <HiOutlineCalendar size={32} color="#CCC" />
                <EmptyText>No upcoming appointments. Book one above!</EmptyText>
              </EmptyState>
            )}
          </SectionGroup>

          {past.length > 0 && (
            <SectionGroup>
              <SectionLabel>Past &amp; Cancelled</SectionLabel>
              {past.map(appt => (
                <AppointmentCard key={appt.id} status={appt.status} isPast>
                  <AppointmentInfo>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <AppointmentDoctor>{appt.doctor_name}</AppointmentDoctor>
                      <StatusBadge status={appt.status}>{appt.status}</StatusBadge>
                    </div>
                    <AppointmentMeta>
                      <HiOutlineCalendar size={14} />
                      {formatDate(appt.date)}
                      <Dot>·</Dot>
                      {formatTime(appt.time)}
                    </AppointmentMeta>
                    {appt.reason && <AppointmentReason>{appt.reason}</AppointmentReason>}
                  </AppointmentInfo>
                  <CardButtons>
                    <SmallIconButton danger onClick={() => handleDelete(appt.id)} title="Remove">
                      <HiOutlineTrash size={16} />
                    </SmallIconButton>
                  </CardButtons>
                </AppointmentCard>
              ))}
            </SectionGroup>
          )}
        </>
      )}
    </MainContent>
  );
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const [y, m, d] = dateStr.split('-');
    return new Date(y, m - 1, d).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  try {
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const display = ((hour % 12) || 12);
    return `${display}:${m} ${ampm}`;
  } catch {
    return timeStr;
  }
}

export default Appointments;
