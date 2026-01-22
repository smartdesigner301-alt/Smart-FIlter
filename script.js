/* ===================================
   SMART HIRING FILTER v4 - JavaScript
   Professional Recruiter Platform
   =================================== */

// ===================================
// STATE MANAGEMENT
// ===================================

const appState = {
    recruiter: {
        username: null,
        authenticated: false,
        name: 'Hiring Team',
        role: 'Recruitment Manager',
        company: 'Your Company'
    },
    job: {
        title: '',
        skills: '',
        experience: 0,
        keywords: '',
        description: '',
        deadline: null,
        active: false,
        closed: false
    },
    questions: [],  // Array of {id, type, text, options}
    applicants: [],  // Array of {name, email, skills, experience, portfolio, answers}
    countdownInterval: null
};

// Demo credentials
const DEMO_USERNAME = 'recruiter';
const DEMO_PASSWORD = 'hiring123';

// ===================================
// INITIALIZATION
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadFromLocalStorage();
    // Show applicant view by default (no auto-login)
    switchView('applicant-view');
});

// ===================================
// EVENT LISTENERS
// ===================================

function setupEventListeners() {
    // Recruiter Login Modal Handlers
    const recruiterLoginBtn = document.getElementById('recruiterLoginBtn');
    if (recruiterLoginBtn) {
        recruiterLoginBtn.addEventListener('click', openRecruiterLoginModal);
    }

    const closeLoginBtn = document.getElementById('closeLoginBtn');
    if (closeLoginBtn) {
        closeLoginBtn.addEventListener('click', closeRecruiterLoginModal);
    }

    const recruiterLoginForm = document.getElementById('recruiterLoginForm');
    if (recruiterLoginForm) {
        recruiterLoginForm.addEventListener('submit', handleRecruiterLogin);
    }

    // Close modal when clicking outside
    const recruiterLoginModal = document.getElementById('recruiterLoginModal');
    if (recruiterLoginModal) {
        recruiterLoginModal.addEventListener('click', (e) => {
            if (e.target === recruiterLoginModal) {
                closeRecruiterLoginModal();
            }
        });
    }

    // Dashboard - Generate Description
    const generateDescBtn = document.getElementById('generateDescBtn');
    if (generateDescBtn) {
        generateDescBtn.addEventListener('click', generateJobDescription);
    }

    // Dashboard - Add Questions
    const addTextQBtn = document.getElementById('addTextQBtn');
    if (addTextQBtn) {
        addTextQBtn.addEventListener('click', addTextQuestion);
    }

    const addMCQBtn = document.getElementById('addMCQBtn');
    if (addMCQBtn) {
        addMCQBtn.addEventListener('click', addMCQQuestion);
    }

    // Dashboard - Publish Job
    const publishJobBtn = document.getElementById('publishJobBtn');
    if (publishJobBtn) {
        publishJobBtn.addEventListener('click', publishJob);
    }

    // Dashboard - Close Applications
    const closeApplicationsBtn = document.getElementById('closeApplicationsBtn');
    if (closeApplicationsBtn) {
        closeApplicationsBtn.addEventListener('click', closeApplications);
    }

    // Dashboard - Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    // Applicant Form
    const applicationForm = document.getElementById('applicationForm');
    if (applicationForm) {
        applicationForm.addEventListener('submit', submitApplication);
    }

    // Profile Card - Real-time Updates
    const applicantNameInput = document.getElementById('applicantName');
    const applicantEmailInput = document.getElementById('applicantEmail');
    const applicantSkillsInput = document.getElementById('applicantSkills');
    const applicantExperienceInput = document.getElementById('applicantExperience');
    const applicantPhoneInput = document.getElementById('applicantPhone');
    const applicantPortfolioInput = document.getElementById('applicantPortfolio');

    if (applicantNameInput) {
        applicantNameInput.addEventListener('input', updateProfileCard);
    }
    if (applicantEmailInput) {
        applicantEmailInput.addEventListener('input', updateProfileCard);
    }
    if (applicantSkillsInput) {
        applicantSkillsInput.addEventListener('input', updateProfileCard);
    }
    if (applicantExperienceInput) {
        applicantExperienceInput.addEventListener('input', updateProfileCard);
    }
    if (applicantPhoneInput) {
        applicantPhoneInput.addEventListener('input', updateProfileCard);
    }
    if (applicantPortfolioInput) {
        applicantPortfolioInput.addEventListener('input', updateProfileCard);
    }

    // Profile Card - Action Buttons
    const previewBtn = document.getElementById('previewBtn');
    if (previewBtn) {
        previewBtn.addEventListener('click', previewApplication);
    }

    const clearBtn = document.getElementById('clearBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearForm);
    }

    // Recruiter Profile Buttons
    const editProfileBtn = document.getElementById('editProfileBtn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', openProfileEditModal);
    }

    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            showStatus('dashboardStatus', 'Settings panel coming soon!', 'success');
        });
    }

    // Profile Edit Modal Handlers
    const closeProfileEditBtn = document.getElementById('closeProfileEditBtn');
    if (closeProfileEditBtn) {
        closeProfileEditBtn.addEventListener('click', closeProfileEditModal);
    }

    const profileEditForm = document.getElementById('profileEditForm');
    if (profileEditForm) {
        profileEditForm.addEventListener('submit', handleProfileEditSubmit);
    }

    const cancelProfileEditBtn = document.getElementById('cancelProfileEditBtn');
    if (cancelProfileEditBtn) {
        cancelProfileEditBtn.addEventListener('click', closeProfileEditModal);
    }

    // Close profile edit modal when clicking outside
    const profileEditModal = document.getElementById('profileEditModal');
    if (profileEditModal) {
        profileEditModal.addEventListener('click', (e) => {
            if (e.target === profileEditModal) {
                closeProfileEditModal();
            }
        });
    }

    // Clear Jobs Button
    const clearJobsBtn = document.getElementById('clearJobsBtn');
    if (clearJobsBtn) {
        clearJobsBtn.addEventListener('click', clearAllJobs);
    }

    // Shortlist - Back to Dashboard
    const backToDashboardBtn = document.getElementById('backToDashboardBtn');
    if (backToDashboardBtn) {
        backToDashboardBtn.addEventListener('click', () => switchView('dashboard-view'));
    }
}

