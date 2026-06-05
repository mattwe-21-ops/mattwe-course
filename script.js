const SUPABASE_URL = "https://qphtafhpmazzkevtmftp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwaHRhZmhwbWF6emtldnRtdGZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1NjIwODksImV4cCI6MjA5NjEzODA4OX0.rpOOfxGgaAvO_VP5EkPkadcNRgHMeekrX4wegNDWhvY";

// Inizializzazione corretta del client Supabase per evitare il SyntaxError
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Elementi HTML della finestra modale e delle sezioni
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

// Pulsanti di attivazione sulla pagina
const navLoginBtn = document.getElementById('nav-login-btn');
const navRegisterBtn = document.getElementById('nav-register-btn');
const heroStartBtn = document.getElementById('hero-start-btn');
const navUserText = document.getElementById('nav-user-text');

let isLoginMode = true;

// Funzioni per aprire e chiudere il pop-up con le animazioni
function openModal() { 
    authModal.classList.add('active'); 
    document.body.style.overflow = 'hidden'; 
}
function closeModal() { 
    authModal.classList.remove('active'); 
    document.body.style.overflow = ''; 
    hideAlert(); 
}

modalCloseBtn.addEventListener('click', closeModal);
authModal.addEventListener('click', (e) => { if(e.target === authModal) closeModal(); });

// Gestione dei messaggi di avviso (Errori o Successi)
function showAlert(message, type) {
    alertBox.innerText = message;
    alertBox.style.display = 'block';
    alertBox.className = type === 'error' ? 'alert alert-error' : 'alert alert-success';
}
function hideAlert() { alertBox.style.display = 'none'; }

// Attiva la modalità ACCEDI nel pop-up
function setLoginMode() {
    isLoginMode = true;
    hideAlert();
    sectionAuth.classList.remove('hidden');
    sectionDashboard.classList.add('hidden');
    authTitle.innerText = "Accedi ai Corsi";
    authSubtitle.innerText = "Inserisci le tue credenziali per riprendere i quiz.";
    btnSubmit.innerText = "Accedi";
    openModal();
}

// Attiva la modalità ISCRIVITI nel pop-up
function setRegisterMode() {
    isLoginMode = false;
    hideAlert();
    sectionAuth.classList.remove('hidden');
    sectionDashboard.classList.add('hidden');
    authTitle.innerText = "Registrazione Gratuita";
    authSubtitle.innerText = "Crea un nuovo profilo in pochi secondi per sbloccare l'area quiz.";
    btnSubmit.innerText = "Registrati Ora";
    openModal();
}

// Collega i clic ai pulsanti della Home Page
navLoginBtn.addEventListener('click', setLoginMode);
navRegisterBtn.addEventListener('click', setRegisterMode);
heroStartBtn.addEventListener('click', setRegisterMode);

// Logica di invio dati a Supabase (Login e Registrazione)
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
    btnSubmit.innerText = "Elaborazione in corso...";

    if (isLoginMode) {
        // Tentativo di Accesso
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) {
            showAlert("Errore: Credenziali errate o account inesistente.", "error");
            btnSubmit.disabled = false;
            btnSubmit.innerText = "Accedi";
        } else {
            hideAlert();
            gestisciLoginSuccesso(data.user);
        }
    } else {
        // Tentativo di Registrazione
        const { data, error } = await supabaseClient.auth.signUp({ email, password });
        if (error) {
            showAlert("Errore durante l'iscrizione: " + error.message, "error");
            btnSubmit.disabled = false;
            btnSubmit.innerText = "Registrati Ora";
        } else {
            showAlert("Account creato! Ora effettua l'accesso usando i tuoi dati.", "success");
            setTimeout(() => {
                setLoginMode();
                btnSubmit.disabled = false;
                passwordInput.value = "";
            }, 1500);
        }
    }
});

// Logica per disconnettere l'utente (Logout)
btnLogout.addEventListener('click', async () => {
    await supabaseClient.auth.signOut();
    sectionDashboard.classList.add('hidden');
    sectionAuth.classList.remove('hidden');
    navLoginBtn.classList.remove('hidden');
    navRegisterBtn.classList.remove('hidden');
    navUserText.style.display = 'none';
    emailInput.value = "";
    passwordInput.value = "";
    closeModal();
});

// Mostra la dashboard con il link a Google Sites quando l'utente si logga
function gestisciLoginSuccesso(user) {
    if (user) {
        sectionAuth.classList.add('hidden');
        sectionDashboard.classList.remove('hidden');
        navLoginBtn.classList.add('hidden');
        navRegisterBtn.classList.add('hidden');
        navUserText.innerText = `Profilo: ${user.email}`;
        navUserText.style.display = 'inline-block';
        openModal();
    }
}

// Controlla automaticamente se l'utente era già loggato all'apertura del sito
async function controllaSessione() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session && session.user) {
        gestisciLoginSuccesso(session.user);
    }
}
controllaSessione();
