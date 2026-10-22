import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  MessageSquare, Users, Bell, ChevronRight,
  Search, Plus, MapPin, Target, Zap, Briefcase, 
  Award, Trophy, Calendar, CheckCircle2, Star, Sparkles, Building2, Link as LinkIcon, Clock, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { communityAPI } from '../../services/api.service';
import { useQuery } from '@tanstack/react-query';

function MessageFacultyModal({ onClose }) {
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [recipients, setRecipients] = useState([]);
  const [receiverId, setReceiverId] = useState('');

  useEffect(() => {
    communityAPI.getMessageRecipients()
      .then(res => {
        setRecipients(res.data);
        if (res.data.length > 0) setReceiverId(res.data[0].id);
      })
      .catch(console.error);
  }, []);

  const handleSend = async () => {
    if(!msg.trim() || !receiverId) return;
    setSending(true);
    try {
      await communityAPI.sendMessage({ receiver_id: parseInt(receiverId), content: msg });
      toast.success('Message sent successfully!');
      onClose();
    } catch (e) {
      console.error(e);
      toast.error('Failed to send message');
      setSending(false);
    }
  };
  const modalContent = (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflowY: 'auto' }}>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }} onClick={onClose} />
      <div style={{ position: 'relative', width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto', background: 'var(--surface-0)', borderRadius: 24, padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', boxShadow: '0 24px 60px rgba(0,0,0,0.3)', border: '1px solid var(--surface-3)' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>New Message</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Send a direct message.</p>
        </div>
        
        {recipients.length > 0 ? (
          <select 
            value={receiverId} 
            onChange={e => setReceiverId(e.target.value)}
            style={{ width: '100%', padding: '0.875rem', background: 'var(--surface-1)', color: 'var(--text-primary)', border: '1px solid var(--surface-3)', borderRadius: 12, outline: 'none' }}
          >
            {recipients.map(r => (
              <option key={r.id} value={r.id}>{r.name} ({r.role})</option>
            ))}
          </select>
        ) : (
          <div style={{ padding: '0.875rem', background: 'var(--surface-1)', border: '1px solid var(--surface-3)', borderRadius: 12, color: 'var(--text-muted)' }}>
            Loading recipients...
          </div>
        )}

        <textarea 
          autoFocus
          value={msg}
          onChange={e => setMsg(e.target.value)}
          placeholder="Type your message here..."
          style={{ width: '100%', minHeight: 120, padding: '1rem', background: 'var(--surface-1)', color: 'var(--text-primary)', border: '1px solid var(--surface-3)', borderRadius: 12, resize: 'vertical', outline: 'none' }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button onClick={onClose} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: 'var(--surface-2)', cursor: 'pointer', fontWeight: 800 }}>Cancel</button>
          <button disabled={sending || !msg.trim() || !receiverId} onClick={handleSend} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: 'var(--brand-500)', color: 'white', cursor: 'pointer', fontWeight: 800 }}>{sending ? 'Sending...' : 'Send Message'}</button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}