// ===================================
// PROFILE CARD UPDATES
// ===================================

function updateProfileCard() {
    const name = document.getElementById('applicantName').value || 'Your Name';
    const email = document.getElementById('applicantEmail').value || 'your@email.com';
    const skills = document.getElementById('applicantSkills').value;
    const experience = document.getElementById('applicantExperience').value || '0';
    const portfolio = document.getElementById('applicantPortfolio').value;

    // Update avatar with initials
    const initials = name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const profileAvatar = document.getElementById('profileAvatar');
    if (profileAvatar && name !== 'Your Name') {
        profileAvatar.innerHTML = initials || '<i class="fas fa-user"></i>';
    }

    // Update name and email
    document.getElementById('profileName').textContent = name;
    document.getElementById('profileEmail').textContent = email;

    // Update experience
    document.getElementById('profileExperience').textContent = `${experience} yrs`;

    // Update skills
    const skillsArray = skills
        .split(',')
        .map(s => s.trim())
        .filter(s => s);

    document.getElementById('profileSkillsCount').textContent = `${skillsArray.length} Skill${skillsArray.length !== 1 ? 's' : ''}`;

    const skillsDisplay = document.getElementById('skillsDisplay');
    if (skillsArray.length > 0) {
        skillsDisplay.innerHTML = skillsArray
            .map(skill => `<span class="skill-tag">${skill}</span>`)
            .join('');
    } else {
        skillsDisplay.innerHTML = '<p class="placeholder-text">Add skills in the form</p>';
    }

    // Update portfolio
    const portfolioLink = document.getElementById('portfolioLink');
    if (portfolio) {
        try {
            const url = new URL(portfolio);
            portfolioLink.innerHTML = `
                <a href="${portfolio}" target="_blank">
                    <i class="fas fa-external-link-alt"></i>
                    View Profile
                </a>
            `;
        } catch (e) {
            portfolioLink.innerHTML = '<p class="placeholder-text">Invalid URL</p>';
        }
    } else {
        portfolioLink.innerHTML = '<p class="placeholder-text">Add portfolio link</p>';
    }
}

