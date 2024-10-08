// frontend/script.js

// Button to connect to GitHub
document.getElementById('connect-github').addEventListener('click', () => {
    window.location.href = 'http://localhost:5000/auth/github';
});

// Function to handle the GitHub OAuth callback
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');
if (token) {
    localStorage.setItem('github_token', token);
    document.getElementById('auth').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
}

document.getElementById('create-webhook').addEventListener('click', () => {
    const repo = document.getElementById('repo-name').value;
    if (repo) {
        const token = localStorage.getItem('github_token');
        console.log(token);
        fetch('http://localhost:5000/webhook/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ repo, token }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    const alertMessage = `${data.message} for repo ${data.repo} and url : ${data.url}`
                    alert(alertMessage);
                } else {
                    alert('Error creating webhook.');
                }
            })
            .catch(err => console.error('Error creating webhook', err));
    }
});
