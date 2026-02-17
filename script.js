// Conversation State
const conversationState = {
    currentPhase: 1,
    currentQuestion: 0,
    data: {},
    awaitingMultiSelect: false,
    multiSelectKey: null,
    multiSelectValues: []
};

// Question Flow Definition
const questionFlow = [
    // Phase 1: Client & Project Basics
    {
        phase: 1,
        question: "Hi! 👋 What's the name of the company we're preparing the proposal for?",
        key: "companyName",
        type: "text"
    },
    {
        phase: 1,
        question: "Great! Who's the main point of contact? Please provide their name and designation (e.g., Mr. Rajesh Sharma, Sales Head)",
        key: "contactPerson",
        type: "text"
    },
    {
        phase: 1,
        question: "To make this proposal spot-on, tell me a bit more about the business:\n\n• What does the company primarily do? (e.g., Chai franchise chain, Financial advisory, Real estate)\n• What are your main products or services?\n• Who is your target customer?",
        key: "businessOverview",
        type: "text"
    },
    {
        phase: 1,
        question: "What's your current sales process like? (e.g., From inquiry → demo → proposal → closure)\n\nAnd what tools/systems are you using right now for leads and customer data?",
        key: "currentProcess",
        type: "text"
    },
    {
        phase: 1,
        question: "How many people will be using Bigin in total?\n\nPlease provide a quick breakdown:\n• Sales/BD: __\n• Managers: __\n• Support: __\n• Others: __",
        key: "teamSize",
        type: "text"
    },
    {
        phase: 1,
        question: "What's the biggest challenge your team faces today? (e.g., Lead leakage, no follow-up tracking, manual reporting, data scattered everywhere)",
        key: "painPoints",
        type: "text",
        summary: true,
        summaryText: (data) => `Got it! So ${data.companyName} is targeting ${data.businessOverview.split('\n')[2] || 'various customers'}, with ${data.teamSize.split('\n')[1]?.trim() || 'multiple'} users. Main pains: ${data.painPoints}`
    },

    // Phase 2: Core Customization
    {
        phase: 2,
        question: "Which modules need heavy customization? (Select all that apply)",
        key: "modules",
        type: "multi-select",
        options: ["Contacts", "Companies", "Deals", "Products", "Tasks", "Activities", "Reports", "Others"]
    },
    {
        phase: 2,
        question: "Any special custom fields you want? (e.g., Franchise Code, Loan Type, Source of Lead, EMI Details, etc.)\n\nType them separated by commas, or type 'None' if not needed.",
        key: "customFields",
        type: "text"
    },
    {
        phase: 2,
        question: "How many sales pipelines do you need? (e.g., 1 for Retail, 1 for Franchise, 1 for Corporate)",
        key: "pipelineCount",
        type: "single-select",
        options: ["1", "2", "3", "4+"]
    },
    {
        phase: 2,
        question: "For your pipeline(s), tell me the stages in order.\n\nExample: New → Qualified → Proposal → Negotiation → Closed Won\n\n(If multiple pipelines, separate each pipeline with a semicolon)",
        key: "pipelineStages",
        type: "text",
        summary: true,
        summaryText: (data) => `Modules: ${data.modules.join(', ')}. Pipelines: ${data.pipelineCount}. Custom fields: ${data.customFields}`
    },

    // Phase 3: Lead Generation & Integrations
    {
        phase: 3,
        question: "From where do you get leads today? (Select all that apply)",
        key: "leadSources",
        type: "multi-select",
        options: ["Facebook Lead Ads", "Instagram", "LinkedIn", "Google Ads", "IndiaMART", "TradeIndia", "Website", "WhatsApp", "Walk-ins", "Referrals", "Others"]
    },
    {
        phase: 3,
        question: "Do you want WhatsApp Business API integration with Bigin?",
        key: "whatsappIntegration",
        type: "single-select",
        options: ["Yes", "No", "Maybe later"]
    },
    {
        phase: 3,
        question: "Any other integrations needed? (e.g., Zoho Books, Google Sheets, Zoho Inventory, etc.)\n\nType them separated by commas, or type 'None' if not needed.",
        key: "otherIntegrations",
        type: "text",
        summary: true,
        summaryText: (data) => `Leads from: ${data.leadSources.join(', ')}. WhatsApp: ${data.whatsappIntegration}. Other integrations: ${data.otherIntegrations}`
    },

    // Phase 4: Automation & Smart Features
    {
        phase: 4,
        question: "Should leads be auto-assigned to team members? (Based on city, product, source, etc.)",
        key: "autoAssignment",
        type: "single-select",
        options: ["Yes", "No"]
    },
    {
        phase: 4,
        question: "What automatic actions do you want? (Select all that apply)",
        key: "automations",
        type: "multi-select",
        options: ["Task creation on stage change", "Email or SMS reminders", "Notification to owner on high-value deals", "Auto follow-up sequences", "Lead scoring", "Others"]
    },
    {
        phase: 4,
        question: "Any specific alerts needed? (e.g., Deal value > ₹5L → notify owner)\n\nType them, or type 'None' if not needed.",
        key: "alerts",
        type: "text",
        summary: true,
        summaryText: (data) => `Auto-assignment: ${data.autoAssignment}. Automations: ${data.automations.join(', ')}. Alerts: ${data.alerts}`
    },

    // Phase 5: Reports & Dashboards
    {
        phase: 5,
        question: "Which reports are important to you? (Select 5-15 reports)",
        key: "reports",
        type: "multi-select",
        options: ["Daily activity report", "Lead source wise report", "User-wise performance", "Pipeline health", "Conversion ratio", "EOD summary", "Revenue forecast", "Lost deals analysis", "Response time metrics", "Team productivity", "Others"]
    },
    {
        phase: 5,
        question: "Any custom dashboard requirements? (Describe what metrics you want to see at a glance, or type 'Standard' for default dashboards)",
        key: "dashboards",
        type: "text",
        summary: true,
        summaryText: (data) => `Selected ${data.reports.length} reports. Dashboard: ${data.dashboards}`
    },

    // Phase 6: Training & Support
    {
        phase: 6,
        question: "Training needs:\n\nHow many hours of training for:\n• Sales team: __ hours\n• Admin: __ hours\n• Owner/Senior management session? (Yes/No)",
        key: "training",
        type: "text"
    },
    {
        phase: 6,
        question: "How many months of hand-holding support do you want? (This affects pricing)",
        key: "supportDuration",
        type: "single-select",
        options: ["1 Month", "3 Months", "6 Months", "12 Months"]
    },
    {
        phase: 6,
        question: "Should we create a WhatsApp supervision group for daily coordination?",
        key: "whatsappGroup",
        type: "single-select",
        options: ["Yes", "No"],
        summary: true,
        summaryText: (data) => `Training: ${data.training}. Support: ${data.supportDuration}. WhatsApp group: ${data.whatsappGroup}`
    },

    // Phase 7: Data & Go-Live
    {
        phase: 7,
        question: "Do you have existing data to import?",
        key: "dataMigration",
        type: "single-select",
        options: ["Only basic (Name/Phone/Email) → Free", "Full history → Paid", "No existing data"]
    },
    {
        phase: 7,
        question: "Who will be the main person we coordinate with? (Should be tech-savvy)\n\nPlease provide: Name + Mobile number",
        key: "spoc",
        type: "text"
    },
    {
        phase: 7,
        question: "Perfect! Let me show you a complete summary of everything we've discussed. Please review and let me know if you'd like to edit anything.",
        key: "finalReview",
        type: "final",
        summary: true,
        summaryText: () => "✅ All information collected! Review the summary on the right."
    }
];

