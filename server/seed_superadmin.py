import sqlite3
from datetime import datetime

conn = sqlite3.connect('server/lms.db')
c = conn.cursor()

# 1. Add description to support_tickets if not exists
c.execute('PRAGMA table_info(support_tickets)')
cols = [col[1] for col in c.fetchall()]
if 'description' not in cols:
    c.execute('ALTER TABLE support_tickets ADD COLUMN description TEXT')
    print('Added description to support_tickets')

# 2. Update tenant 1 plan to enterprise
c.execute("UPDATE tenants SET plan = 'enterprise' WHERE id = 1")

# 3. Add TechGlobal Academy if not exists
c.execute("SELECT id FROM tenants WHERE subdomain = 'techglobal'")
if not c.fetchone():
    c.execute('''
        INSERT INTO tenants (name, subdomain, plan, is_active, primary_color, secondary_color, created_at)
        VALUES ('TechGlobal Academy', 'techglobal', 'pro', 1, '#0ea5e9', '#6366f1', datetime('now'))
    ''')
    print('Added TechGlobal Academy tenant')

# 4. Seed support tickets
c.execute('SELECT count(*) FROM support_tickets')
if c.fetchone()[0] == 0:
    tickets = [
        (1, 'SSO SAML Assertion configuration issue', 'Authentication', 'high', 'open', 2, 0,
         'Our faculty are receiving an invalid audience URI error when attempting to sign in through Microsoft Entra ID. Could you please check our SAML metadata settings?',
         datetime.now().isoformat()),
        (1, 'Database sync latency spike during peak hours', 'Infrastructure', 'critical', 'in_progress', 2, 2,
         'Automated alert: Secondary replica sync lag reached 420ms during peak lecture hours today. We require immediate telemetry audit.',
         datetime.now().isoformat()),
        (1, 'Requesting additional AI Tutor token quota', 'Billing', 'medium', 'resolved', 2, 3,
         'We have consumed 85% of our monthly AI tutor tokens ahead of midterms. Can we provision an extra 250,000 token pack?',
         datetime.now().isoformat())
    ]
    c.executemany('''
        INSERT INTO support_tickets (tenant_id, subject, category, priority, status, raised_by, replies_count, description, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', tickets)
    print('Seeded support tickets')

# 5. Seed broadcast messages
c.execute('SELECT count(*) FROM broadcast_messages')
if c.fetchone()[0] == 0:
    broadcasts = [
        (1, 'Scheduled Platform Maintenance Window', 'The platform will undergo scheduled core database upgrades on Sunday at 02:00 UTC. Uptime impact is expected to be under 15 minutes.', None, 'Platform Super Admin', 240, datetime.now().isoformat()),
        (1, 'New AI Proctoring & Cognitive Models Deployed', 'Claude 3.5 Sonnet and GPT-4o engine upgrades are now live across all active tenant workspaces.', None, 'Platform Super Admin', 480, datetime.now().isoformat())
    ]
    c.executemany('''
        INSERT INTO broadcast_messages (tenant_id, title, message, target_cohort_id, sent_by, reach_count, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', broadcasts)
    print('Seeded broadcasts')

# 6. Seed audit logs
c.execute('SELECT count(*) FROM audit_logs')
if c.fetchone()[0] == 0:
    logs = [
        (1, 1, 'user_created', 'user', '{"email": "teacher@demouni.edu", "role": "teacher"}', '192.168.1.104', datetime.now().isoformat()),
        (1, 1, 'course_published', 'course', '{"title": "Full Stack Modern Web Architecture", "course_id": 1}', '192.168.1.104', datetime.now().isoformat()),
        (1, 1, 'impersonation_started', 'security', '{"target_user": "student@demouni.edu", "reason": "Support troubleshooting"}', '10.0.0.12', datetime.now().isoformat()),
        (1, 1, 'tenant_suspended', 'tenant', '{"tenant": "Suspended Test Org", "reason": "Delinquent payment"}', '127.0.0.1', datetime.now().isoformat()),
    ]
    c.executemany('''
        INSERT INTO audit_logs (tenant_id, user_id, action, resource, details, ip_address, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', logs)
    print('Seeded audit logs')

conn.commit()
conn.close()
print('Successfully seeded superadmin data!')