function previewApplication() {
    const name = document.getElementById('applicantName').value;
    const email = document.getElementById('applicantEmail').value;
    const skills = document.getElementById('applicantSkills').value;
    const experience = document.getElementById('applicantExperience').value;
    const portfolio = document.getElementById('applicantPortfolio').value;

    if (!name || !email) {
        showStatus('applicantStatus', 'Please fill in your name and email to preview', 'error');
        return;
    }

    const preview = `
        <strong>Preview of Your Application:</strong><br><br>
        <strong>Name:</strong> ${name}<br>
        <strong>Email:</strong> ${email}<br>
        <strong>Experience:</strong> ${experience} years<br>
        <strong>Skills:</strong> ${skills}<br>
        ${portfolio ? `<strong>Portfolio:</strong> <a href="${portfolio}" target="_blank">${portfolio}</a>` : ''}
    `;

    showStatus('applicantStatus', preview, 'success');
}

function clearForm() {
    document.getElementById('applicationForm').reset();
    updateProfileCard();
    document.getElementById('profileAvatar').innerHTML = '<i class="fas fa-user"></i>';
    showStatus('applicantStatus', 'Form cleared successfully', 'success');
}

// ===================================
// AUTHENTICATION
// ===================================

// ===================================
// RECRUITER LOGIN MODAL
// ===================================

function openRecruiterLoginModal() {
    document.getElementById('recruiterLoginModal').classList.add('active');
}

function closeRecruiterLoginModal() {
    document.getElementById('recruiterLoginModal').classList.remove('active');
    document.getElementById('recruiterLoginForm').reset();
    document.getElementById('loginModalStatus').innerHTML = '';
}

function handleRecruiterLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('recruiterUsername').value;
    const password = document.getElementById('recruiterPassword').value;
    const statusDiv = document.getElementById('loginModalStatus');

    if (username === DEMO_USERNAME && password === DEMO_PASSWORD) {
        appState.recruiter.username = username;
        appState.recruiter.authenticated = true;
        
        statusDiv.className = 'login-modal-status success';
        statusDiv.innerHTML = '<i class="fas fa-check-circle"></i> Login successful!';
        
        setTimeout(() => {
            closeRecruiterLoginModal();
            updateRecruiterProfile();
            switchView('dashboard-view');
        }, 1000);
    } else {
        statusDiv.className = 'login-modal-status error';
        statusDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> Invalid credentials.';
        
        setTimeout(() => {
            statusDiv.className = '';
            statusDiv.innerHTML = '';
        }, 3000);
    }
}

function logout() {
    appState.recruiter.authenticated = false;
    appState.recruiter.username = null;
    if (appState.countdownInterval) {
        clearInterval(appState.countdownInterval);
    }
    switchView('applicant-view');
}


// ===================================
// VIEW MANAGEMENT
// ===================================

function switchView(viewId) {
    // Check authentication for protected views
    if ((viewId === 'dashboard-view' || viewId === 'shortlist-view') && !appState.recruiter.authenticated) {
        switchView('login-view');
        return;
    }

    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.add('hidden');
    });

    // Show selected view
    const view = document.getElementById(viewId);
    if (view) {
        view.classList.remove('hidden');

        // Update header for dashboard
        if (viewId === 'dashboard-view') {
            document.getElementById('userInfo').textContent = `Logged in as: ${appState.recruiter.username}`;
        }

        // Load applicant view specific content
        if (viewId === 'applicant-view') {
            loadApplicantView();
        }

        // Load shortlist view
        if (viewId === 'shortlist-view') {
            displayShortlist();
        }
    }
}

// ===================================
// JOB SETUP
// ===================================

function generateJobDescription() {
    const jobTitle = document.getElementById('jobTitle').value;
    const skills = document.getElementById('requiredSkills').value;
    const experience = document.getElementById('minExperience').value;
    const keywords = document.getElementById('jobKeywords').value;

    if (!jobTitle) {
        showStatus('dashboardStatus', 'Please enter a job title', 'error');
        return;
    }

    // Auto-generate description
    const description = `
        <h3>${jobTitle}</h3>
        <p><strong>About the Role:</strong></p>
        <p>${keywords || 'We are looking for a talented professional to join our team.'}</p>
        <p><strong>Required Skills:</strong> ${skills || 'Not specified'}</p>
        <p><strong>Minimum Experience:</strong> ${experience} years</p>
        <p><strong>What We're Looking For:</strong></p>
        <ul>
            <li>Strong technical expertise in the required areas</li>
            <li>Experience with modern development practices</li>
            <li>Excellent communication skills</li>
            <li>Team collaboration abilities</li>
        </ul>
    `;

    appState.job.title = jobTitle;
    appState.job.skills = skills;
    appState.job.experience = parseInt(experience);
    appState.job.keywords = keywords;
    appState.job.description = description;

    document.getElementById('generatedDescription').innerHTML = description;
    showStatus('dashboardStatus', 'Job description generated successfully!', 'success');
    
    saveToLocalStorage();
}

