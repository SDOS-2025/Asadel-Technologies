import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import json
import os
import logging
from datetime import datetime
from backend.utils import get_db_connection

# Configure logging
logger = logging.getLogger(__name__)

# Email credentials and info
sender_email = "warningfireasadel@gmail.com"
app_password = "rfta lrnw dvpj gzub"

# List of recipients
receiver_emails = [
    "naman22311@iiitd.ac.in",
    "neil22319@iiitd.ac.in",
    "pratham22373@iiitd.ac.in"
]

# Path to sent alerts file
SENT_ALERTS_FILE = os.path.join(os.path.dirname(__file__), 'sent_alerts.json')

def load_sent_alerts():
    """Load the sent alerts from JSON file"""
    try:
        if os.path.exists(SENT_ALERTS_FILE):
            with open(SENT_ALERTS_FILE, 'r') as f:
                return json.load(f)
        return {}
    except Exception as e:
        logger.error(f"Error loading sent alerts: {str(e)}")
        return {}

def save_sent_alerts(alerts):
    """Save the sent alerts to JSON file"""
    try:
        with open(SENT_ALERTS_FILE, 'w') as f:
            json.dump(alerts, f, indent=4)
    except Exception as e:
        logger.error(f"Error saving sent alerts: {str(e)}")

def check_and_send_unique_log_email(camera_id, region_id, sub_region_id, alert_type):
    """
    Check if a log is unique for the given camera, region, and sub-region combination
    and send an email if it is unique
    """
    try:
        # Create a unique key for this combination
        alert_key = f"{camera_id}_{region_id}_{sub_region_id}"
        
        # Load existing sent alerts
        sent_alerts = load_sent_alerts()
        
        # If this combination hasn't been sent before, send email
        if alert_key not in sent_alerts:
            send_alert_email(camera_id, region_id, sub_region_id, alert_type)
            
            # Add to sent alerts
            sent_alerts[alert_key] = {
                'camera_id': camera_id,
                'region_id': region_id,
                'sub_region_id': sub_region_id,
                'first_alert_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }
            
            # Save updated alerts
            save_sent_alerts(sent_alerts)
            logger.info(f"Sent unique alert email for camera {camera_id}, region {region_id}, sub-region {sub_region_id}")
        
    except Exception as e:
        logger.error(f"Error checking unique logs: {str(e)}")

def send_alert_email(camera_id, region_id, sub_region_id, alert_type):
    """
    Send an alert email for a unique detection
    """
    try:
        # Get camera and region details
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        query = """
            SELECT 
                c.name as camera_name,
                r.name as region_name,
                sr.name as sub_region_name
            FROM cameras c
            JOIN regions r ON c.region = r.id
            JOIN sub_regions sr ON c.sub_region = sr.id
            WHERE c.id = %s
        """
        
        cursor.execute(query, (camera_id,))
        details = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        # Create the email
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = ", ".join(receiver_emails)
        msg['Subject'] = f"Alert: {alert_type} Detected"

        # Email body with detailed information
        body = f"""
        Dear Security Team,

        A {alert_type} has been detected in your monitoring system.

        Details:
        - Camera: {details['camera_name']}
        - Region: {details['region_name']}
        - Sub-Region: {details['sub_region_name']}
        - Alert Type: {alert_type}
        - Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

        Please take appropriate action.

        Regards,
        Security Monitoring System
        """

        msg.attach(MIMEText(body, 'plain'))

        # Send the email
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(sender_email, app_password)
        server.sendmail(sender_email, receiver_emails, msg.as_string())
        server.quit()
        
        logger.info("Alert email sent successfully")
        
    except Exception as e:
        logger.error(f"Error sending alert email: {str(e)}")

# Original fire alert email function
def send_fire_alert_email():
    """Send fire alert email"""
    try:
        # Create the email
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = ", ".join(receiver_emails)
        msg['Subject'] = "Fire Alert - Immediate Action Required"

        # Email body
        body = """
        Dear Resident,

        A potential fire has been detected at your location.

        Please evacuate the premises immediately and follow all emergency protocols.

        If this alert was triggered in error, please report the incident to the fire monitoring team for investigation.

        Stay safe,
        Fire Monitoring System
        """

        msg.attach(MIMEText(body, 'plain'))

        # Send the email
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(sender_email, app_password)
        server.sendmail(sender_email, receiver_emails, msg.as_string())
        print("Email sent successfully to all recipients.")
        server.quit()
    except Exception as e:
        print(f"Error sending email: {e}")
