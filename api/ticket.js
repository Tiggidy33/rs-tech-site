export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      name,
      phone,
      email,
      device,
      priority,
      category,
      notes
    } = req.body;

    console.log('ticket request received');
    console.log({ name, phone, email, device, priority, category, notes });
    console.log('has resend key:', !!process.env.RESEND_API_KEY);

    const ownerEmail = 'tysondjoseph@icloud.com';
    const resendKey = process.env.RESEND_API_KEY;

    const ticketDetails = `
New Support Ticket Submitted

Name: ${name}
Phone: ${phone}
Email: ${email}
Device Type: ${device}
Priority: ${priority}
Issue Category: ${category}
Additional Notes: ${notes}
    `;

    const customerMessage = `
Hello ${name},

Thank you for contacting R & S Technologies.

Your support request has been received. A technician will review your issue and respond within 24 hours.

Ticket Summary:
- Device Type: ${device}
- Priority: ${priority}
- Issue Category: ${category}

If your request is urgent, please call 757-977-4364.

Thank you,
Tyson Joseph
R & S Technologies
    `;

    const ownerResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'R & S Technologies <onboarding@resend.dev>',
        to: [ownerEmail],
        subject: `New Support Ticket: ${category} - ${name}`,
        text: ticketDetails
      })
    });

    console.log('owner email status:', ownerResponse.status);
    const ownerText = await ownerResponse.text();
    console.log('owner email response:', ownerText);

    const customerResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'R & S Technologies <onboarding@resend.dev>',
        to: [email],
        subject: 'R & S Technologies Support Request Received',
        text: customerMessage
      })
    });

    console.log('customer email status:', customerResponse.status);
    const customerText = await customerResponse.text();
    console.log('customer email response:', customerText);

    if (!ownerResponse.ok || !customerResponse.ok) {
      return res.status(500).json({
        message: 'Email failed to send',
        ownerError: ownerText,
        customerError: customerText
      });
    }

    return res.status(200).json({ message: 'Ticket submitted successfully' });
  } catch (error) {
    console.error('server error:', error);
    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
}