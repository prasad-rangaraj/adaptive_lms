path = r'c:\projects\adaptive_lms\client\src\pages\student\StudentCommunityHub.jsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add BookOfficeHoursModal before BountyBoardTab
if 'function BookOfficeHoursModal' not in content:
    idx = content.find('function BountyBoardTab()')
    if idx != -1:
        modal_code = '''
function BookOfficeHoursModal({ onClose }) {
  const [topic, setTopic] = React.useState('');
  const [date, setDate] = React.useState('');
  const [time, setTime] = React.useState('');
  const [sending, setSending] = React.useState(false);

  const handleBook = async () => {
    if(!topic.trim() || !date || !time) return;
    setSending(true);
    try {
      await communityAPI.bookOfficeHour({ teacher_id: 1, topic, date, time });
      onClose();
    } catch (e) {
      console.error(e);
      setSending(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div style={{ position: 'relative', width: '100%', maxWidth: 500, background: 'var(--surface-0)', borderRadius: 24, padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', boxShadow: 'var(--shadow-xl)' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>Book Office Hours</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Schedule a 1-on-1 session with your teacher.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="Topic (e.g., Assignment 2 Help)" style={{ padding: '10px', borderRadius: 8, border: '1px solid var(--surface-3)', background: 'var(--surface-1)', outline: 'none' }} />
          <div style={{ display: 'flex', gap: '1rem' }}>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid var(--surface-3)', background: 'var(--surface-1)', outline: 'none' }} />
            <input type="time" value={time} onChange={e => setTime(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid var(--surface-3)', background: 'var(--surface-1)', outline: 'none' }} />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button onClick={onClose} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: 'var(--surface-2)', cursor: 'pointer', fontWeight: 800 }}>Cancel</button>
          <button disabled={sending || !topic.trim() || !date || !time} onClick={handleBook} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: 'var(--brand-500)', color: 'white', cursor: 'pointer', fontWeight: 800 }}>{sending ? 'Booking...' : 'Book Slot'}</button>
        </div>
      </div>
    </div>
  );
}

'''
        content = content[:idx] + modal_code + content[idx:]
        print("Added BookOfficeHoursModal")

# 2. Add state hook
if 'showBookingModal' not in content:
    target_str = "const [showMsgModal, setShowMsgModal] = useState(false);"
    replacement = "const [showMsgModal, setShowMsgModal] = useState(false);\n  const [showBookingModal, setShowBookingModal] = React.useState(false);"
    if target_str in content:
        content = content.replace(target_str, replacement)
        print("Added state hook")

# 3. Add button
if 'setShowBookingModal(true)' not in content:
    import re
    # We will search for the Direct Message Faculty button and insert the book button right before it.
    btn_search = r'<button onClick=\{\(\) => setShowMsgModal\(true\)\}[^>]+>\s*<MessageSquare size=\{16\} /> Direct Message Faculty\s*</button>'
    btn_replacement = '''<div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setShowBookingModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 999, border: '2px solid var(--brand-500)', background: 'transparent', color: 'var(--brand-600)', fontWeight: 900, cursor: 'pointer' }}>
                <Calendar size={16} /> Book Office Hours
              </button>
              <button onClick={() => setShowMsgModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 999, border: 'none', background: 'var(--brand-500)', color: 'white', fontWeight: 900, cursor: 'pointer', boxShadow: 'var(--shadow-md)' }}>
                <MessageSquare size={16} /> Direct Message Faculty
              </button>
            </div>'''
    content = re.sub(btn_search, btn_replacement, content)
    print("Added button")

# 4. Render modal at the end
if 'BookOfficeHoursModal onClose' not in content:
    target_str = "{showMsgModal && <MessageFacultyModal onClose={() => setShowMsgModal(false)} />}"
    replacement = "{showMsgModal && <MessageFacultyModal onClose={() => setShowMsgModal(false)} />}\n      {showBookingModal && <BookOfficeHoursModal onClose={() => setShowBookingModal(false)} />}"
    if target_str in content:
        content = content.replace(target_str, replacement)
        print("Added modal render")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Saved file!")