// DOM Elements
const messagesContainer = document.getElementById('messages');
const inputArea = document.getElementById('input-area');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const typingIndicator = document.getElementById('typing-indicator');
const summaryContent = document.getElementById('summary-content');
const downloadBtn = document.getElementById('download-btn');
const progressFill = document.getElementById('progress-fill');
const currentPhaseEl = document.getElementById('current-phase');
const toggleSummaryBtn = document.getElementById('toggle-summary');

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        askQuestion();
    }, 500);
});

// Ask Current Question
function askQuestion() {
    const currentQ = questionFlow[conversationState.currentQuestion];
    
    if (!currentQ) {
        finishConversation();
        return;
    }

    // Update phase
    if (currentQ.phase !== conversationState.currentPhase) {
        conversationState.currentPhase = currentQ.phase;
        updateProgress();
    }

    showTyping();
    
    setTimeout(() => {
        hideTyping();
        addBotMessage(currentQ.question);
        
        if (currentQ.type === 'single-select' || currentQ.type === 'multi-select') {
            addOptions(currentQ.options, currentQ.type);
        } else if (currentQ.type === 'text') {
            showInput();
        } else if (currentQ.type === 'final') {
            showFinalSummary();
        }
    }, 1500);
}

// Add Bot Message
function addBotMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot';
    messageDiv.innerHTML = `
        <div class="avatar">🤖</div>
        <div class="message-content">${text.replace(/\n/g, '<br>')}</div>
    `;
    messagesContainer.appendChild(messageDiv);
    scrollToBottom();
}

