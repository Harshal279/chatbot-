import streamlit as st
from datetime import datetime
import os
from openai import OpenAI
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()

# Page Configuration
st.set_page_config(
    page_title="Bigin CRM Proposal Assistant",
    page_icon="💼",
    layout="wide"
)

# Custom CSS
st.markdown("""
<style>
    .main {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .stApp {
        background: transparent;
    }
    .chat-message {
        padding: 1rem 1.5rem;
        border-radius: 1rem;
        margin-bottom: 1rem;
        animation: slideIn 0.3s ease-out;
    }
    @keyframes slideIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .chat-message.user {
        background: linear-gradient(135deg, #6366f1, #4f46e5);
        color: white;
        margin-left: 20%;
    }
    .chat-message.assistant {
        background: rgba(255, 255, 255, 0.95);
        color: #1e293b;
        margin-right: 20%;
    }
    .phase-badge {
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        font-weight: 600;
        display: inline-block;
        margin-bottom: 1rem;
    }
    .summary-box {
        background: rgba(255, 255, 255, 0.95);
        padding: 1.5rem;
        border-radius: 1rem;
        margin: 1rem 0;
    }
</style>
""", unsafe_allow_html=True)

# Question Flow with all 7 phases
QUESTIONS = [
    # Phase 1: Client & Project Basics
    {"phase": 1, "key": "company_name", "question": "Hi! What's the name of the company we're preparing the proposal for?", "type": "text"},
    {"phase": 1, "key": "contact_person", "question": "Great! Who's the main point of contact? (Name + Designation, e.g., Mr. Rajesh Sharma, Sales Head)", "type": "text"},
    {"phase": 1, "key": "business_overview", "question": "To make this proposal spot-on, tell me a bit more about the business:\n\n• What does the company primarily do?\n• What are your main products or services?\n• Who is your target customer?", "type": "text"},
    {"phase": 1, "key": "current_process", "question": "What's your current sales process like? (e.g., From inquiry → demo → proposal → closure)\n\nAnd what tools/systems are you using right now for leads and customer data?", "type": "text"},
    {"phase": 1, "key": "team_size", "question": "How many people will be using Bigin in total?\n\nQuick breakdown:\n• Sales/BD: __\n• Managers: __\n• Support: __\n• Others: __", "type": "text"},
    {"phase": 1, "key": "pain_points", "question": "What's the biggest challenge your team faces today? (e.g., Lead leakage, no follow-up tracking, manual reporting, data scattered everywhere)", "type": "text", "summarize": True},
    
    # Phase 2: Core Customization
    {"phase": 2, "key": "modules", "question": "Which modules need heavy customization?", "type": "buttons", "options": ["Contacts", "Companies", "Deals", "Products", "Tasks", "Others"], "multi": True},
    {"phase": 2, "key": "custom_fields", "question": "Any special custom fields you want? (e.g., Franchise Code, Loan Type, Source of Lead, EMI Details, etc.)", "type": "text"},
    {"phase": 2, "key": "pipeline_count", "question": "How many sales pipelines do you need? (e.g., 1 for Retail, 1 for Franchise, 1 for Corporate)", "type": "buttons", "options": ["1", "2", "3", "4+"]},
    {"phase": 2, "key": "pipeline_stages", "question": "For your pipeline(s), tell me the stages in order.\n\nExample: New → Qualified → Proposal → Negotiation → Closed Won\n\n(If multiple pipelines, separate each with a semicolon)", "type": "text", "summarize": True},
    
    # Phase 3: Lead Generation & Integrations
    {"phase": 3, "key": "lead_sources", "question": "From where do you get leads today?", "type": "buttons", "options": ["Facebook Lead Ads", "Instagram", "LinkedIn", "Google Ads", "IndiaMART", "TradeIndia", "Website", "WhatsApp", "Walk-ins", "Referrals", "Others"], "multi": True},
    {"phase": 3, "key": "whatsapp_integration", "question": "Do you want WhatsApp Business API integration with Bigin?", "type": "buttons", "options": ["Yes", "No", "Maybe later"]},
    {"phase": 3, "key": "other_integrations", "question": "Any other integrations? (e.g., Zoho Books, Google Sheets, Zoho Inventory, etc.)", "type": "text", "summarize": True},
    
    # Phase 4: Automation & Smart Features
    {"phase": 4, "key": "auto_assignment", "question": "Should leads be auto-assigned to team members? (Based on city, product, source, etc.)", "type": "buttons", "options": ["Yes", "No"]},
    {"phase": 4, "key": "automations", "question": "What automatic actions do you want?", "type": "buttons", "options": ["Task creation on stage change", "Email or SMS reminders", "Notification to owner on high-value deals", "Auto follow-up sequences", "Others"], "multi": True},
    {"phase": 4, "key": "alerts", "question": "Any specific alerts needed? (e.g., Deal value > ₹5L → notify owner)", "type": "text", "summarize": True},
    
    # Phase 5: Reports & Dashboards
    {"phase": 5, "key": "reports", "question": "Which reports are important to you? (You can select 5–15)", "type": "buttons", "options": ["Daily activity report", "Lead source wise report", "User-wise performance", "Pipeline health", "Conversion ratio", "EOD summary", "Others"], "multi": True, "summarize": True},
    
    # Phase 6: Training & Support
    {"phase": 6, "key": "training", "question": "Training needs:\n\n• Sales team: How many hours?\n• Admin: How many hours?\n• Owner/Senior management session? (Yes/No)", "type": "text"},
    {"phase": 6, "key": "support_duration", "question": "How many months of hand-holding support do you want? (This affects pricing)", "type": "buttons", "options": ["1 Month", "3 Months", "6 Months", "12 Months"]},
    {"phase": 6, "key": "whatsapp_group", "question": "Should we create a WhatsApp supervision group for daily coordination?", "type": "buttons", "options": ["Yes", "No"], "summarize": True},
    
    # Phase 7: Data & Go-Live
    {"phase": 7, "key": "data_migration", "question": "Do you have existing data to import?", "type": "buttons", "options": ["Only basic (Name/Phone/Email) → Free", "Full history → Paid"]},
    {"phase": 7, "key": "spoc", "question": "Who will be the main person we coordinate with? (Should be tech-savvy – Name + Mobile)", "type": "text", "final": True}
]

