const SUPABASE_URL = "https://qphtafhpmazzkevtmftp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwaHRhZmhwbWF6emtldnRtdGZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1NjIwODksImV4cCI6MjA5NjEzODA4OX0.rpOOfxGgaAvO_VP5EkPkadcNRgHMeekrX4wegNDWhvY";

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Elementi HTML
const sectionAuth = document.getElementById('section-auth');
const sectionDashboard = document.getElementById('section-dashboard');
const authTitle = document.getElementById('auth-title');
const authSubtitle = document.getElementById('auth-subtitle');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const btnSubmit = document.getElementById('btn-submit');
const btnLogout = document.getElementById('btn-logout');
const alertBox = document.getElementById('alert-box');

// Pulsanti Navbar superiore
const navLoginBtn = document.getElementById('nav-login-btn');
const navRegisterBtn = document.getElementById('nav-register-btn');
const navUserText = document.getElementById('nav-user-text');

let isLoginMode = true; // Stato: true = Accedi, false = Iscriviti

// Funzione per mostrare avvisi dinamici sul box senza usare i pop-up fastidiosi
function showAlert(message, type) {
    alertBox.innerText = message;
    alertBox.style.display = 'block';
    if (type === 'error') {
        alertBox.className = 'alert alert-error';
    } else {
        alertBox.className = 'alert alert-success';
    }
}

function hideAlert() {
    alertBox.style.display = 'none';
}

// Cambia la grafica in modalità "Accedi" quando clicchi in alto a destra
navLoginBtn.addEventListener('click', () => {
    isLoginMode = true;
    hideAlert();
    authTitle.innerText = "Accedi ai Corsi Gratuiti";
    authSubtitle.innerText = "Inserisci i tuoi dati per entrare nella piattaforma o creare un nuovo profilo.";
    btnSubmit.innerText = "Accedi";
    btnSubmit.className = "btn-main btn-blue";
});

// Cambia la grafica in modalità "Iscriviti" quando clicchi in alto a destra
navRegisterBtn.addEventListener('click', () => {
    isLoginMode = false;
    hideAlert();
    authTitle.innerText = "Crea un Account Gratuito";
    authSubtitle.innerText = "Registrati inserendo una email e una password per sbloccare l'area quiz.";
    btnSubmit.innerText = "Registrati Ora";
    btnSubmit.className = "btn-main btn-blue";
});

// Gestione invio modulo (Login / Registrazione)
btnSubmit.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
        showAlert("Per fare favore, compila tutti i campi richiesti.", "error");
        return;
    }

    if (password.length < 6) {
        showAlert("La password deve contenere almeno 6 caratteri.", "error");
        return;
    }

    btnSubmit.disabled = true;
    btnSubmit.innerText = "Elaborazione...";

    if (isLoginMode) {
        // ACCEDI
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            showAlert("Errore di accesso: Controlla email e password o iscriviti se non l'hai fatto.", "error");
            btnSubmit.disabled = false;
            btnSubmit.innerText = "Accedi";
        } else {
            hideAlert();
            aggiornaInterfacciaUtente(data.user);
        }
    } else {
        // ISCRIVITI
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) {
            showAlert("Errore di registrazione: " + error.message, "error");
            btnSubmit.disabled = false;
            btnSubmit.innerText = "Registrati Ora";
        } else {
            showAlert("Iscrizione completata con successo! Ora puoi fare il login usando i pulsanti in alto.", "success");
            navLoginBtn.click(); // Rimette in modalità login automaticamente
            btnSubmit.disabled = false;
            passwordInput.value = "";
        }
    }
});

// Sconnessione (Logout)
btnLogout.addEventListener('click', async () => {
    await supabase.auth.signOut();
    sectionDashboard.classList.add('hidden');
    sectionAuth.classList.remove('hidden');
    navLoginBtn.classList.remove('hidden');
    navRegisterBtn.classList.remove('hidden');
    navUserText.classList.add('hidden');
    emailInput.value = "";
    passwordInput.value = "";
    hideAlert();
});

// Funzione per mostrare l'area protetta quando l'utente è correttamente autenticato
function aggiornaInterfacciaUtente(user) {
    if (user) {
        sectionAuth.classList.add('hidden');
        sectionDashboard.classList.remove('hidden');
        navLoginBtn.classList.add('hidden');
        navRegisterBtn.classList.add('hidden');
        navUserText.innerText = `Utente: ${user.email}`;
        navUserText.classList.remove('hidden');
    }
}

// Verifica automatica all'apertura del sito se l'utente era già registrato/loggato
async function controllaSessione() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session && session.user) {
        aggiornaInterfacciaUtente(session.user);
    }
}
controllaSessione();