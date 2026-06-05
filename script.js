// CONFIGURAZIONE COMPLETA SUPABASE - MATTWETUTTOTECH
// NOTA: Sostituisci con le tue credenziali reali prima di caricare su GitHub
const SUPABASE_URL = "https://tuo-id-progetto.supabase.co"; 
const SUPABASE_KEY = "la-tua-chiave-anon-lunghissima";

const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// STATO DEGLI UTENTI E DEI CORSI
let currentUser = null;
let isAdminUser = false;
let coursesList = [
    { id: 1, title: "Sviluppo Web con HTML, CSS & Tailwind", category: "Front-End", level: "Principiante", duration: "25 Ore", color: "from-blue-500 to-indigo-600", desc: "Costruisci interfacce bellissime, responsive ed estremamente moderne sfruttando le ultime novità del web." },
    { id: 2, title: "JavaScript ES6+ & Programmazione ad Oggetti", category: "Programming", level: "Intermedio", duration: "40 Ore", color: "from-purple-500 to-pink-600", desc: "Impara le fondamenta logiche e dinamiche del linguaggio web più utilizzato al mondo, dai cicli alle API async." },
    { id: 3, title: "Database Relazionali & Integrazione Supabase", category: "Back-End", level: "Avanzato", duration: "30 Ore", color: "from-emerald-500 to-teal-600", desc: "Disegna architetture dati performanti, scrivi script SQL e collega il frontend al tuo database real-time." }
];

// BANCO DATI LOCALE DEI QUIZ (INTEGRATO DIRETTAMENTE IN QUESTO SITO)
const quizData = {
    "html-css": [
        { q: "Quale tag HTML viene utilizzato per includere un file JavaScript esterno?", a: ["<script>", "<js>", "<javascript>", "<link>"], correct: 0 },
        { q: "Cosa significa la sigla CSS?", a: ["Computer Style Sheets", "Cascading Style Sheets", "Creative Style Sheets", "Colorful Style Sheets"], correct: 1 },
        { q: "Quale classe Tailwind applica un display flex ad un elemento?", a: ["d-flex", "layout-flex", "flex", "make-flex"], correct: 2 }
    ],
    "javascript": [
        { q: "Quale operatore si usa per verificare sia il valore che il tipo di dato in JavaScript?", a: ["==", "===", "=", "!="], correct: 1 },
        { q: "Come si dichiara una costante a blocchi in ES6?", a: ["var", "let", "constant", "const"], correct: 3 },
        { q: "Quale metodo trasforma una stringa JSON in un oggetto JavaScript?", a: ["JSON.stringify()", "JSON.parse()", "JSON.objectify()", "JSON.toObject()"], correct: 1 }
    ],
    "supabase-db": [
        { q: "Cosa significa l'acronimo RLS in Supabase / PostgreSQL?", a: ["Row Level Security", "Realtime Live Storage", "Relation Link System", "Remote Login Service"], correct: 0 },
        { q: "Quale comando SQL si usa per aggiungere righe a una tabella?", a: ["ADD ROW", "UPDATE", "INSERT INTO", "SELECT"], correct: 2 }
    ]
};

let currentQuizTopic = "html-css";
let userQuizAnswers = {};

// INIZIALIZZAZIONE APPLICAZIONE
document.addEventListener("DOMContentLoaded", () => {
    renderCourses();
    loadQuiz(currentQuizTopic);
    checkCurrentSession();
});

// FUNZIONE PER MOSTRARE I CORSI
function renderCourses() {
    const grid = document.getElementById("courses-grid");
    if (!grid) return;
    grid.innerHTML = coursesList.map(c => `
        <div class="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:border-brand-500 dark:hover:border-brand-500 transition-all duration-300">
            <div>
                <div class="flex items-center justify-between mb-4">
                    <span class="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">${c.category}</span>
                    <span class="text-xs font-semibold text-slate-400"><i class="fa-regular fa-clock mr-1"></i>${c.duration}</span>
                </div>
                <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">${c.title}</h3>
                <p class="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 mb-6">${c.desc}</p>
            </div>
            <button onclick="enrollInCourse('${c.title}')" class="w-full py-3 rounded-2xl text-sm font-bold text-center bg-gradient-to-r ${c.color} text-white shadow-md hover:opacity-90 transition-opacity">
                Inizia Percorso
            </button>
        </div>
    `).join("");
}

