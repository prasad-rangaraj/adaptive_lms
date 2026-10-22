import requests
import json

BASE_URL = "http://localhost:8000"

def test_endpoints():
    # 1. Login as super admin
    login_payload = {
        "username": "superadmin@lms.com",
        "password": "password123"
    }
    print("[1] Logging in as super admin...")
    try:
        r = requests.post(f"{BASE_URL}/api/auth/login", data=login_payload)
        if r.status_code != 200:
            print(f"FAILED login: {r.status_code} {r.text}")
            return
        token = r.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("Super admin login SUCCESS.")
    except Exception as e:
        print(f"Error connecting to backend: {e}")
        return

    # List of endpoints to verify
    endpoints = [
        ("GET", "/api/admin/stats"),
        ("GET", "/api/admin/billing"),
        ("GET", "/api/admin/health"),
        ("GET", "/api/admin/users/global"),
        ("GET", "/api/admin/courses/global"),
        ("GET", "/api/admin/audit-logs"),
        ("GET", "/api/admin/tickets"),
        ("GET", "/api/admin/broadcasts"),
        ("GET", "/api/tenants"),
    ]

    print("\n[2] Testing Super Admin GET Endpoints:")
    for method, path in endpoints:
        resp = requests.get(f"{BASE_URL}{path}", headers=headers)
        status = resp.status_code
        length = len(resp.json()) if isinstance(resp.json(), (list, dict)) else 0
        print(f"  {method} {path:<32} -> {status} (length/keys: {length})")
        assert status == 200, f"Expected 200 for {path}, got {status}"

    print("\n[3] Testing Ticket Actions:")
    # Get first ticket
    tickets = requests.get(f"{BASE_URL}/api/admin/tickets", headers=headers).json()
    if tickets:
        t_id = tickets[0]["id"]
        # Reply to ticket
        rep = requests.post(f"{BASE_URL}/api/admin/tickets/{t_id}/reply", headers=headers, json={"message": "Automated verification test reply"})
        print(f"  POST /api/admin/tickets/{t_id}/reply -> {rep.status_code} ({rep.json().get('status')})")
        assert rep.status_code == 200

        # Update status
        patch_res = requests.patch(f"{BASE_URL}/api/admin/tickets/{t_id}/status", headers=headers, json={"status": "in_progress"})
        print(f"  PATCH /api/admin/tickets/{t_id}/status -> {patch_res.status_code} ({patch_res.json().get('status')})")
        assert patch_res.status_code == 200
    else:
        print("  No tickets found to test.")

    print("\n[4] Testing Broadcast Announcements:")
    b_res = requests.post(f"{BASE_URL}/api/admin/broadcasts", headers=headers, json={
        "title": "System Audit Complete",
        "message": "All 10 Super Admin routes verified and healthy.",
        "type": "info",
        "target": "all"
    })
    print(f"  POST /api/admin/broadcasts -> {b_res.status_code} ({b_res.json().get('subject')})")
    assert b_res.status_code in (200, 201)

    print("\nALL SUPER ADMIN ENDPOINTS TESTED SUCCESSFULLY!")

if __name__ == "__main__":
    test_endpoints()
