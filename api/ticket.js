export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { name, phone, email, device, priority, category, notes } = req.body;

    const resendKey = process.env.RESEND_API_KEY;

    console.log('ticket request received');
    console.log('has resend key:', !!resendKey);
    console.log({ name, phone, email, device, priority, category, notes });

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'R & S Technologies <onboarding@resend.dev>',
        to: ['tysondjoseph@icloud.com'],
        subject: `Test Ticket: ${category} - ${name}`,
        text: `
New Support Ticket Submitted

Name: ${name}
Phone: ${phone}
Email: ${email}
Device Type: ${device}
Priority: ${priority}
Issue Category: ${category}
Additional Notes: ${notes}
        `
      })
    });

    const text = await response.text();
    console.log('resend status:', response.status);
    console.log('resend response:', text);

    if (!response.ok) {
      return res.status(500).json({
        message: 'Email failed to send',
        details: text
      });
    }

    return res.status(200).json({
      message: 'Ticket submitted successfully'
    });
  } catch (error) {
    console.error('server error:', error);
    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
}