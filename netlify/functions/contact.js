// Netlify serverless function for contact form
const { validate } = require('email-validator'); // you'll install this

exports.handler = async (event, context) => {
    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' }),
        };
    }

    let body;
    try {
        body = JSON.parse(event.body);
    } catch {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid JSON' }),
        };
    }

    const { name, email, subject, message } = body;

    // Basic validation
    if (!name || !email || !message) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Name, email and message are required.' }),
        };
    }

    if (name.length > 100 || message.length > 5000) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Text too long.' }),
        };
    }

    if (!validate(email)) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid email address.' }),
        };
    }

    // Optional: log the message (Netlify shows logs in dashboard)
    console.log('New contact message:', { name, email, subject });

    // For now, just return success. You can later integrate with a real email service.
    return {
        statusCode: 200,
        body: JSON.stringify({ success: true, message: 'Message sent successfully!' }),
    };
};