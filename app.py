
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor
import logging

app = Flask(__name__)
CORS(app)
logging.basicConfig(level=logging.INFO)

def get_db_connection():
    try:
        conn = psycopg2.connect(
            dbname="postgres",
            user="postgres",
            password="postgres",
            host="0.0.0.0",
            port="5432",
            connect_timeout=3
        )
        return conn
    except Exception as e:
        logging.error(f"Database connection error: {e}")
        return None

@app.route('/api/applications', methods=['GET'])
def get_applications():
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'success': False, 'error': 'Database connection failed'}), 500
            
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT * FROM applications ORDER BY created_at DESC")
            applications = cur.fetchall()
            
        return jsonify({'success': True, 'applications': applications})
    except Exception as e:
        logging.error(f"Error getting applications: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/submit-application', methods=['POST'])
def submit_application():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
        
        print("Received data:", data)  # Добавим логирование

        required_fields = ['formType', 'name', 'city', 'school', 'class', 'email', 'whatsapp']
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if missing_fields:
            return jsonify({'success': False, 'error': f'Missing fields: {", ".join(missing_fields)}'}), 400

        conn = get_db_connection()
        if not conn:
            return jsonify({'success': False, 'error': 'Database connection failed'}), 500

        try:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO applications 
                    (form_type, name, city, school, class_grade, email, whatsapp, created_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING id
                """, (
                    data['formType'],
                    data['name'],
                    data['city'],
                    data['school'],
                    data['class'],
                    data['email'],
                    data['whatsapp'],
                    datetime.now()
                ))
                application_id = cur.fetchone()[0]
                conn.commit()
                
            return jsonify({'success': True, 'id': application_id})
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()
            
    except Exception as e:
        logging.error(f"Error submitting application: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    try:
        conn = get_db_connection()
        if conn:
            with conn.cursor() as cur:
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS applications (
                        id SERIAL PRIMARY KEY,
                        form_type VARCHAR(50),
                        name VARCHAR(255),
                        city VARCHAR(255),
                        school VARCHAR(255),
                        class_grade VARCHAR(50),
                        email VARCHAR(255),
                        whatsapp VARCHAR(50),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                conn.commit()
            conn.close()
            logging.info("Database initialized successfully")
        else:
            logging.error("Failed to initialize database")
            
        app.run(host='0.0.0.0', port=5000)
    except Exception as e:
        logging.error(f"Startup error: {e}")
