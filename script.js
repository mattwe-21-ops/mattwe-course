const SUPABASE_URL = "https://qphtafhpmazzkevtmftp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwaHRhZmhwbWF6emtldnRtdGZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1NjIwODksImV4cCI6MjA5NjEzODA4OX0.rpOOfxGgaAvO_VP5EkPkadcNRgHMeekrX4wegNDWhvY";

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Elementi HTML Modale e Sezioni
const authModal = document.getElementById('auth-modal');
const modalCloseBtn = document.getElementById('modal-close-btn');
const sectionAuth = document.getElementById('section-auth');
const sectionDashboard = document.getElementById('section-dashboard');
const authTitle = document.getElementById('auth-title');
const authSubtitle = document.getElementById('auth-subtitle');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const btnSubmit = document.getElementById('btn-submit');
const btnLogout = document.getElementById('btn-logout');
const alertBox = document.getElementById('alert-box');

// Pulsanti di attivazione
const navLoginBtn = document.getElementById('nav-login-btn');
const navRegisterBtn = document.getElementById('nav-register-btn');
const heroStartBtn = document.getElementById('hero-start-btn');
const navUserText = document.getElementById('nav-user-text');

let isLoginMode = true;

// Gestione dell'apertura/chiusura della finestra modale
function openModal() { authModal.classList.add('active'); }
function closeModal() { authModal.classList.remove('active'); hideAlert(); }

modalCloseBtn.addEventListener('click', closeModal);
authModal.addEventListener('click', (e) => { if(e.target === authModal) closeModal(); });

// Funzioni degli avvisi interni
function showAlert(message, type) {
    alertBox.innerText = message;
    alertBox.style.display = 'block';
    alertBox.className = type === 'error' ? 'alert alert-error' : 'alert alert-success';
}
function hideAlert() { alertBox.style.display = 'none'; }

// Attivazione Modalità Login
function setLoginMode() {
    isLoginMode = true;
    hideAlert();
    authTitle.innerText = "Accedi ai Corsi";
    authSubtitle.innerText = "Inserisci le tue credenziali per riprendere i quiz.";
    btnSubmit.innerText = "Accedi";
    openModal();
}

// Attivazione Modalità Registrazione
function setRegisterMode() {
    isLoginMode = false;
    hideAlert();
    authTitle.innerText = "Registrazione Gratuita";
    authSubtitle.innerText = "Crea un nuovo profilo per sbloccare l'area quiz.";
    btnSubmit.innerText = "Registrati Ora";
    openModal();
}

navLoginBtn.addEventListener('click', setLoginMode);
navRegisterBtn.addEventListener('click', setRegisterMode);
heroStartBtn.addEventListener('click', setRegisterMode);

// Logica di Invio dati a Supabase (Accedi / Iscriviti)
btnSubmit.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
        showAlert("Per favore, compila tutti i campi richiesti.", "error");
        return;
    }
    if (password.length < 6) {
        showAlert("La password deve contenere almeno 6 caratteri.", "error");
        return;
    }

    btnSubmit.disabled = true;
    btnSubmit.innerText = "Elaborazione...";

    if (isLoginMode) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            showAlert("Errore: Credenziali errate o account non esistente.", "error");
            btnSubmit.disabled = false;
            btnSubmit.innerText = "Accedi";
        } else {
            hideAlert();
            gestisciLoginSuccesso(data.user);
        }
    } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) {
            showAlert("Errore di iscrizione: " + error.message, "error");
            btnSubmit.disabled = false;
            btnSubmit.innerText = "Registrati Ora";
        } else {
            showAlert("Account creato! Ora puoi accedere usando le stesse credenziali.", "success");
            setLoginMode();
            btnSubmit.disabled = false;
            passwordInput.value = "";
        }
    }
});

// Logica Logout
btnLogout.addEventListener('click', async () => {
    await supabase.auth.signOut();
    sectionDashboard.classList.add('hidden');
    sectionAuth.classList.remove('hidden');
    navLoginBtn.classList.remove('hidden');
    navRegisterBtn.classList.remove('hidden');
    navUserText.style.display = 'none';
    emailInput.value = "";
    passwordInput.value = "";
    closeModal();
});

// Cambia l'aspetto del sito quando l'utente effettua l'accesso
function gestisciLoginSuccesso(user) {
    if (user) {
        sectionAuth.classList.add('hidden');
        sectionDashboard.classList.remove('hidden');
        navLoginBtn.classList.add('hidden');
        navRegisterBtn.classList.add('hidden');
        navUserText.innerText = `Profilo: ${user.email}`;
        navUserText.style.display = 'inline-block';
        openModal(); // Mostra subito il pulsante per andare su Google Sites
    }
}

// Controlla se l'utente ha una sessione attiva da visite precedenti
async function controllaSessione() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session && session.user) {
        gestisciLoginSuccesso(session.user);
    }
}
controllaSessione();