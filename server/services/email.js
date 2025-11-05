import Mailjet from 'node-mailjet';

async function sendPasswordResetEmail(toEmail, resetLink) {
  try {
    console.log('Attempting to send reset email to:', toEmail);
    console.log('Mailjet API Key configured:', !!process.env.MAILJET_API_KEY);
    console.log('Mailjet API Secret configured:', !!process.env.MAILJET_API_SECRET);
    
    // Check if Mailjet credentials are configured
    if (!process.env.MAILJET_API_KEY || !process.env.MAILJET_API_SECRET) {
      console.error('Mailjet API credentials not configured in environment variables');
      console.log('Reset link (for development):', resetLink);
      return false;
    }
    
    // Initialize Mailjet client only when needed
    const mailjet = Mailjet.apiConnect(
      process.env.MAILJET_API_KEY,
      process.env.MAILJET_API_SECRET
    );
    
    // Use configured sender email or default to your Gmail
    const senderEmail = process.env.MAILJET_SENDER_EMAIL || "ay.perso2011@gmail.com";
    const senderName = process.env.MAILJET_SENDER_NAME || "AcademOra";
    
    const result = await mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: senderEmail,
            Name: senderName
          },
          To: [
            {
              Email: toEmail
            }
          ],
          Subject: "Reset Your AcademOra Password",
          TextPart: `You requested a password reset. Click the link to reset your password:\n\n${resetLink}\n\nIf you didn't request this, please ignore this email.`,
          HTMLPart: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #4F46E5;">Reset Your Password</h2>
              <p>You requested a password reset for your AcademOra account.</p>
              <p>Click the button below to set a new password:</p>
              <p style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" 
                   style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 5px; display: inline-block;">
                  Reset Password
                </a>
              </p>
              <p>Or copy and paste this link in your browser:</p>
              <p style="word-break: break-all; color: #4F46E5;">${resetLink}</p>
              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                If you didn't request this reset, you can safely ignore this email.
              </p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              <p style="color: #666; font-size: 12px; text-align: center;">
                AcademOra - Academic Orientation Platform
              </p>
            </div>
          `
        }
      ]
    });

    console.log('Email sent successfully:', result.body);
    return true;
  } catch (error) {
    console.error('Failed to send password reset email:', error.message);
    if (error.statusCode) {
      console.error('Mailjet error code:', error.statusCode);
      console.error('Mailjet error message:', error.message);
    }
    // Always log the reset link for development/debugging
    console.log('Reset link (for development):', resetLink);
    return false;
  }
}

export { sendPasswordResetEmail };