function publishJob() {
    if (!appState.job.title) {
        showStatus('dashboardStatus', 'Please set up job details first', 'error');
        return;
    }

    const days = parseInt(document.getElementById('deadlineDays').value) || 0;
    const hours = parseInt(document.getElementById('deadlineHours').value) || 0;

    if (days === 0 && hours === 0) {
        showStatus('dashboardStatus', 'Please set an application deadline', 'error');
        return;
    }

    // Calculate deadline
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + days);
    deadline.setHours(deadline.getHours() + hours);

    appState.job.deadline = deadline.getTime();
    appState.job.active = true;
    appState.job.closed = false;
    appState.applicants = [];  // Reset applicants

    showStatus('dashboardStatus', 'Job published! Switching to applicant view...', 'success');
    
    updateRecruiterProfile();
    saveToLocalStorage();
    
    setTimeout(() => {
        startCountdown();
        switchView('applicant-view');
    }, 1500);
}

function closeApplications() {
    appState.job.active = false;
    appState.job.closed = true;
    
    if (appState.countdownInterval) {
        clearInterval(appState.countdownInterval);
    }

    showStatus('dashboardStatus', 'Applications closed. Generating shortlist...', 'success');
    
    saveToLocalStorage();
    
    setTimeout(() => {
        switchView('shortlist-view');
    }, 1500);
}

// ===================================
// QUESTION MANAGEMENT
// ===================================

function addTextQuestion() {
    const questionText = document.getElementById('textQuestion').value;

    if (!questionText.trim()) {
        showStatus('dashboardStatus', 'Please enter a question', 'error');
        return;
    }

    const question = {
        id: Date.now(),
        type: 'text',
        text: questionText,
        options: []
    };

    appState.questions.push(question);
    document.getElementById('textQuestion').value = '';
    renderQuestions();
    showStatus('dashboardStatus', 'Text question added!', 'success');
    
    saveToLocalStorage();
}

function addMCQQuestion() {
    const questionText = document.getElementById('mcqQuestion').value;
    const optionInputs = document.querySelectorAll('.mcq-option');
    const options = Array.from(optionInputs)
        .map(input => input.value.trim())
        .filter(opt => opt);

    if (!questionText.trim()) {
        showStatus('dashboardStatus', 'Please enter the MCQ question', 'error');
        return;
    }

    if (options.length < 2) {
        showStatus('dashboardStatus', 'Please provide at least 2 options', 'error');
        return;
    }

    const question = {
        id: Date.now(),
        type: 'mcq',
        text: questionText,
        options: options
    };

    appState.questions.push(question);
    document.getElementById('mcqQuestion').value = '';
    document.querySelectorAll('.mcq-option').forEach(input => input.value = '');
    renderQuestions();
    showStatus('dashboardStatus', 'MCQ question added!', 'success');
    
    saveToLocalStorage();
}

function deleteQuestion(questionId) {
    appState.questions = appState.questions.filter(q => q.id !== questionId);
    renderQuestions();
    showStatus('dashboardStatus', 'Question deleted', 'success');
    
    saveToLocalStorage();
}

