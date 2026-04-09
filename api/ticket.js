export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed.' });
  }

  try {
    const data = req.body || {};
    const name = String(data.name || '').trim();
    const phone = String(data.phone || '').trim();
    const email = String(data.email || '').trim();
    const device = String(data.device || '').trim();
    const priority = String(data.priority || '').trim();
    const category = String(data.category || '').trim();
    const notes = String(data.notes || '').trim();

    if (!name || !phone || !email || !device || !priority || !category) {
      return res.status(400).json({
        message: 'Please complete all required fields before submitting your request.'
      });
    }

    const resendKey = process.env.RESEND_API_KEY;

    if (!resendKey) {
      return res.status(503).json({
        message: 'The online support form is not fully configured yet. Please call or email us directly.'
      });
    }

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'R & S Technologies <onboarding@resend.dev>',
        to: ['tysondjoseph@icloud.com'],
        reply_to: email,
        subject: `Support Request: ${category} - ${name}`,
        text: [
          'New support request submitted',
          '',
          `Name: ${name}`,
          `Phone: ${phone}`,
          `Email: ${email}`,
          `Device or Platform: ${device}`,
          `Priority: ${priority}`,
          `Category: ${category}`,
          '',
          'Notes:',
          notes || 'No additional notes provided.'
        ].join('\n')
      })
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Resend request failed:', errorText);
      return res.status(502).json({
        message: 'We could not send the support request right now. Please call or email us directly.'
      });
    }

    return res.status(200).json({
      message: 'Support request submitted successfully.'
    });
  } catch (error) {
    console.error('Support request handler error:', error);
    return res.status(500).json({
      message: 'We could not submit the request right now. Please call or email us directly.'
    });
  }
}
