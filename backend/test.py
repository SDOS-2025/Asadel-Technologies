import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Email credentials and info
sender_email = "warningfireasadel@gmail.com"
app_password = "rfta lrnw dvpj gzub"

# List of recipients
receiver_emails = [
    "naman22311@iiitd.ac.in",
    "neil22319@iiitd.ac.in",
    "pratham22373@iiitd.ac.in"
]

# Create the email
msg = MIMEMultipart()
msg['From'] = sender_email
msg['To'] = ", ".join(receiver_emails)  # For display purposes only
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
try:
    server = smtplib.SMTP('smtp.gmail.com', 587)
    server.starttls()
    server.login(sender_email, app_password)
    server.sendmail(sender_email, receiver_emails, msg.as_string())  # Pass list here
    print("Email sent successfully to all recipients.")
    server.quit()
except Exception as e:
    print(f"Error sending email: {e}")