function BookOfficeHoursModal({ onClose }) {
  const [topic, setTopic] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch('/api/academic/teachers', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
      .then(res => res.json())
      .then(data => {
        setTeachers(data);
        if(data.length > 0) setTeacherId(data[0].id);
      }).catch(console.error);
  }, []);

  const handleBook = async () => {
    if(!topic.trim() || !date || !time || !teacherId) return;
    setSending(true);
    try {
      await communityAPI.bookOfficeHour({ teacher_id: parseInt(teacherId), topic, date, time });
      toast.success('Office hours booked successfully!');
      onClose();
    } catch (e) {
      console.error(e);
      toast.error('Failed to book office hours');
      setSending(false);
    }
  };

  const modalContent = (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflowY: 'auto' }}>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }} onClick={onClose} />
      <div style={{ position: 'relative', width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto', background: 'var(--surface-0)', borderRadius: 24, padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', boxShadow: '0 24px 60px rgba(0,0,0,0.3)', border: '1px solid var(--surface-3)' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>Book Office Hours</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Schedule a 1-on-1 session with your teacher.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {teachers.length > 0 ? (
            <select 
              value={teacherId} 
              onChange={e => setTeacherId(e.target.value)}
              style={{ padding: '10px', borderRadius: 8, border: '1px solid var(--surface-3)', background: 'var(--surface-1)', color: 'var(--text-primary)', outline: 'none' }}
            >
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.department})</option>
              ))}
            </select>
          ) : (
            <div style={{ padding: '10px', borderRadius: 8, border: '1px solid var(--surface-3)', background: 'var(--surface-1)', color: 'var(--text-muted)' }}>Loading teachers...</div>
          )}
          <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="Topic (e.g., Assignment 2 Help)" style={{ padding: '10px', borderRadius: 8, border: '1px solid var(--surface-3)', background: 'var(--surface-1)', color: 'var(--text-primary)', outline: 'none' }} />
          <div style={{ display: 'flex', gap: '1rem' }}>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid var(--surface-3)', background: 'var(--surface-1)', color: 'var(--text-primary)', outline: 'none' }} />
            <input type="time" value={time} onChange={e => setTime(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid var(--surface-3)', background: 'var(--surface-1)', color: 'var(--text-primary)', outline: 'none' }} />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button onClick={onClose} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: 'var(--surface-2)', cursor: 'pointer', fontWeight: 800 }}>Cancel</button>
          <button disabled={sending || !topic.trim() || !date || !time || !teacherId} onClick={handleBook} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: 'var(--brand-500)', color: 'white', cursor: 'pointer', fontWeight: 800 }}>{sending ? 'Booking...' : 'Book Slot'}</button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}

function RequestMentorshipModal({ alumni, onClose }) {
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if(!topic.trim() || !message.trim()) return;
    setSending(true);
    try {
      await communityAPI.requestMentorship({ alumni_id: alumni.id || 1, topic, message });
      toast.success('Mentorship request sent successfully!');
      onClose();
    } catch (e) {
      console.error(e);
      toast.error('Failed to send mentorship request');
      setSending(false);
    }
  };

  const modalContent = (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflowY: 'auto' }}>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }} onClick={onClose} />
      <div style={{ position: 'relative', width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto', background: 'var(--surface-0)', borderRadius: 24, padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', boxShadow: '0 24px 60px rgba(0,0,0,0.3)', border: '1px solid var(--surface-3)' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>Request Mentorship</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Connect with {alumni.name} from {alumni.company}.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="Topic (e.g., Mock Interview, Referral)" style={{ padding: '10px', borderRadius: 8, border: '1px solid var(--surface-3)', background: 'var(--surface-1)', color: 'var(--text-primary)', outline: 'none' }} />
          <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Why do you want to connect?" style={{ width: '100%', minHeight: 120, padding: '1rem', background: 'var(--surface-1)', color: 'var(--text-primary)', border: '1px solid var(--surface-3)', borderRadius: 12, resize: 'vertical', outline: 'none' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button onClick={onClose} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: 'var(--surface-2)', cursor: 'pointer', fontWeight: 800 }}>Cancel</button>
          <button disabled={sending || !topic.trim() || !message.trim()} onClick={handleSend} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: 'var(--brand-500)', color: 'white', cursor: 'pointer', fontWeight: 800 }}>{sending ? 'Sending...' : 'Send Request'}</button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}