PHASE_NAMES = {
    1: "Client & Project Basics",
    2: "Core Customization",
    3: "Lead Generation & Integrations",
    4: "Automation & Smart Features",
    5: "Reports & Dashboards",
    6: "Training & Support",
    7: "Data & Go-Live"
}

# Initialize session state
if 'current_q' not in st.session_state:
    st.session_state.current_q = 0
    st.session_state.data = {}
    st.session_state.messages = []
    st.session_state.selected_buttons = []
    st.session_state.api_key = os.getenv("GROQ_API_KEY", "")
    st.session_state.use_ai = False

# Get AI client
def get_ai_client():
    if not st.session_state.api_key or not st.session_state.use_ai:
        return None
    try:
        return OpenAI(api_key=st.session_state.api_key, base_url="https://api.groq.com/openai/v1")
    except:
        return None

# Generate AI summary
def get_ai_summary(phase_data):
    client = get_ai_client()
    if not client:
        return None
    
    try:
        prompt = f"Summarize this CRM proposal data in 2-3 sentences: {json.dumps(phase_data)}"
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=150
        )
        return response.choices[0].message.content
    except:
        return None

# Header
col1, col2 = st.columns([3, 1])
with col1:
    st.markdown("<h1 style='color: white;'>💼 Bigin CRM Proposal Assistant</h1>", unsafe_allow_html=True)
    current_phase = QUESTIONS[st.session_state.current_q]["phase"] if st.session_state.current_q < len(QUESTIONS) else 7
    st.markdown(f"<div class='phase-badge'>Phase {current_phase}/7: {PHASE_NAMES[current_phase]}</div>", unsafe_allow_html=True)

with col2:
    with st.expander("⚙️ AI Settings"):
        use_ai = st.checkbox("Enable AI Summaries", value=st.session_state.use_ai)
        st.session_state.use_ai = use_ai
        if use_ai:
            api_key = st.text_input("Groq API Key", value=st.session_state.api_key, type="password", help="Free at console.groq.com")
            st.session_state.api_key = api_key

# Progress
progress = st.session_state.current_q / len(QUESTIONS)
st.progress(progress)

# Two column layout
col_chat, col_summary = st.columns([2, 1])

