from db.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    for sql, label in [
        ("ALTER TABLE enrollments ADD COLUMN learning_path VARCHAR(20) DEFAULT 'pending'", "learning_path"),
        ("ALTER TABLE enrollments ADD COLUMN placement_score FLOAT NULL", "placement_score"),
        ("ALTER TABLE enrollments ADD COLUMN path_override BOOLEAN DEFAULT 0", "path_override"),
    ]:
        try:
            conn.execute(text(sql))
            print(f"Added {label}")
        except Exception as e:
            print(f"{label} already exists or error: {e}")

    conn.commit()
    print("Migration complete.")