// GESTIONE MOTORE QUIZ LOCALE (INTEGRATO)
function loadQuiz(topic) {
    currentQuizTopic = topic;
    userQuizAnswers = {};
    
    // Aggiorna bottoni attivi
    document.querySelectorAll("#quiz-topic-selector button").forEach(btn => {
        btn.className = "px-5 py-2.5 rounded-xl text-sm font-bold border transition-all bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent hover:border-slate-300";
    });
    const activeBtn = event?.target || document.querySelector(`#quiz-topic-selector button[onclick*="${topic}"]`);
    if (activeBtn) {
        activeBtn.className = "px-5 py-2.5 rounded-xl text-sm font-bold border transition-all bg-brand-500 text-white border-brand-500 shadow-lg shadow-brand-500/25";
    }

    const container = document.getElementById("quiz-app-container");
    const questions = quizData[topic];
    
    if (!questions) {
        container.innerHTML = `<p class="text-center text-sm text-slate-500">Quiz in arrivo!</p>`;
        return;
    }

    container.innerHTML = questions.map((quest, qIdx) => `
        <div class="border-b border-slate-100 dark:border-slate-800/60 pb-6 last:border-none">
            <p class="font-semibold text-base text-slate-900 dark:text-white mb-3"><span class="text-brand-500 font-bold mr-1">Domoanda ${qIdx + 1}:</span> ${quest.q}</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                ${quest.a.map((ans, aIdx) => `
                    <label class="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-950 transition-colors">
                        <input type="radio" name="question-${qIdx}" value="${aIdx}" onclick="selectQuizAnswer(${qIdx}, ${aIdx})" class="w-4 h-4 text-brand-500 focus:ring-brand-500 bg-transparent border-slate-300">
                        <span class="text-sm text-slate-700 dark:text-slate-300">${ans}</span>
                    </label>
                `).join("")}
            </div>
        </div>
    `).join("") + `
        <div class="pt-4 text-center">
            <button onclick="submitLocalQuiz()" class="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl shadow-lg transition-all">
                Invia e Calcola Punteggio <i class="fa-solid fa-check-double ml-1"></i>
            </button>
        </div>
        <div id="quiz-result-box" class="hidden mt-6 p-4 rounded-2xl text-center font-bold text-sm"></div>
    `;
}

function selectQuizAnswer(qIdx, aIdx) {
    userQuizAnswers[qIdx] = aIdx;
}

function submitLocalQuiz() {
    const questions = quizData[currentQuizTopic];
    const resultBox = document.getElementById("quiz-result-box");
    
    let score = 0;
    let total = questions.length;
    let answeredCount = Object.keys(userQuizAnswers).length;

    if (answeredCount < total) {
        showToast("Attenzione!", "Rispondi a tutte le domande prima di inviare il quiz.", "warning");
        return;
    }

    questions.forEach((quest, idx) => {
        if (parseInt(userQuizAnswers[idx]) === quest.correct) {
            score++;
        }
    });

    resultBox.classList.remove("hidden", "bg-rose-500/10", "text-rose-500", "bg-emerald-500/10", "text-emerald-500");
    if (score === total) {
        resultBox.className = "mt-6 p-5 rounded-2xl text-center font-bold text-base bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
        resultBox.innerHTML = `🏆 Eccezionale Mattwe! Hai fatto bottino pieno: ${score}/${total} corrette!`;
    } else {
        resultBox.className = "mt-6 p-5 rounded-2xl text-center font-bold text-base bg-brand-50/50 dark:bg-slate-950 text-brand-500 border border-brand-500/20";
        resultBox.innerHTML = `👍 Ottimo sforzo! Punteggio finale: ${score}/${total}. Riprova per fare 100%!`;
    }
    resultBox.scrollIntoView({ behavior: 'smooth' });
}