with col_chat:
    st.markdown("### 💬 Conversation")
    
    # Display messages
    for msg in st.session_state.messages:
        st.markdown(f"<div class='chat-message {msg['role']}'><strong>{'You' if msg['role'] == 'user' else 'Assistant'}:</strong> {msg['content']}</div>", unsafe_allow_html=True)
    
    # Current question
    if st.session_state.current_q < len(QUESTIONS):
        q = QUESTIONS[st.session_state.current_q]
        
        st.markdown(f"<div class='chat-message assistant'><strong>Assistant:</strong> {q['question']}</div>", unsafe_allow_html=True)
        
        # Input based on type
        if q["type"] == "text":
            user_input = st.text_area("Your answer:", key=f"input_{st.session_state.current_q}", height=100)
            if st.button("Send ✉️", type="primary"):
                if user_input.strip():
                    st.session_state.messages.append({"role": "user", "content": user_input})
                    st.session_state.data[q["key"]] = user_input
                    
                    # AI summary if enabled and needed
                    if q.get("summarize") and st.session_state.use_ai:
                        phase_data = {k: v for k, v in st.session_state.data.items() if any(qq["key"] == k and qq["phase"] == q["phase"] for qq in QUESTIONS)}
                        summary = get_ai_summary(phase_data)
                        if summary:
                            st.session_state.messages.append({"role": "assistant", "content": f"✅ {summary}"})
                    
                    st.session_state.current_q += 1
                    st.rerun()
        
        elif q["type"] == "buttons":
            if q.get("multi"):
                # Multi-select
                cols = st.columns(3)
                for idx, opt in enumerate(q["options"]):
                    with cols[idx % 3]:
                        if st.button(opt, key=f"btn_{idx}"):
                            if opt in st.session_state.selected_buttons:
                                st.session_state.selected_buttons.remove(opt)
                            else:
                                st.session_state.selected_buttons.append(opt)
                
                if st.session_state.selected_buttons:
                    st.info(f"Selected: {', '.join(st.session_state.selected_buttons)}")
                
                if st.button("✓ Done", type="primary"):
                    if st.session_state.selected_buttons:
                        st.session_state.messages.append({"role": "user", "content": ", ".join(st.session_state.selected_buttons)})
                        st.session_state.data[q["key"]] = st.session_state.selected_buttons.copy()
                        st.session_state.selected_buttons = []
                        st.session_state.current_q += 1
                        st.rerun()
            else:
                # Single select
                cols = st.columns(len(q["options"]))
                for idx, opt in enumerate(q["options"]):
                    with cols[idx]:
                        if st.button(opt, key=f"btn_{idx}", use_container_width=True):
                            st.session_state.messages.append({"role": "user", "content": opt})
                            st.session_state.data[q["key"]] = opt
                            st.session_state.current_q += 1
                            st.rerun()
    else:
        # Complete
        st.markdown("<div class='chat-message assistant'><strong>🎉 Complete!</strong> All information gathered. Download your summary from the sidebar.</div>", unsafe_allow_html=True)

with col_summary:
    st.markdown("### 📋 Summary")
    
    if st.session_state.data:
        for phase in range(1, 8):
            phase_data = {k: v for k, v in st.session_state.data.items() if any(q["key"] == k and q["phase"] == phase for q in QUESTIONS)}
            if phase_data:
                with st.expander(f"Phase {phase}: {PHASE_NAMES[phase]}", expanded=(phase == current_phase)):
                    for key, value in phase_data.items():
                        label = key.replace('_', ' ').title()
                        if isinstance(value, list):
                            st.markdown(f"**{label}:** {', '.join(value)}")
                        else:
                            st.markdown(f"**{label}:** {value}")
        
        # Download
        if st.session_state.current_q >= len(QUESTIONS):
            summary_text = "BIGIN CRM PROPOSAL SUMMARY\n" + "="*50 + "\n\n"
            for key, value in st.session_state.data.items():
                label = key.replace('_', ' ').title()
                val = ', '.join(value) if isinstance(value, list) else value
                summary_text += f"{label}: {val}\n"
            
            st.download_button(
                "📥 Download Summary",
                data=summary_text,
                file_name=f"CRM_Proposal_{st.session_state.data.get('company_name', 'Client')}_{datetime.now().strftime('%Y%m%d')}.txt",
                mime="text/plain",
                type="primary",
                use_container_width=True
            )
    
    if st.button("🔄 Start Over", use_container_width=True):
        for key in list(st.session_state.keys()):
            if key not in ['api_key', 'use_ai']:
                del st.session_state[key]
        st.rerun()

st.markdown("---")
st.markdown("<p style='text-align: center; color: white;'>💼 Bigin CRM Proposal Assistant • Powered by AI</p>", unsafe_allow_html=True)