// Add User Message
function addUserMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user';
    messageDiv.innerHTML = `
        <div class="avatar">👤</div>
        <div class="message-content">${text.replace(/\n/g, '<br>')}</div>
    `;
    messagesContainer.appendChild(messageDiv);
    scrollToBottom();
}

// Add Options
function addOptions(options, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot';
    
    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'button-group';
    
    options.forEach(option => {
        const btn = document.createElement('button');
        btn.className = type === 'multi-select' ? 'option-btn multi-select-btn' : 'option-btn';
        btn.textContent = option;
        btn.onclick = () => handleOptionClick(option, type, btn);
        buttonGroup.appendChild(btn);
    });
    
    messageDiv.innerHTML = '<div class="avatar">🤖</div><div class="message-content"></div>';
    messageDiv.querySelector('.message-content').appendChild(buttonGroup);
    
    if (type === 'multi-select') {
        conversationState.awaitingMultiSelect = true;
        conversationState.multiSelectKey = questionFlow[conversationState.currentQuestion].key;
        conversationState.multiSelectValues = [];
        
        // Add Done button
        const doneBtn = document.createElement('button');
        doneBtn.className = 'option-btn';
        doneBtn.textContent = '✓ Done';
        doneBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        doneBtn.style.borderColor = '#10b981';
        doneBtn.onclick = () => handleMultiSelectDone();
        buttonGroup.appendChild(doneBtn);
    }
    
    messagesContainer.appendChild(messageDiv);
    scrollToBottom();
}

// Handle Option Click
function handleOptionClick(option, type, btn) {
    if (type === 'single-select') {
        // Disable all buttons
        const allBtns = btn.parentElement.querySelectorAll('.option-btn');
        allBtns.forEach(b => b.disabled = true);
        btn.classList.add('selected');
        
        addUserMessage(option);
        saveAnswer(option);
        
        setTimeout(() => {
            conversationState.currentQuestion++;
            askQuestion();
        }, 800);
    } else if (type === 'multi-select') {
        btn.classList.toggle('selected');
        
        if (btn.classList.contains('selected')) {
            if (!conversationState.multiSelectValues.includes(option)) {
                conversationState.multiSelectValues.push(option);
            }
        } else {
            conversationState.multiSelectValues = conversationState.multiSelectValues.filter(v => v !== option);
        }
    }
}

// Handle Multi-Select Done
function handleMultiSelectDone() {
    if (conversationState.multiSelectValues.length === 0) {
        alert('Please select at least one option');
        return;
    }
    
    const allBtns = document.querySelectorAll('.option-btn');
    allBtns.forEach(b => b.disabled = true);
    
    addUserMessage(conversationState.multiSelectValues.join(', '));
    saveAnswer(conversationState.multiSelectValues);
    
    conversationState.awaitingMultiSelect = false;
    conversationState.multiSelectValues = [];
    
    setTimeout(() => {
        conversationState.currentQuestion++;
        askQuestion();
    }, 800);
}

