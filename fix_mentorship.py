path = r'c:\projects\adaptive_lms\client\src\pages\student\StudentCommunityHub.jsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

modal_code = '''}

function RequestMentorshipModal({ alumni, onClose }) {
  const [topic, setTopic] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [sending, setSending] = React.useState(false);

  const handleSend = async () => {
    if(!topic.trim() || !message.trim()) return;
    setSending(true);
    try {
      await communityAPI.requestMentorship({ alumni_id: alumni.id || 1, topic, message });
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
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>Request Mentorship</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Connect with {alumni.name} from {alumni.company}.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="Topic (e.g., Mock Interview, Referral)" style={{ padding: '10px', borderRadius: 8, border: '1px solid var(--surface-3)', background: 'var(--surface-1)', outline: 'none' }} />
          <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Why do you want to connect?" style={{ width: '100%', minHeight: 120, padding: '1rem', background: 'var(--surface-1)', border: '1px solid var(--surface-3)', borderRadius: 12, resize: 'vertical', outline: 'none' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button onClick={onClose} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: 'var(--surface-2)', cursor: 'pointer', fontWeight: 800 }}>Cancel</button>
          <button disabled={sending || !topic.trim() || !message.trim()} onClick={handleSend} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: 'var(--brand-500)', color: 'white', cursor: 'pointer', fontWeight: 800 }}>{sending ? 'Sending...' : 'Send Request'}</button>
        </div>
      </div>
    </div>
  );
}

function BountyBoardTab'''

import re
if 'RequestMentorshipModal' not in content:
    content = re.sub(r'}\s+function BountyBoardTab', modal_code, content)
    print("Added RequestMentorshipModal")

# Fix AlumniTab
alumni_tab_sig = "function AlumniTab() {"
alumni_tab_sig_new = "function AlumniTab() {\n  const [mentorshipModal, setMentorshipModal] = React.useState(null);"
if 'setMentorshipModal' not in content:
    content = content.replace(alumni_tab_sig, alumni_tab_sig_new)
    print("Added state to AlumniTab")

# Replace Request Connect button
old_btn = "<button style={{ width: '100%', background: 'var(--surface-1)', color: 'var(--text-primary)', border: '1px solid var(--surface-3)', padding: '10px 0', borderRadius: 10, fontSize: '0.875rem', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = 'var(--text-primary)'; e.currentTarget.style.color = 'white'; }} onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-1)'; e.currentTarget.style.color = 'var(--text-primary)'; }}>\n              Request Connect\n            </button>"

new_btn = "<button onClick={() => setMentorshipModal(a)} style={{ width: '100%', background: 'var(--surface-1)', color: 'var(--text-primary)', border: '1px solid var(--surface-3)', padding: '10px 0', borderRadius: 10, fontSize: '0.875rem', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = 'var(--text-primary)'; e.currentTarget.style.color = 'white'; }} onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-1)'; e.currentTarget.style.color = 'var(--text-primary)'; }}>\n              Request Connect\n            </button>"

if 'setMentorshipModal(a)' not in content:
    content = content.replace(old_btn, new_btn)
    print("Replaced Request Connect button")

# Render modal at the end of AlumniTab
old_end = "    </div>\n  );\n}"
new_end = "      {mentorshipModal && <RequestMentorshipModal alumni={mentorshipModal} onClose={() => setMentorshipModal(null)} />}\n    </div>\n  );\n}"

# We can find the exact location using regex to replace the last </div> ); } of AlumniTab, or just simple replace.
if 'mentorshipModal && <RequestMentorshipModal' not in content:
    import re
    # We will just insert it after the end of the alumni list.
    alumni_list_end = "      </div>\n\n    </div>\n  );"
    alumni_list_end_new = "      </div>\n\n      {mentorshipModal && <RequestMentorshipModal alumni={mentorshipModal} onClose={() => setMentorshipModal(null)} />}\n    </div>\n  );"
    content = content.replace(alumni_list_end, alumni_list_end_new)
    print("Added RequestMentorshipModal to AlumniTab")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Done with Alumni!")
