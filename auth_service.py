import os
import random
import string
import smtplib
import json
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv('.env')

class AuthService:
    """Authentication service for admin email OTP verification"""
    
    def __init__(self):
        # Load SMTP configuration
        self.smtp_host = os.getenv('SMTP_HOST', '').strip('"')
        self.smtp_port = int(os.getenv('SMTP_PORT', '587').strip('"'))
        self.smtp_user = os.getenv('SMTP_USER', '').strip('"')
        self.smtp_pass = os.getenv('SMTP_PASS', '').strip('"')
        
        # Load admin emails
        self.admin_emails = self._load_admin_emails()
        
        # OTP storage (in production, use Redis or database)
        self.otp_store = {}
        
    def _load_admin_emails(self):
        """Load all admin emails from environment variables"""
        admin_emails = []
        counter = 1
        while True:
            email = os.getenv(f'ADMIN_{counter}', '').strip()
            if not email:
                break
            admin_emails.append(email.lower())
            counter += 1
        
        print(f"Loaded {len(admin_emails)} admin emails: {admin_emails}")
        return admin_emails
    
    def is_admin(self, email):
        """Check if email is registered as admin"""
        return email.lower() in self.admin_emails
    
    def generate_otp(self, length=6):
        """Generate a random OTP"""
        return ''.join(random.choices(string.digits, k=length))
    
    def send_otp_email(self, email):
        """Send OTP to admin email"""
        if not self.is_admin(email):
            return {
                'success': False,
                'message': 'Email not registered as admin'
            }
        
        try:
            # Generate OTP
            otp = self.generate_otp()
            
            # Store OTP with expiration (5 minutes)
            expiration = datetime.now() + timedelta(minutes=5)
            self.otp_store[email.lower()] = {
                'otp': otp,
                'expiration': expiration.isoformat(),
                'attempts': 0
            }
            
            # Send email
            self._send_email(email, otp)
            
            return {
                'success': True,
                'message': 'OTP sent to your email',
                'email': self._mask_email(email)
            }
        except Exception as e:
            print(f"Error sending OTP: {str(e)}")
            return {
                'success': False,
                'message': f'Failed to send OTP: {str(e)}'
            }
    
    def _send_email(self, recipient_email, otp):
        """Send OTP via SMTP"""
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = '🔐 MultiYO Admin Panel - Login OTP'
            msg['From'] = self.smtp_user
            msg['To'] = recipient_email
            
            # HTML email template
            html = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .card {{ background-color: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); padding: 30px; }}
                    .header {{ text-align: center; margin-bottom: 30px; }}
                    .logo {{ font-size: 28px; font-weight: bold; color: #667eea; margin-bottom: 10px; }}
                    .title {{ font-size: 24px; font-weight: bold; color: #0f172a; margin-bottom: 10px; }}
                    .subtitle {{ font-size: 14px; color: #64748b; margin-bottom: 30px; }}
                    .otp-container {{ text-align: center; margin: 30px 0; }}
                    .otp-box {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-size: 36px; font-weight: bold; letter-spacing: 8px; padding: 20px; border-radius: 8px; font-family: 'Courier New', monospace; word-spacing: 12px; }}
                    .otp-label {{ font-size: 12px; color: #64748b; margin-top: 10px; text-transform: uppercase; letter-spacing: 1px; }}
                    .warning {{ background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; border-radius: 4px; font-size: 13px; color: #92400e; }}
                    .footer {{ text-align: center; margin-top: 30px; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }}
                    .badge {{ display: inline-block; background-color: #dbeafe; color: #0c4a6e; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 20px; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="card">
                        <div class="header">
                            <div class="logo">🎨 MultiYO</div>
                            <div class="title">Admin Login</div>
                            <div class="subtitle">Secure Access Required</div>
                        </div>
                        
                        <div class="badge">✓ Verified Request</div>
                        
                        <p style="color: #0f172a; font-size: 15px; margin-bottom: 20px;">
                            Hello Admin,
                        </p>
                        
                        <p style="color: #475569; font-size: 14px; margin-bottom: 20px; line-height: 1.6;">
                            You requested a login to the MultiYO Admin Dashboard. Use the following One-Time Password (OTP) to complete your authentication:
                        </p>
                        
                        <div class="otp-container">
                            <div class="otp-box">{otp}</div>
                            <div class="otp-label">One-Time Password (OTP)</div>
                        </div>
                        
                        <div class="warning">
                            ⚠️ <strong>Security Notice:</strong> Never share this OTP with anyone. We will never ask for your OTP via phone, email, or any other method. This OTP will expire in 5 minutes.
                        </div>
                        
                        <p style="color: #64748b; font-size: 13px; margin: 20px 0; line-height: 1.6;">
                            <strong>Details:</strong><br>
                            • OTP Expires: <strong>5 minutes</strong><br>
                            • Valid for: <strong>1 attempt per OTP</strong><br>
                            • Request Time: <strong>{datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}</strong>
                        </p>
                        
                        <div class="footer">
                            <p style="margin: 0;">© 2024 MultiYO. All rights reserved.</p>
                            <p style="margin: 8px 0 0 0; font-size: 11px;">This is an automated email. Please do not reply.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """
            
            # Attach HTML
            part = MIMEText(html, 'html')
            msg.attach(part)
            
            # Send via SMTP
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_pass)
                server.send_message(msg)
            
            print(f"OTP sent successfully to {recipient_email}")
            return True
            
        except Exception as e:
            print(f"SMTP Error: {str(e)}")
            raise
    
    def verify_otp(self, email, otp):
        """Verify OTP for login"""
        email = email.lower()
        
        if email not in self.otp_store:
            return {
                'success': False,
                'message': 'No OTP found for this email'
            }
        
        otp_data = self.otp_store[email]
        
        # Check expiration
        expiration = datetime.fromisoformat(otp_data['expiration'])
        if datetime.now() > expiration:
            del self.otp_store[email]
            return {
                'success': False,
                'message': 'OTP has expired'
            }
        
        # Check max attempts
        if otp_data['attempts'] >= 3:
            del self.otp_store[email]
            return {
                'success': False,
                'message': 'Maximum OTP attempts exceeded'
            }
        
        # Verify OTP
        if otp_data['otp'] != otp:
            otp_data['attempts'] += 1
            return {
                'success': False,
                'message': 'Incorrect OTP',
                'remaining_attempts': 3 - otp_data['attempts']
            }
        
        # OTP verified - remove from store
        del self.otp_store[email]
        
        return {
            'success': True,
            'message': 'OTP verified successfully',
            'email': email
        }
    
    def _mask_email(self, email):
        """Mask email for display"""
        parts = email.split('@')
        local = parts[0]
        domain = parts[1]
        
        if len(local) > 2:
            masked_local = local[0] + '*' * (len(local) - 2) + local[-1]
        else:
            masked_local = local[0] + '*'
        
        return f"{masked_local}@{domain}"

# Create singleton instance
auth_service = AuthService()