function renderQuestions() {
    const questionsList = document.getElementById('questionsList');

    if (appState.questions.length === 0) {
        questionsList.innerHTML = '<p class="empty-state">No questions added yet. Add your first question below.</p>';
        return;
    }

    questionsList.innerHTML = appState.questions.map(q => `
        <div class="question-item">
            <div class="question-content">
                <span class="question-type">${q.type.toUpperCase()}</span>
                <p class="question-text">${q.text}</p>
                ${q.options.length > 0 ? `<p class="question-options">Options: ${q.options.join(', ')}</p>` : ''}
            </div>
            <div class="question-actions">
                <button type="button" class="btn-sm btn-danger" onclick="deleteQuestion(${q.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

// ===================================
// APPLICANT VIEW
// ===================================

function loadApplicantView() {
    // Display job title and description
    document.getElementById('jobTitleDisplay').textContent = appState.job.title;
    document.getElementById('jobDescriptionDisplay').innerHTML = appState.job.description;

    // Display job metadata
    const jobMetaHtml = `
        <div class="job-meta-item">
            <div class="job-meta-label">Required Skills</div>
            <div class="job-meta-value">${appState.job.skills || 'Not specified'}</div>
        </div>
        <div class="job-meta-item">
            <div class="job-meta-label">Min Experience</div>
            <div class="job-meta-value">${appState.job.experience} years</div>
        </div>
        <div class="job-meta-item">
            <div class="job-meta-label">Status</div>
            <div class="job-meta-value">${appState.job.active ? 'Open' : 'Closed'}</div>
        </div>
    `;
    document.getElementById('jobMeta').innerHTML = jobMetaHtml;

    // Render custom questions
    renderCustomQuestions();

    // Initialize profile card
    updateProfileCard();

    // Start countdown
    startCountdown();
}

// ===================================
// RECRUITER PROFILE UPDATES
// ===================================

function updateRecruiterProfile() {
    // Update recruiter name
    document.getElementById('recruiterName').textContent = appState.recruiter.username 
        ? appState.recruiter.username.charAt(0).toUpperCase() + appState.recruiter.username.slice(1)
        : 'Hiring Team';
    
    // Update recruiter avatar with initials
    const username = appState.recruiter.username || 'HT';
    const initials = username
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    
    const recruiterAvatar = document.getElementById('recruiterAvatar');
    if (recruiterAvatar && username !== 'recruiter') {
        recruiterAvatar.innerHTML = initials;
    }

    // Update stats
    const activeJobsCount = appState.job.active ? 1 : 0;
    const applicantsCount = appState.applicants.length;

    document.getElementById('activeJobsCount').textContent = activeJobsCount;
    document.getElementById('applicantsCount').textContent = applicantsCount;

    // Update user info in header
    document.getElementById('userInfo').textContent = `Logged in as: ${appState.recruiter.username}`;
}

// ===================================
// PROFILE EDITING FUNCTIONS
// ===================================

function openProfileEditModal() {
    const modal = document.getElementById('profileEditModal');
    if (modal) {
        // Populate current values
        document.getElementById('editRecruiterName').value = 
            appState.recruiter.name || 'Hiring Team';
        document.getElementById('editRecruiterRole').value = 
            appState.recruiter.role || 'Recruitment Manager';
        document.getElementById('editRecruiterCompany').value = 
            appState.recruiter.company || 'Your Company';
        
        modal.classList.add('active');
    }
}

function closeProfileEditModal() {
    const modal = document.getElementById('profileEditModal');
    if (modal) {
        modal.classList.remove('active');
        // Clear status message
        document.getElementById('profileEditStatus').className = 'profile-edit-status';
        document.getElementById('profileEditStatus').innerHTML = '';
    }
}

function handleProfileEditSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('editRecruiterName').value;
    const role = document.getElementById('editRecruiterRole').value;
    const company = document.getElementById('editRecruiterCompany').value;

    if (!name || !role || !company) {
        showProfileEditStatus('Please fill in all fields', 'error');
        return;
    }

    // Update app state
    appState.recruiter.name = name;
    appState.recruiter.role = role;
    appState.recruiter.company = company;

    // Update UI
    document.getElementById('recruiterName').textContent = name;
    document.getElementById('recruiterRole').textContent = role;
    document.getElementById('recruiterCompany').textContent = company;

    // Save to localStorage
    saveToLocalStorage();

    // Show success message
    showProfileEditStatus('Profile updated successfully!', 'success');

    // Close modal after 1.5 seconds
    setTimeout(() => {
        closeProfileEditModal();
    }, 1500);
}

function showProfileEditStatus(message, type) {
    const statusElement = document.getElementById('profileEditStatus');
    if (statusElement) {
        statusElement.className = `profile-edit-status ${type}`;
        statusElement.innerHTML = type === 'success' 
            ? `<i class="fas fa-check-circle"></i> ${message}`
            : `<i class="fas fa-exclamation-circle"></i> ${message}`;
    }
}

// ===================================
// CLEAR JOBS FUNCTION
// ===================================

function clearAllJobs() {
    if (!confirm('Are you sure you want to clear all jobs and applicants? This action cannot be undone.')) {
        return;
    }

    // Reset job data
    appState.job = {
        title: '',
        skills: '',
        experience: 0,
        keywords: '',
        description: '',
        deadline: null,
        active: false,
        closed: false
    };

    // Clear applicants
    appState.applicants = [];

    // Clear UI
    document.getElementById('jobTitle').value = '';
    document.getElementById('requiredSkills').value = '';
    document.getElementById('minExperience').value = '0';
    document.getElementById('jobKeywords').value = '';
    document.getElementById('generatedDescription').innerHTML = 
        '<p style="color: var(--text-tertiary); font-style: italic;">Job description will appear here after you save.</p>';

    // Update profile stats
    document.getElementById('activeJobsCount').textContent = '0';
    document.getElementById('applicantsCount').textContent = '0';

    // Save to localStorage
    saveToLocalStorage();

    // Show success message
    showStatus('dashboardStatus', 'All jobs and applicants have been cleared successfully!', 'success');
}

function renderCustomQuestions() {
    const container = document.getElementById('customQuestionsContainer');

    if (appState.questions.length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = '<h3 style="margin-bottom: 1rem; color: var(--text-secondary);">Custom Questions</h3>' + 
        appState.questions.map(q => {
            if (q.type === 'text') {
                return `
                    <div class="custom-question">
                        <label class="custom-question-label">${q.text}</label>
                        <input type="text" class="custom-question-input" name="answer_${q.id}" placeholder="Your answer...">
                    </div>
                `;
            } else {
                return `
                    <div class="custom-question">
                        <label class="custom-question-label">${q.text}</label>
                        <select class="custom-question-select" name="answer_${q.id}">
                            <option value="">Select an option...</option>
                            ${q.options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                        </select>
                    </div>
                `;
            }
        }).join('');
}

function submitApplication(e) {
    e.preventDefault();

    const name = document.getElementById('applicantName').value;
    const email = document.getElementById('applicantEmail').value;
    const skills = document.getElementById('applicantSkills').value;
    const experience = parseInt(document.getElementById('applicantExperience').value);
    const phone = document.getElementById('applicantPhone').value;
    const portfolio = document.getElementById('applicantPortfolio').value;

    // Collect custom question answers
    const answers = {};
    appState.questions.forEach(q => {
        const input = document.querySelector(`[name="answer_${q.id}"]`);
        if (input) {
            answers[q.id] = {
                question: q.text,
                answer: input.value,
                type: q.type
            };
        }
    });

    // Calculate match score
    const score = calculateMatchScore({
        skills,
        experience,
        answers
    });

    const applicant = {
        id: Date.now(),
        name,
        email,
        skills,
        experience,
        phone,
        portfolio,
        answers,
        score,
        submittedAt: new Date().getTime()
    };

    appState.applicants.push(applicant);
    
    const statusDiv = document.getElementById('applicantStatus');
    statusDiv.className = 'status-message success';
    statusDiv.innerHTML = '<i class="fas fa-check-circle"></i> Application submitted successfully!';

    document.getElementById('applicationForm').reset();

    setTimeout(() => {
        statusDiv.className = '';
        statusDiv.innerHTML = '';
    }, 3000);

    updateRecruiterProfile();
    saveToLocalStorage();
}

// ===================================
// SCORING ALGORITHM
// ===================================

function calculateMatchScore(applicant) {
    let score = 0;
    let maxScore = 100;

    // Score based on experience
    const experienceDiff = applicant.experience - appState.job.experience;
    const experienceScore = Math.min(40, Math.max(0, (experienceDiff / 5) * 40 + 20));
    score += experienceScore;

    // Score based on skills match
    const requiredSkills = appState.job.skills.toLowerCase().split(',').map(s => s.trim());
    const applicantSkills = applicant.skills.toLowerCase().split(',').map(s => s.trim());
    
    let skillMatches = 0;
    applicantSkills.forEach(skill => {
        if (requiredSkills.some(rs => skill.includes(rs) || rs.includes(skill))) {
            skillMatches++;
        }
    });

    const skillScore = (skillMatches / Math.max(1, requiredSkills.length)) * 40;
    score += skillScore;

    // Score based on answers to custom questions
    const answerScore = Object.values(applicant.answers).length > 0 ? 20 : 0;
    score += answerScore;

    return Math.round(score);
}

// ===================================
// SHORTLIST GENERATION
// ===================================

function displayShortlist() {
    const sorted = [...appState.applicants].sort((a, b) => b.score - a.score);
    const topCount = Math.ceil(sorted.length * 0.2) || 1;  // Top 20%
    const topCandidates = sorted.slice(0, topCount);

    document.getElementById('topPercentage').textContent = '20';

    const candidatesList = document.getElementById('candidatesList');

    if (topCandidates.length === 0) {
        candidatesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>No applications received yet.</p>
            </div>
        `;
        return;
    }

    candidatesList.innerHTML = topCandidates.map((candidate, index) => `
        <div class="candidate-card">
            ${index === 0 ? '<div class="top-candidate-badge"><i class="fas fa-crown"></i> Top Match</div>' : ''}
            <div class="card-header">
                <div class="card-avatar">${candidate.name.charAt(0).toUpperCase()}</div>
                <div class="card-header-text">
                    <div class="card-name">${candidate.name}</div>
                    <div class="card-email">${candidate.email}</div>
                </div>
            </div>

            <div class="score-section">
                <div class="score-label">Match Score</div>
                <div class="score-value">${candidate.score}%</div>
                <div class="score-bar">
                    <div class="score-fill" style="width: ${candidate.score}%"></div>
                </div>
            </div>

            <div style="background: rgba(0, 188, 212, 0.05); border-left: 3px solid var(--accent-blue); border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                <div class="score-label">Experience</div>
                <div style="font-size: 1.1rem; font-weight: 600; color: var(--accent-blue);">${candidate.experience} years</div>
            </div>

            <div style="background: rgba(0, 188, 212, 0.05); border-left: 3px solid var(--accent-blue); border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                <div class="score-label">Skills</div>
                <div style="font-size: 0.95rem; color: var(--text-secondary);">${candidate.skills}</div>
            </div>

            ${candidate.portfolio ? `
                <div style="background: rgba(0, 188, 212, 0.05); border-left: 3px solid var(--accent-blue); border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                    <div class="score-label">Portfolio</div>
                    <a href="${candidate.portfolio}" target="_blank" style="color: var(--accent-cyan); text-decoration: none;">View Portfolio →</a>
                </div>
            ` : ''}

            ${Object.keys(candidate.answers).length > 0 ? `
                <div class="answers-section">
                    <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 0.75rem;">Answers to Questions</div>
                    ${Object.values(candidate.answers).map(answer => `
                        <div class="answer-item">
                            <div class="answer-question">${answer.question}</div>
                            <div class="answer-value">${answer.answer}</div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        </div>
    `).join('');
}

// ===================================
// COUNTDOWN TIMER
// ===================================

function startCountdown() {
    const timerSection = document.getElementById('timerSection');
    if (!timerSection || !appState.job.deadline) {
        return;
    }

    function updateTimer() {
        const now = new Date().getTime();
        const difference = appState.job.deadline - now;

        if (difference <= 0) {
            clearInterval(appState.countdownInterval);
            timerSection.querySelector('.timer-card').classList.add('timer-inactive');
            if (!appState.job.closed) {
                // Auto-close after deadline
                closeApplications();
            }
            return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

        document.getElementById('timerDays').textContent = days;
        document.getElementById('timerHours').textContent = hours;
        document.getElementById('timerMinutes').textContent = minutes;
    }

    updateTimer();
    appState.countdownInterval = setInterval(updateTimer, 1000);
}

// ===================================
// UTILITIES
// ===================================

function showStatus(elementId, message, type) {
    const element = document.getElementById(elementId);
    if (!element) return;

    element.className = `status-message ${type}`;
    element.innerHTML = type === 'success' 
        ? `<i class="fas fa-check-circle"></i> ${message}`
        : `<i class="fas fa-exclamation-circle"></i> ${message}`;

    setTimeout(() => {
        element.className = '';
        element.innerHTML = '';
    }, 4000);
}

// ===================================
// LOCAL STORAGE
// ===================================

function saveToLocalStorage() {
    localStorage.setItem('smartHiringFilter', JSON.stringify(appState));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('smartHiringFilter');
    if (saved) {
        const data = JSON.parse(saved);
        Object.assign(appState, data);

        // Re-render if on dashboard
        if (appState.recruiter.authenticated) {
            renderQuestions();
            if (appState.job.description) {
                document.getElementById('generatedDescription').innerHTML = appState.job.description;
            }
        }
    }
}
