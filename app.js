// backend/app.js
const crypto = require('crypto');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const axios = require('axios');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend files
app.use(express.static('./frontend'));

// Session setup
app.use(session({ secret: 'github-secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// GitHub OAuth setup
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/auth/github/callback"
}, (accessToken, refreshToken, profile, done) => {
    return done(null, { profile, accessToken });
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

// OAuth GitHub login route
app.get('/auth/github', passport.authenticate('github', { scope: ['repo', 'admin:repo_hook'] }));

// OAuth callback route
app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/' }), (req, res) => {
    const token = jwt.sign({ token: req.user.accessToken }, process.env.JWT_SECRET);
    res.redirect(`/?token=${token}`);
});

// Create a webhook for a specific repository
app.post('/webhook/create', async (req, res) => {
    const { repo } = req.body;
    const webhookUrl = process.env.WEBHOOK_PROXY_URL;
    console.log(`Received request to create webhook for repository: ${repo}`);

    try {
        const response = await axios.post(`https://api.github.com/repos/${repo}/hooks`, {
            name: 'web',
            config: {
                url: webhookUrl,
                content_type: 'json',
            },
            events: ['pull_request'],
        },
            {
                headers:
                    { Authorization: `token ${process.env.GITHUB_AUTH_TOKEN}` }
            }
        );
        console.log(`Webhook created successfully for repository: ${repo}`);
        return res.status(201).json(
            {
                message: 'Webhook created successfully',
                repo: repo,
                url: webhookUrl
            }
        );
    } catch (error) {
        return res.status(500).json({ error: 'Error creating webhook', details: error.message });
    }
});

// Webhook handler for PR events
app.post('/webhook', (req, res) => {
    const event = req.headers['x-github-event']; // Get the event type
    const payload = req.body;

    console.log(`Received event: ${event}`);
    console.log('Request headers :', req.headers); // Log headers
    console.log('Request body:', JSON.stringify(payload, null, 2)); // Log body
    switch (event) {
        case 'pull_request': {
            const action = payload.action; // e.g., opened, closed, edited, etc.
            console.log(`Pull request action: ${action}`);
            if (action === 'opened' || action === 'synchronize') {
                const prTitle = payload.pull_request.title;
                const prBody = payload.pull_request.body;
                const prUrl = payload.pull_request.html_url;
                console.log(`Handling pull request titled: "${prTitle}" with body: "${prBody}"`);

                (async () => {
                    try {
                        const reviewComment = await generateReviewComment(prTitle, prBody, prUrl)
                        console.log('Generated review comment:', reviewComment);
                        const response = postReviewComment(payload.pull_request.comments_url, reviewComment);
                    } catch (error) {
                        console.error("Error generating content:", error.data.message);
                    }
                })();
            }
            else if (action === 'closed') {
                console.log('pull request closed')
            }
            return res.status(201).send(`Webhook received for event: ${event} , action : ${action}`);
        }
        case 'issue_comment': {
            console.log(`Webhook received for event: ${event}`)
            return res.status(201).send(`Webhook received for event: ${event}`);
        }
        default: {
            console.log(`No action taken for event: ${event}`);
            return res.status(401).send(`Webhook not received for event: ${event}`);
        }
    }
});

// Function to generate AI review (placeholder)
async function generateReviewComment(title, body, url) {
    const prompt = `Review the following pull request titled "${title}". Here is the body: "${body}". You can find the PR here: ${url}. Provide suggestions for improvements or feedback.`;
    console.log('Generating review comment with prompt:', prompt);
    try {
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        return `Error generating content: ${error}`;
    }
}
async function postReviewComment(commentsUrl, comment) {
    try {
        await axios.post(commentsUrl, {
            body: comment,
        }, {
            headers: {
                'Authorization': `token ${process.env.GITHUB_AUTH_TOKEN}`,
                'Accept': 'application/vnd.github+json',
            },
        });
        console.log('Review comment posted successfully.');
        return 'Review comment posted successfully.';
    } catch (error) {
        console.error('Error posting review comment:', error.message);
        return error;
    }
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