// GESTIONE DELLE ISCRIZIONI AI CORSI
function enrollInCourse(courseTitle) {
    if (!currentUser) {
        showToast("Accesso richiesto", "Accedi o iscriviti gratis per sbloccare le lezioni e salvare i progressi.", "info");
        openAuthModal('login');
        return;
    }
    showToast("Iscrizione Confermata! 🎉", `Ti sei registrato correttamente al corso: ${courseTitle}`, "success");
}

// INTERFACCIA APERTURA MODALE UNICA
function openAuthModal(viewType) {
    const modal = document.getElementById("auth-modal");
    const container = document.getElementById("modal-container");
    if (!modal) return;

    modal.classList.remove("opacity-0", "pointer-events-none");
    container.classList.remove("scale-90");

    switchModalTab(viewType);
}

function closeAuthModal() {
    const modal = document.getElementById("auth-modal");
    const container = document.getElementById("modal-container");
    if (!modal) return;

    modal.classList.add("opacity-0", "pointer-events-none");
    container.classList.add("scale-90");
}

function switchModalTab(tabName) {
    const views = ['login-view', 'signup-view', 'dashboard-view', 'admin-view'];
    views.forEach(v => {
        const el = document.getElementById(v);
        if (el) el.classList.add("hidden");
    });

    const title = document.getElementById("modal-title");
    const subtitle = document.getElementById("modal-subtitle");

    if (tabName === 'login') {
        document.getElementById("login-view").classList.remove("hidden");
        title.innerText = "Accedi";
        subtitle.innerText = "Bentornato su MattweTuttoTech.";
    } else if (tabName === 'signup') {
        document.getElementById("signup-view").classList.remove("hidden");
        title.innerText = "Crea un Account";
        subtitle.innerText = "Registrati gratis per salvare le risposte dei tuoi quiz.";
    } else if (tabName === 'dashboard') {
        document.getElementById("dashboard-view").classList.remove("hidden");
        title.innerText = "Area Personale";
        subtitle.innerText = "Gestisci i tuoi corsi e monitora le attività.";
        loadDashboardData();
    } else if (tabName === 'admin') {
        document.getElementById("admin-view").classList.remove("hidden");
        title.innerText = "Pannello Controllo";
        subtitle.innerText = "Strumenti amministrativi privati per Mattwe.";
        loadAdminData();
    }
}

// DATI UTENTE IN AREA UTENTE ED ADMIN
function loadDashboardData() {
    document.getElementById("dashboard-user-email").innerText = currentUser?.email || "studente@esempio.it";
    const myList = document.getElementById("my-courses-list");
    myList.innerHTML = `
        <div class="p-3 text-xs rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <span class="font-medium text-slate-800 dark:text-slate-200">Sviluppo Web con HTML, CSS & Tailwind</span>
            <span class="text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">In Corso</span>
        </div>
    `;
    
    const adminBtn = document.getElementById("btn-goto-admin");
    if (isAdminUser) {
        adminBtn.classList.remove("hidden");
    } else {
        adminBtn.classList.add("hidden");
    }
}

function loadAdminData() {
    const list = document.getElementById("admin-students-list");
    list.innerHTML = `
        <div class="p-2 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 flex justify-between">
            <span>studente.test@gmail.com</span>
            <span class="text-slate-400">Iscritto oggi</span>
        </div>
    `;
}

// GESTIONE AUTENTICAZIONE SUPABASE COMPLETA
async function handleLoginSubmit(e) {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    if (!supabase) {
        // Fallback locale senza credenziali reali per permettere il test offline della grafica
        simulateLogin(email);
        return;
    }

    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        currentUser = data.user;
        await checkAdminPrivileges(currentUser.id);
        updateUIForAuthenticatedUser();
        closeAuthModal();
        showToast("Accesso Eseguito!", `Benvenuto ${email}`, "success");
    } catch (err) {
        showToast("Errore di Accesso", err.message, "danger");
    }
}

