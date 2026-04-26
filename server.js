require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Paths to data files
const portfolioPath = path.join(__dirname, 'data', 'portfolio.json');
const messagesPath = path.join(__dirname, 'data', 'messages.json');

// Ensure data files exist
if (!fs.existsSync(portfolioPath)) {
    const defaultData = {
        hero: {
            name: "Alex Morgan",
            greeting: "👋 Hello, I'm",
            highlight: "Morgan",
            titles: ["Full-Stack Web Developer", "UI/UX Enthusiast", "Problem Solver"],
            description: "A passionate full-stack web developer crafting beautiful, performant, and user‑centric digital experiences.",
            stats: { years: "5+", projects: "40+", clients: "25+" }
        },
        about: {
            paragraphs: [
                "I'm a full-stack developer with a deep love for clean code...",
                "I specialize in building scalable web applications..."
            ],
            cards: [
                { icon: "🎯", title: "Frontend", subtitle: "React, Vue, Svelte" },
                { icon: "⚙️", title: "Backend", subtitle: "Node.js, Python, Go" },
                { icon: "☁️", title: "DevOps", subtitle: "AWS, Docker, CI/CD" },
                { icon: "🎨", title: "Design", subtitle: "Figma, Tailwind, UI/UX" }
            ]
        },
        skills: [
            { name: "React", level: "Expert", icon: "⚛️" },
            { name: "Node.js", level: "Expert", icon: "🟢" },
            { name: "TypeScript", level: "Advanced", icon: "📘" }
            // ... add all
        ],
        projects: [
            {
                id: 1,
                title: "E-Commerce Platform",
                description: "Full-featured online store...",
                category: "fullstack",
                tags: ["React", "Node.js", "Stripe"],
                gradient: "linear-gradient(135deg,#1a1a3e,#2d1b69)",
                links: { demo: "#", github: "#" }
            }
            // ... add all projects
        ],
        experience: [
            { date: "2024 — Present", role: "Senior Full-Stack Developer", company: "TechNova Inc.", description: "..." },
            // ...
        ],
        contact: {
            email: "alex.morgan@example.com",
            location: "San Francisco, CA",
            availability: "Freelance & Full-time"
        }
    };
    fs.writeFileSync(portfolioPath, JSON.stringify(defaultData, null, 2));
}
if (!fs.existsSync(messagesPath)) {
    fs.writeFileSync(messagesPath, JSON.stringify([]));
}

// ===== API Routes =====

// Get full portfolio data (for dynamic frontend)
app.get('/api/portfolio', (req, res) => {
    const data = fs.readFileSync(portfolioPath, 'utf-8');
    res.json(JSON.parse(data));
});

// Handle contact form submission
app.post('/api/contact', (req, res) => {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Name, email, and message are required.' });
    }

    const newMessage = {
        id: Date.now(),
        name,
        email,
        subject: subject || '',
        message,
        createdAt: new Date().toISOString()
    };

    const messages = JSON.parse(fs.readFileSync(messagesPath, 'utf-8'));
    messages.push(newMessage);
    fs.writeFileSync(messagesPath, JSON.stringify(messages, null, 2));

    // Here you could also send an email notification (e.g., using nodemailer)
    console.log('📩 New contact message:', newMessage);

    res.status(200).json({ success: true, message: 'Message sent successfully!' });
});

// Admin route to update portfolio (simple password check)
app.post('/api/admin/update', (req, res) => {
    const { password, data } = req.body;
    if (password !== ADMIN_PASSWORD) {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    try {
        fs.writeFileSync(portfolioPath, JSON.stringify(data, null, 2));
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save data.' });
    }
});

// Admin route to view messages (optional)
app.get('/api/admin/messages', (req, res) => {
    const { password } = req.query;
    if (password !== ADMIN_PASSWORD) {
        return res.status(403).json({ error: 'Unauthorized' });
    }
    const messages = JSON.parse(fs.readFileSync(messagesPath, 'utf-8'));
    res.json(messages);
});

// Fallback: serve the main HTML for any non-API route (for SPA-style history)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Portfolio backend running at http://localhost:${PORT}`);
});