// Show Input
function showInput() {
    inputArea.style.display = 'flex';
    userInput.focus();
}

// Hide Input
function hideInput() {
    inputArea.style.display = 'none';
    userInput.value = '';
}

// Show/Hide Typing
function showTyping() {
    typingIndicator.classList.add('active');
}

function hideTyping() {
    typingIndicator.classList.remove('active');
}

// Handle Send
sendBtn.addEventListener('click', handleSend);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSend();
});

function handleSend() {
    const text = userInput.value.trim();
    if (!text) return;
    
    addUserMessage(text);
    saveAnswer(text);
    hideInput();
    
    setTimeout(() => {
        conversationState.currentQuestion++;
        askQuestion();
    }, 800);
}

// Save Answer
function saveAnswer(answer) {
    const currentQ = questionFlow[conversationState.currentQuestion];
    conversationState.data[currentQ.key] = answer;
    
    updateSummary();
    
    if (currentQ.summary) {
        showTyping();
        setTimeout(() => {
            hideTyping();
            const summaryText = currentQ.summaryText(conversationState.data);
            addBotMessage(summaryText);
        }, 1000);
    }
}

// Update Summary Panel
function updateSummary() {
    const phases = {
        1: { title: "Client & Project Basics", keys: ["companyName", "contactPerson", "businessOverview", "currentProcess", "teamSize", "painPoints"] },
        2: { title: "Core Customization", keys: ["modules", "customFields", "pipelineCount", "pipelineStages"] },
        3: { title: "Lead Generation & Integrations", keys: ["leadSources", "whatsappIntegration", "otherIntegrations"] },
        4: { title: "Automation & Smart Features", keys: ["autoAssignment", "automations", "alerts"] },
        5: { title: "Reports & Dashboards", keys: ["reports", "dashboards"] },
        6: { title: "Training & Support", keys: ["training", "supportDuration", "whatsappGroup"] },
        7: { title: "Data & Go-Live", keys: ["dataMigration", "spoc"] }
    };
    
    let html = '';
    
    for (let phase in phases) {
        const phaseData = phases[phase];
        const hasData = phaseData.keys.some(key => conversationState.data[key]);
        
        if (hasData) {
            html += `<div class="summary-section">`;
            html += `<h4>Phase ${phase}: ${phaseData.title}</h4>`;
            
            phaseData.keys.forEach(key => {
                if (conversationState.data[key]) {
                    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                    const value = Array.isArray(conversationState.data[key]) 
                        ? conversationState.data[key].join(', ') 
                        : conversationState.data[key];
                    html += `<p><strong>${label}:</strong> ${value.replace(/\n/g, '<br>')}</p>`;
                }
            });
            
            html += `</div>`;
        }
    }
    
    if (html) {
        summaryContent.innerHTML = html;
        downloadBtn.style.display = 'block';
    }
}

// Update Progress
function updateProgress() {
    currentPhaseEl.textContent = conversationState.currentPhase;
    const progress = (conversationState.currentPhase / 7) * 100;
    progressFill.style.width = progress + '%';
}

// Show Final Summary
function showFinalSummary() {
    downloadBtn.style.display = 'block';
    
    setTimeout(() => {
        showTyping();
        setTimeout(() => {
            hideTyping();
            addBotMessage("🎉 Excellent! We've gathered all the information needed for your Bigin CRM proposal.\n\nYou can download the complete summary using the button on the right. Thank you!");
        }, 1500);
    }, 1000);
}

// Finish Conversation
function finishConversation() {
    addBotMessage("Thank you for providing all the details! Your proposal summary is ready for download. 📥");
}