async function handleSignupSubmit(e) {
    e.preventDefault();
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;

    if (!supabase) {
        showToast("Nota di Sviluppo", "Inserisci le chiavi corrette in script.js per attivare il DB.", "warning");
        simulateLogin(email);
        return;
    }

    try {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        
        showToast("Registrazione Inviata!", "Verifica la tua casella di posta o effettua il login.", "success");
        closeAuthModal();
    } catch (err) {
        showToast("Errore Registrazione", "Errore di rete. Verifica la configurazione Site URL su Supabase.", "danger");
    }
}

function simulateLogin(email) {
    currentUser = { email: email, id: "mock-id-1234" };
    isAdminUser = email.toLowerCase().includes("mattwe") || email.toLowerCase().includes("admin");
    updateUIForAuthenticatedUser();
    closeAuthModal();
    showToast("Login Simulato (Offline)", `Connesso come: ${email}`, "success");
}

async function checkAdminPrivileges(uid) {
    try {
        const { data, error } = await supabase.from('profiles').select('is_admin').eq('id', uid).single();
        if (data) isAdminUser = data.is_admin;
    } catch (e) {
        isAdminUser = false;
    }
}

function updateUIForAuthenticatedUser() {
    document.getElementById("guest-nav-actions").classList.add("hidden");
    document.getElementById("user-nav-actions").classList.remove("hidden");
    document.getElementById("user-display-name").innerText = currentUser.email;
}

async function handleLogout() {
    if (supabase) await supabase.auth.signOut();
    currentUser = null;
    isAdminUser = false;
    document.getElementById("guest-nav-actions").classList.remove("hidden");
    document.getElementById("user-nav-actions").classList.add("hidden");
    closeAuthModal();
    showToast("Disconnesso", "Sessione chiusa correttamente.", "info");
}

async function checkCurrentSession() {
    if (!supabase) return;
    const { data } = await supabase.auth.getSession();
    if (data?.session) {
        currentUser = data.session.user;
        await checkAdminPrivileges(currentUser.id);
        updateUIForAuthenticatedUser();
    }
}

function handleCreateCourseAdmin(e) {
    e.preventDefault();
    const title = document.getElementById("admin-course-title").value;
    const category = document.getElementById("admin-course-category").value;
    const level = document.getElementById("admin-course-level").value;
    const duration = document.getElementById("admin-course-duration").value;
    const color = document.getElementById("admin-course-color").value;
    const desc = document.getElementById("admin-course-desc").value;

    const newCourse = { id: coursesList.length + 1, title, category, level, duration, color, desc };
    coursesList.unshift(newCourse);
    renderCourses();
    showToast("Corso Creato!", "Il nuovo corso è subito visibile in bacheca.", "success");
    switchModalTab('dashboard');
}

// SISTEMA TOAST COMPATTO E CORRETTO
function showToast(title, desc, type) {
    const toast = document.getElementById("toast-notification");
    const tTitle = document.getElementById("toast-title");
    const tDesc = document.getElementById("toast-desc");
    const bg = document.getElementById("toast-icon-bg");
    const icon = document.getElementById("toast-icon");

    tTitle.innerText = title;
    tDesc.innerText = desc;

    bg.className = "w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 ";
    icon.className = "fa-solid ";

    if (type === 'success') { bg.classList.add("bg-emerald-500"); icon.classList.add("fa-circle-check"); }
    else if (type === 'danger') { bg.classList.add("bg-rose-500"); icon.classList.add("fa-circle-xmark"); }
    else if (type === 'warning') { bg.classList.add("bg-amber-500"); icon.classList.add("fa-triangle-exclamation"); }
    else { bg.classList.add("bg-brand-500"); icon.classList.add("fa-circle-info"); }

    toast.classList.remove("translate-y-24", "opacity-0");
    setTimeout(() => { toast.classList.add("translate-y-24", "opacity-0"); }, 4000);
}
