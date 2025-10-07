#!/usr/bin/env python3
"""
Migration script to add last_updated column to tourists table
and set initial values from created_at
"""

import sqlite3
from datetime import datetime

def migrate():
    conn = sqlite3.connect('tourists.db')
    cursor = conn.cursor()
    
    try:
        # Check if last_updated column exists
        cursor.execute("PRAGMA table_info(tourists)")
        columns = [row[1] for row in cursor.fetchall()]
        
        if 'last_updated' not in columns:
            print("Adding last_updated column to tourists table...")
            
            # Add the column
            cursor.execute("""
                ALTER TABLE tourists 
                ADD COLUMN last_updated TIMESTAMP
            """)
            
            # Set last_updated to created_at for existing records
            cursor.execute("""
                UPDATE tourists 
                SET last_updated = created_at
                WHERE last_updated IS NULL
            """)
            
            conn.commit()
            print("✅ Migration completed successfully!")
            print(f"   - Added last_updated column")
            print(f"   - Updated {cursor.rowcount} existing records")
        else:
            print("⚠️  last_updated column already exists, skipping migration")
            
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