// Download Summary
downloadBtn.addEventListener('click', () => {
    const data = conversationState.data;
    
    let text = '='.repeat(60) + '\n';
    text += 'BIGIN CRM PROPOSAL - CLIENT INFORMATION SUMMARY\n';
    text += '='.repeat(60) + '\n\n';
    
    text += `Company: ${data.companyName || 'N/A'}\n`;
    text += `Contact Person: ${data.contactPerson || 'N/A'}\n`;
    text += `Date: ${new Date().toLocaleDateString()}\n\n`;
    
    text += '-'.repeat(60) + '\n';
    text += 'PHASE 1: CLIENT & PROJECT BASICS\n';
    text += '-'.repeat(60) + '\n';
    text += `Business Overview: ${data.businessOverview || 'N/A'}\n`;
    text += `Current Process: ${data.currentProcess || 'N/A'}\n`;
    text += `Team Size: ${data.teamSize || 'N/A'}\n`;
    text += `Pain Points: ${data.painPoints || 'N/A'}\n\n`;
    
    text += '-'.repeat(60) + '\n';
    text += 'PHASE 2: CORE CUSTOMIZATION\n';
    text += '-'.repeat(60) + '\n';
    text += `Modules: ${Array.isArray(data.modules) ? data.modules.join(', ') : 'N/A'}\n`;
    text += `Custom Fields: ${data.customFields || 'N/A'}\n`;
    text += `Pipeline Count: ${data.pipelineCount || 'N/A'}\n`;
    text += `Pipeline Stages: ${data.pipelineStages || 'N/A'}\n\n`;
    
    text += '-'.repeat(60) + '\n';
    text += 'PHASE 3: LEAD GENERATION & INTEGRATIONS\n';
    text += '-'.repeat(60) + '\n';
    text += `Lead Sources: ${Array.isArray(data.leadSources) ? data.leadSources.join(', ') : 'N/A'}\n`;
    text += `WhatsApp Integration: ${data.whatsappIntegration || 'N/A'}\n`;
    text += `Other Integrations: ${data.otherIntegrations || 'N/A'}\n\n`;
    
    text += '-'.repeat(60) + '\n';
    text += 'PHASE 4: AUTOMATION & SMART FEATURES\n';
    text += '-'.repeat(60) + '\n';
    text += `Auto Assignment: ${data.autoAssignment || 'N/A'}\n`;
    text += `Automations: ${Array.isArray(data.automations) ? data.automations.join(', ') : 'N/A'}\n`;
    text += `Alerts: ${data.alerts || 'N/A'}\n\n`;
    
    text += '-'.repeat(60) + '\n';
    text += 'PHASE 5: REPORTS & DASHBOARDS\n';
    text += '-'.repeat(60) + '\n';
    text += `Reports: ${Array.isArray(data.reports) ? data.reports.join(', ') : 'N/A'}\n`;
    text += `Dashboards: ${data.dashboards || 'N/A'}\n\n`;
    
    text += '-'.repeat(60) + '\n';
    text += 'PHASE 6: TRAINING & SUPPORT\n';
    text += '-'.repeat(60) + '\n';
    text += `Training: ${data.training || 'N/A'}\n`;
    text += `Support Duration: ${data.supportDuration || 'N/A'}\n`;
    text += `WhatsApp Group: ${data.whatsappGroup || 'N/A'}\n\n`;
    
    text += '-'.repeat(60) + '\n';
    text += 'PHASE 7: DATA & GO-LIVE\n';
    text += '-'.repeat(60) + '\n';
    text += `Data Migration: ${data.dataMigration || 'N/A'}\n`;
    text += `SPOC: ${data.spoc || 'N/A'}\n\n`;
    
    text += '='.repeat(60) + '\n';
    text += 'END OF SUMMARY\n';
    text += '='.repeat(60) + '\n';
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bigin_CRM_Proposal_${data.companyName?.replace(/\s+/g, '_') || 'Client'}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
});

// Toggle Summary Panel
toggleSummaryBtn.addEventListener('click', () => {
    const content = document.querySelector('.summary-content');
    const isCollapsed = content.style.display === 'none';
    
    content.style.display = isCollapsed ? 'block' : 'none';
    toggleSummaryBtn.textContent = isCollapsed ? '−' : '+';
});

// Scroll to Bottom
function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