function PlaceBountyModal({ onClose, refetch }) {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [reward, setReward] = useState(50);
  const [sending, setSending] = useState(false);

  const handlePlace = async () => {
    if (!title.trim() || !body.trim() || !subject.trim()) {
      toast.error('Please enter the subject, question title, and description.');
      return;
    }
    const parsedReward = parseInt(reward, 10);
    if (isNaN(parsedReward) || parsedReward <= 0) {
      toast.error('Please enter a valid reward amount (min 10 Rep).');
      return;
    }

    setSending(true);
    try {
      await communityAPI.createBounty({
        title: title.trim(),
        subject: subject.trim(),
        body: body.trim(),
        reward_amount: parsedReward,
        tags: subject.trim()
      });
      toast.success('🎉 Bounty placed successfully!');
      if (refetch) await refetch();
      onClose();
    } catch (e) {
      console.error(e);
      toast.error(e.response?.data?.detail || 'Failed to place bounty. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const modalContent = (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', overflowY: 'auto' }}>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }} onClick={onClose} />
      <div style={{ position: 'relative', width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', background: 'var(--surface-0)', borderRadius: 24, padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', boxShadow: '0 24px 60px rgba(0,0,0,0.3)', border: '1px solid var(--surface-3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(8,145,178,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-500)' }}>
                <Award size={18} />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>Place a Bounty</h2>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Offer reputation points for peers to solve your doubt with code or explanations.</p>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: 6 }}>Topic / Subject</label>
            <input 
              value={subject} 
              onChange={e => setSubject(e.target.value)} 
              placeholder="e.g. DBMS, React, Algorithms, Operating Systems" 
              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--surface-3)', background: 'var(--surface-1)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.875rem' }} 
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: 6 }}>Doubt / Question Title</label>
            <input 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="e.g. How does B+ Tree indexing balance nodes on deletion?" 
              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--surface-3)', background: 'var(--surface-1)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.875rem' }} 
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: 6 }}>Detailed Description & Context</label>
            <textarea 
              value={body} 
              onChange={e => setBody(e.target.value)} 
              placeholder="Describe your doubt in detail, what you've tried, and any code snippets..." 
              style={{ width: '100%', minHeight: 120, padding: '12px 14px', background: 'var(--surface-1)', color: 'var(--text-primary)', border: '1px solid var(--surface-3)', borderRadius: 12, resize: 'vertical', outline: 'none', fontSize: '0.875rem', lineHeight: 1.5 }} 
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--surface-1)', borderRadius: 12, border: '1px solid var(--surface-3)' }}>
            <div>
              <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)', display: 'block' }}>Reward Bounty</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Reputation points awarded to the accepted solution</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input 
                type="number" 
                min={10} 
                step={10} 
                value={reward} 
                onChange={e => setReward(e.target.value)} 
                style={{ width: 85, padding: '6px 10px', borderRadius: 8, border: '1px solid var(--surface-3)', background: 'var(--surface-0)', color: 'var(--text-primary)', fontWeight: 800, outline: 'none', textAlign: 'center' }} 
              />
              <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#d97706' }}>Rep</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button 
            type="button" 
            onClick={onClose} 
            style={{ padding: '10px 18px', borderRadius: 10, border: '1px solid var(--surface-3)', background: 'var(--surface-1)', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem' }}
          >
            Cancel
          </button>
          <button 
            type="button" 
            disabled={sending || !title.trim() || !body.trim() || !subject.trim()} 
            onClick={handlePlace} 
            style={{ padding: '10px 22px', borderRadius: 10, border: 'none', background: 'var(--brand-500)', color: 'white', cursor: sending ? 'not-allowed' : 'pointer', fontWeight: 800, fontSize: '0.875rem', boxShadow: '0 4px 12px rgba(8,145,178,0.25)', opacity: (sending || !title.trim() || !body.trim() || !subject.trim()) ? 0.6 : 1 }}
          >
            {sending ? 'Placing Bounty...' : 'Publish Bounty'}
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}

function BountyBoardTab() {
  const [showPlaceBounty, setShowPlaceBounty] = useState(false);

  const { data: bounties = [], refetch: refetchBounties } = useQuery({
    queryKey: ['communityBounties'],
    queryFn: () => communityAPI.getBounties().then(res => res.data)
  });

  const { data: leaderboard = [] } = useQuery({
    queryKey: ['communityLeaderboard'],
    queryFn: () => communityAPI.getLeaderboard().then(res => res.data)
  });
  
  const myRank = leaderboard.length > 0 ? leaderboard[0] : null;
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '3rem', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)' }}>Bounty Exchange</h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 4 }}>Help peers, solve doubts, and earn Campus Reputation.</p>
            </div>
            <button onClick={() => setShowPlaceBounty(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--brand-500)', color: 'white', border: 'none', padding: '9px 18px', borderRadius: 999, fontSize: '0.8125rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(8,145,178,0.2)' }}>
              <Plus size={16} /> Place Bounty
            </button>
          </div>
          
          {bounties.length === 0 ? (
            <div style={{ padding: '3.5rem 2rem', textAlign: 'center', background: 'var(--surface-0)', border: '1px dashed var(--surface-3)', borderRadius: 20 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(8,145,178,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'var(--brand-500)' }}>
                <Award size={24} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: 6 }}>No Active Bounties Yet</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: 400, margin: '0 auto 1.5rem', lineHeight: 1.5 }}>
                Post the first doubt bounty and offer reputation points to receive peer solutions quickly!
              </p>
              <button onClick={() => setShowPlaceBounty(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--brand-500)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 999, fontSize: '0.8125rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(8,145,178,0.2)' }}>
                <Plus size={16} /> Place Bounty
              </button>
            </div>
          ) : (
            bounties.map(b => (
              <div key={b.id} style={{ padding: '1.5rem', background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 16, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand-300)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--surface-3)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--brand-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-600)', fontWeight: 900, fontSize: '1.125rem', flexShrink: 0 }}>{b.avatar}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {b.solved && <span style={{ fontSize: '0.625rem', fontWeight: 900, color: '#10b981', background: '#f0fdf4', padding: '2px 8px', borderRadius: 999, textTransform: 'uppercase' }}>✓ Solved</span>}
                        <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-secondary)', background: 'var(--surface-2)', padding: '2px 8px', borderRadius: 999 }}>{b.subject}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fffbeb', border: '1px solid #fde68a', padding: '4px 10px', borderRadius: 999 }}>
                        <Award size={14} color="#f59e0b" />
                        <span style={{ fontSize: '0.8125rem', fontWeight: 900, color: '#d97706' }}>{b.bounty} Rep</span>
                      </div>
                    </div>
                    <h3 style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.0625rem', lineHeight: 1.3, marginBottom: '0.5rem' }}>{b.title}</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>{b.body}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Posted by {b.author} · {b.time}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-600)', display: 'flex', alignItems: 'center', gap: 4 }}><MessageSquare size={14} /> {b.replies} Solutions</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right: Leaderboard */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '2rem' }}>
          <div style={{ background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 20, padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.5rem' }}>
              <Trophy size={20} color="#f59e0b" />
              <h3 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)' }}>Top Contributors</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {leaderboard.map(l => (
                <div key={l.rank} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 900, color: 'var(--text-muted)', width: 16 }}>#{l.rank}</span>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${l.color}15`, border: `1px solid ${l.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: l.color, fontWeight: 900, fontSize: '0.9375rem', flexShrink: 0 }}>{l.avatar}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>{l.name}</p>
                    <p style={{ fontSize: '0.6875rem', color: l.color, fontWeight: 700 }}>{l.badge}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--surface-1)', padding: '2px 8px', borderRadius: 6 }}>
                    <Award size={12} color="#f59e0b" />
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)' }}>{l.rep}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'var(--brand-50)', border: '1px solid var(--brand-100)', borderRadius: 20, padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--brand-500)', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={20} color="white" />
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--brand-700)', marginBottom: '0.5rem' }}>Your Reputation</h3>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--brand-900)', lineHeight: 1, marginBottom: '0.5rem' }}>{myRank ? myRank.rep : 0}</h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--brand-600)', lineHeight: 1.5 }}>Rank #{myRank ? myRank.rank : '-'} • Earn more Rep to unlock badges.</p>
          </div>
        </div>
      </div>

      {showPlaceBounty && (
        <PlaceBountyModal 
          onClose={() => setShowPlaceBounty(false)} 
          refetch={refetchBounties} 
        />
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Tab: Synapse Matchmaking
// ─────────────────────────────────────────────────────────────
function MatchmakingTab() {
  const { data: synapseMatches = [] } = useQuery({
    queryKey: ['synapseMatches'],
    queryFn: () => communityAPI.getSynapseMatches().then(res => res.data)
  });
  
  const { data: teamRequests = [] } = useQuery({
    queryKey: ['communityTeamRequests'],
    queryFn: () => communityAPI.getTeamRequests().then(res => res.data)
  });
  
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '3rem', alignItems: 'start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        
        {/* Cognitive Matches */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--brand-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={16} color="white" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)' }}>Synapse Matches</h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>AI-suggested study partners based on your Cognitive Profile.</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {synapseMatches.map(m => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.25rem', background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 16 }}>
                
                {/* Match Score */}
                <div style={{ position: 'relative', width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="60" height="60" viewBox="0 0 36 36" style={{ position: 'absolute' }}>
                    <path stroke="var(--surface-3)" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path stroke="#10b981" strokeWidth="3" strokeDasharray={`${m.score}, 100`} fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" style={{ strokeLinecap: 'round' }} />
                  </svg>
                  <span style={{ fontSize: '0.875rem', fontWeight: 900, color: 'var(--text-primary)' }}>{m.score}%</span>
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{m.name}</h3>
                    <button style={{ background: 'var(--brand-50)', color: 'var(--brand-600)', border: '1px solid var(--brand-100)', padding: '6px 16px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}>Connect</button>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Strong In:</span>
                      {m.strong.map(s => <span key={s} style={{ fontSize: '0.6875rem', fontWeight: 700, background: '#f0fdf4', color: '#16a34a', padding: '2px 6px', borderRadius: 4 }}>{s}</span>)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Weak In:</span>
                      {m.weak.map(w => <span key={w} style={{ fontSize: '0.6875rem', fontWeight: 700, background: '#fef2f2', color: '#ef4444', padding: '2px 6px', borderRadius: 4 }}>{w}</span>)}
                    </div>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Sparkles size={14} color="#f59e0b" /> {m.reason}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Project Teams */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)' }}>Project & Hackathon Teams</h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Find teammates for upcoming competitions and final year projects.</p>
            </div>
            <button style={{ background: 'var(--surface-2)', border: 'none', color: 'var(--text-primary)', padding: '8px 16px', borderRadius: 8, fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}>Post Request</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {teamRequests.map(t => (
              <div key={t.id} style={{ background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 16, padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.625rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--brand-600)', background: 'var(--brand-50)', padding: '4px 8px', borderRadius: 6 }}>{t.role}</span>
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem', lineHeight: 1.4 }}>{t.project}</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>By {t.by} • Closes {t.deadline}</p>
                
                <p style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Looking For:</p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                  {t.lookingFor.map(s => <span key={s} style={{ fontSize: '0.6875rem', fontWeight: 700, background: 'var(--surface-1)', color: 'var(--text-secondary)', padding: '4px 8px', borderRadius: 4, border: '1px solid var(--surface-3)' }}>{s}</span>)}
                </div>
                
                <button style={{ width: '100%', background: 'var(--text-primary)', color: 'white', border: 'none', padding: '10px 0', borderRadius: 8, fontSize: '0.875rem', fontWeight: 800, cursor: 'pointer' }}>Apply to Team</button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Right Sidebar: Active Study Groups */}
      <div style={{ background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 20, padding: '1.5rem', position: 'sticky', top: '2rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Casual Study Groups</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { name: 'DS Night Owls', members: 12, mode: 'Online' },
            { name: 'DBMS Lab Squad', members: 5, mode: 'Library' }
          ].map(g => (
            <div key={g.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid var(--surface-2)' }}>
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>{g.name}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{g.members} members • {g.mode}</p>
              </div>
              <button style={{ background: 'var(--surface-1)', border: 'none', padding: '6px 12px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', cursor: 'pointer' }}>Join</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Tab: Campus Live
// ─────────────────────────────────────────────────────────────
function CampusLiveTab() {
  const [rsvps, setRsvps] = useState({});

  const { data: events = [] } = useQuery({
    queryKey: ['communityEvents'],
    queryFn: () => communityAPI.getEvents().then(res => res.data)
  });
  
  const { data: clubs = [] } = useQuery({
    queryKey: ['communityClubs'],
    queryFn: () => communityAPI.getClubs().then(res => res.data)
  });

  const handleRsvp = (id) => {
    setRsvps(prev => ({ ...prev, [id]: !prev[id] }));
  };
  
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '3rem', alignItems: 'start' }}>
      
      {/* Events Feed */}
      <div>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Upcoming Events</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {events.map(e => (
            <div key={e.id} style={{ display: 'flex', background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ width: 100, background: 'var(--brand-50)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid var(--brand-100)', flexShrink: 0, padding: '1rem' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--brand-600)', textTransform: 'uppercase' }}>{e.date.split(' ')[0]}</span>
                <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--brand-900)', lineHeight: 1, margin: '4px 0' }}>{e.date.split(' ')[1].replace(',', '')}</span>
              </div>
              <div style={{ padding: '1.5rem', flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.625rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', background: 'var(--surface-2)', padding: '4px 8px', borderRadius: 4, marginBottom: '0.5rem', display: 'inline-block' }}>{e.type}</span>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{e.title}</h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>By {e.org}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.75rem' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={14} /> {e.time}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={14} /> {e.venue}</p>
                  </div>
                </div>
                <button onClick={() => handleRsvp(e.id)} style={{ background: rsvps[e.id] ? '#f0fdf4' : 'var(--brand-500)', color: rsvps[e.id] ? '#10b981' : 'white', border: rsvps[e.id] ? '1px solid #bbf7d0' : 'none', padding: '10px 24px', borderRadius: 999, fontSize: '0.875rem', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {rsvps[e.id] ? <><CheckCircle2 size={16} /> RSVP'd</> : 'RSVP Now'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Clubs & Live Occupancy */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        


        {/* Club Directory */}
        <div style={{ background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 20, padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Club Directory</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {clubs.map(c => (
              <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--surface-2)' }}>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 2 }}>{c.name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.members} Members</p>
                </div>
                <button style={{ background: c.active ? 'var(--brand-500)' : 'var(--surface-1)', color: c.active ? 'white' : 'var(--text-secondary)', border: 'none', padding: '6px 14px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                  {c.active ? 'Apply' : 'View'}
                </button>
              </div>
            ))}
          </div>
          <button style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', background: 'transparent', border: '1.5px dashed var(--surface-3)', color: 'var(--text-secondary)', borderRadius: 12, fontWeight: 800, fontSize: '0.8125rem', cursor: 'pointer' }}>View All 42 Clubs</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Tab: Alumni Network
// ─────────────────────────────────────────────────────────────
function AlumniTab() {
  const [mentorshipModal, setMentorshipModal] = useState(null);
  
  const { data: alumni = [] } = useQuery({
    queryKey: ['communityAlumni'],
    queryFn: () => communityAPI.getAlumni().then(res => res.data)
  });
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: 900 }}>
      
      <div style={{ background: 'var(--brand-50)', border: '1px solid var(--brand-100)', borderRadius: 20, padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--brand-900)', marginBottom: '0.5rem' }}>Lumina Alumni Network</h2>
          <p style={{ fontSize: '0.9375rem', color: 'var(--brand-700)', maxWidth: 400, lineHeight: 1.5 }}>Connect with verified alumni in top tech companies for mentorship, mock interviews, and internal referrals.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ background: 'white', padding: '1rem 1.5rem', borderRadius: 12, border: '1px solid var(--brand-100)', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--brand-600)' }}>1.2k+</h3>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Verified Alumni</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input placeholder="Search by company, role, or name..." style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 2.75rem', background: 'var(--surface-0)', border: '1.5px solid var(--surface-3)', borderRadius: 12, color: 'var(--text-primary)', fontSize: '0.9375rem', outline: 'none' }} onFocus={e => e.target.style.borderColor = 'var(--brand-500)'} onBlur={e => e.target.style.borderColor = 'var(--surface-3)'} />
        </div>
        <select style={{ padding: '0.875rem 1rem', background: 'var(--surface-0)', border: '1.5px solid var(--surface-3)', borderRadius: 12, color: 'var(--text-primary)', fontSize: '0.9375rem', fontWeight: 700, outline: 'none', cursor: 'pointer' }}>
          <option>All Companies</option>
          <option>MAANG</option>
          <option>Startups</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {alumni.map(a => (
          <div key={a.id} style={{ background: 'var(--surface-0)', border: '1px solid var(--surface-3)', borderRadius: 16, padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'var(--brand-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '1.25rem' }}>{a.name[0]}</div>
              <div>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 900, color: 'var(--text-primary)' }}>{a.name}</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Class of {a.batch}</p>
              </div>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}><Building2 size={14} /> {a.company}</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}><Briefcase size={14} /> {a.role}</p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: '1.5rem', flex: 1 }}>
              {a.offers.map(o => (
                <span key={o} style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--brand-700)', background: 'var(--brand-50)', border: '1px solid var(--brand-100)', padding: '4px 10px', borderRadius: 999 }}>{o}</span>
              ))}
            </div>

            <button onClick={() => setMentorshipModal(a)} style={{ width: '100%', background: 'var(--surface-1)', color: 'var(--text-primary)', border: '1px solid var(--surface-3)', padding: '10px 0', borderRadius: 10, fontSize: '0.875rem', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = 'var(--text-primary)'; e.currentTarget.style.color = 'white'; }} onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-1)'; e.currentTarget.style.color = 'var(--text-primary)'; }}>
              Request Connect
            </button>
          </div>
        ))}
      </div>

      {mentorshipModal && <RequestMentorshipModal alumni={mentorshipModal} onClose={() => setMentorshipModal(null)} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Hub
// ─────────────────────────────────────────────────────────────
export default function StudentCommunityHub() {
  const [activeTab, setActiveTab] = useState('bounty');
  const [showMsgModal, setShowMsgModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const tabs = [
    { id: 'bounty',  label: 'Bounty Board',       icon: Award },
    { id: 'synapse', label: 'Synapse Match',      icon: Zap },
    { id: 'campus',  label: 'Campus Live',        icon: Calendar },
    { id: 'alumni',  label: 'Alumni Network',     icon: Briefcase },
  ];

  return (
    <div style={{ position: 'relative', minHeight: '100%', paddingBottom: '3rem', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, right: '5%', width: '25vw', height: '25vw', background: 'radial-gradient(circle, rgba(16,185,129,0.04) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0, pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 10 }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-500)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Lumina Platform</p>
              <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>Community Hub</h1>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setShowBookingModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 999, border: '2px solid var(--brand-500)', background: 'transparent', color: 'var(--brand-600)', fontWeight: 900, cursor: 'pointer' }}>
                <Calendar size={16} /> Book Office Hours
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.25rem', marginTop: '2rem', borderBottom: '1px solid var(--surface-3)' }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'transparent', border: 'none', cursor: 'pointer',
                  padding: '0.625rem 1rem 0.875rem', fontSize: '0.875rem', fontWeight: 700, marginBottom: '-1px',
                  color: activeTab === t.id ? 'var(--text-primary)' : 'var(--text-muted)',
                  borderBottom: activeTab === t.id ? '2px solid var(--text-primary)' : '2px solid transparent',
                  transition: 'all 0.2s',
                }}>
                <t.icon size={15} /> {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          {activeTab === 'bounty'  && <BountyBoardTab />}
          {activeTab === 'synapse' && <MatchmakingTab />}
          {activeTab === 'campus'  && <CampusLiveTab />}
          {activeTab === 'alumni'  && <AlumniTab />}
        </div>
            </div>
      
      {showMsgModal && <MessageFacultyModal onClose={() => setShowMsgModal(false)} />}
      {showBookingModal && <BookOfficeHoursModal onClose={() => setShowBookingModal(false)} />}
    </div>
  );
}
