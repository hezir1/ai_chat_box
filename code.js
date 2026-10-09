// ============================================
console.log("Chat script loading...");

// API Configuration
const API_KEY = "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";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// ---- A. STATE & UI CONTROL ----

let chatOpen = false;
let userData = null;

console.log("Variables initialized");

// Hide tooltip after 6 seconds automatically
setTimeout(() => {
    document.getElementById('tooltip').style.display = 'none';
}, 6000);

// Toggle chat window open/closed when FAB is clicked
function toggleChat() {
    chatOpen = !chatOpen;
    const win = document.getElementById('chatWindow');
    const fab = document.getElementById('chatFab');
    const notif = document.getElementById('notifDot');

    win.classList.toggle('open', chatOpen);
    fab.classList.toggle('open', chatOpen);
    notif.style.display = 'none'; // hide red dot once opened

    // Start conversation on first open (only if already onboarded)
    if (chatOpen && userData && document.getElementById('messages').children.length === 0) {
        startConversation();
    }
}
window.toggleChat = toggleChat;

// Handle Lead Gen Form submission
async function submitOnboarding() {
    const fName = document.getElementById('firstName').value.trim();
    const lName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('userEmail').value.trim();

    // Basic validation
    if (!fName || !lName || !email) {
        alert("Please fill in all fields to continue.");
        return;
    }
    if (!email.includes('@')) {
        alert("Please enter a valid email address.");
        return;
    }

    // Save user data locally
    userData = { firstName: fName, lastName: lName, email: email };

    // SEND DATA TO DATABASE VIA PHP
    try {
        const response = await fetch('php/save_lead.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        const result = await response.json();
        console.log("Database Sync:", result);
    } catch (error) {
        console.error("Error saving to database:", error);
    }

    // Hide form and show chat
    document.getElementById('onboardingForm').style.display = 'none';
    document.getElementById('messages').style.display = 'flex';
    document.getElementById('inputWrap').style.display = 'flex';

    // Start Chat
    startConversation();
}
window.submitOnboarding = submitOnboarding;

// Switch between Website Chat and Facebook tabs
function switchPlatform(p) {
    document.getElementById('webPanel').style.display = p === 'web' ? 'flex' : 'none';
    document.getElementById('fbPanel').classList.toggle('visible', p === 'fb');
    document.getElementById('btnWeb').classList.toggle('active', p === 'web');
    document.getElementById('btnFb').classList.toggle('active', p === 'fb');
}
window.switchPlatform = switchPlatform;

// ---- B. BOT RESPONSES DATABASE ----
// Removed hardcoded responses to allow AI to handle all queries directly.



// ---- C. MESSAGE RENDERING FUNCTIONS ----

const msgs = document.getElementById('messages');

// Called once on first open — sends welcome message
function startConversation() {
    const greeting = userData ? `👋 Hello **${userData.firstName}**! Welcome.\n\nHow can I help you today?` : "👋 Hello! Welcome.\n\nHow can I help you today?";
    setTimeout(() => addBotMsg(greeting), 400);
    setTimeout(() => showQuickReplies([
        "📋 Admissions", "💰 Tuition & Fees",
        "📚 Programs Offered", "📅 Term Dates",
        "📍 Location", "🎓 Apply Now"
    ]), 1200);
}

// Render a bot message bubble
function addBotMsg(text) {
    const div = document.createElement('div');
    div.className = 'msg bot';
    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    // Convert **bold** markdown to <strong> and URLs to <a> links
    bubble.innerHTML = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>')
        .replace(/\n/g, '<br>');
    div.appendChild(bubble);
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight; // auto-scroll down
}

// Render a user message bubble
function addUserMsg(text) {
    const div = document.createElement('div');
    div.className = 'msg user';
    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    bubble.textContent = text;
    div.appendChild(bubble);
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
}

// Show the animated typing indicator
function showTyping() {
    const div = document.createElement('div');
    div.className = 'msg bot';
    div.id = 'typing';
    div.innerHTML = '<div class="typing"><span></span><span></span><span></span></div>';
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    return div;
}

// Render quick reply pill buttons
function showQuickReplies(options) {
    const wrap = document.createElement('div');
    wrap.className = 'quick-replies';
    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'qr-btn';
        btn.textContent = opt;
        btn.onclick = () => handleReply(opt, wrap); // pass wrap so we can remove it
        wrap.appendChild(btn);
    });
    msgs.appendChild(wrap);
    msgs.scrollTop = msgs.scrollHeight;
}

// Handle a quick reply button click
async function handleReply(text, qrWrap) {
    if (qrWrap) qrWrap.remove(); // remove the quick reply row
    addUserMsg(text);
    const typing = showTyping();

    // Now all replies are handled by the AI
    await processAIResponse(text, typing);
}

// Handle free-text input from the keyboard
async function sendMsg() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;
    input.value = '';

    document.querySelectorAll('.quick-replies').forEach(el => el.remove());
    addUserMsg(text);
    const typing = showTyping();

    await processAIResponse(text, typing);
}
window.sendMsg = sendMsg;

// Unified AI Processing 
async function processAIResponse(text, typingIndicator) {
    try {
        // Use the knowledge provided in knowledg.js
        const prompt = `${BOT_KNOWLEDGE}\n\nThe user asks: "${text}".\nAnswer based on the school information above.`;

        const response = await fetch(OPENROUTER_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "google/gemini-2.0-flash-001",
                "messages": [
                    { "role": "user", "content": prompt }
                ]
            })
        });

        if (typingIndicator) typingIndicator.remove();

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        const aiMessage = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't process that.";

        addBotMsg(aiMessage);

        // Always show the same main menu options as a follow-up
        setTimeout(() => showQuickReplies(["📋 Admissions", "💰 Tuition & Fees", "📚 Programs Offered", "📅 Term Dates", "📍 Location", "🎓 Apply Now"]), 300);

    } catch (error) {
        if (typingIndicator) typingIndicator.remove();
        console.error("AI Error:", error);
        addBotMsg("I'm having a bit of trouble thinking right now. Please try again later! 😊");
        setTimeout(() => showQuickReplies(["🔙 Main Menu", "📍 Contact Info"]), 300);
    }
}

console.log("Chat script fully loaded!");