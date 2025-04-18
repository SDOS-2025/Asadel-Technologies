import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import json
import os

# Email credentials and info
sender_email = "warningfireasadel@gmail.com"
app_password = "rfta lrnw dvpj gzub"

# Dictionary to store sent alerts
SENT_ALERTS_FILE = "sent_alerts.json"

def load_sent_alerts():
    if os.path.exists(SENT_ALERTS_FILE):
        with open(SENT_ALERTS_FILE, 'r') as f:
            return json.load(f)
    return {}

def save_sent_alerts(alerts):
    with open(SENT_ALERTS_FILE, 'w') as f:
        json.dump(alerts, f)

def send_fire_alert(region, subregion, camera_name, receiver_emails):
    # Create unique key for this alert
    alert_key = f"{region}_{subregion}_{camera_name}"
    
    # Load previously sent alerts
    sent_alerts = load_sent_alerts()
    
    # Check if alert was already sent
    if alert_key in sent_alerts:
        print(f"Alert already sent for {alert_key}")
        return False
    
    # Create the email
    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = ", ".join(receiver_emails)
    msg['Subject'] = f"Fire Alert - {region} - {subregion} - {camera_name}"

    # Email body
    body = f"""
    Dear Resident,

    A potential fire has been detected at:
    Region: {region}
    Subregion: {subregion}
    Camera: {camera_name}

    Please evacuate the premises immediately and follow all emergency protocols.

    If this alert was triggered in error, please report the incident to the fire monitoring team for investigation.

    Stay safe,
    Fire Monitoring System
    """

    msg.attach(MIMEText(body, 'plain'))

    # Send the email
    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(sender_email, app_password)
        server.sendmail(sender_email, receiver_emails, msg.as_string())
        print(f"Email sent successfully for {alert_key}")
        server.quit()
        
        # Mark alert as sent
        sent_alerts[alert_key] = True
        save_sent_alerts(sent_alerts)
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

# Example usage:
if __name__ == "__main__":
    # Example recipients
    receiver_emails = [
        "naman22311@iiitd.ac.in",
        "neil22319@iiitd.ac.in",
        "pratham22373@iiitd.ac.in"
    ]
    
    # Example fire detection
    region = "North Wing"
    subregion = "Floor 2"
    camera_name = "Camera 1"
    
    send_fire_alert(region, subregion, camera_name, receiver_emails)
