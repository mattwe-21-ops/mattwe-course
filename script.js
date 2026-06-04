const SUPABASE_URL = "https://qphtafhpmazzkevtmftp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwaHRhZmhwbWF6emtldnRtdGZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1NjIwODksImV4cCI6MjA5NjEzODA4OX0.rpOOfxGgaAvO_VP5EkPkadcNRgHMeekrX4wegNDWhvY";

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Elementi DOM
const authSection = document.getElementById('auth-section');
const quizSection = document.getElementById('quiz-section');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const btnAction = document.getElementById('btn-action');
const linkSwitch = document.getElementById('link-switch');
const switchDesc = document.getElementById('switch-desc');
const mainSubtitle = document.getElementById('main-subtitle');
const statusMessage = document.getElementById('status-message');
const btnLogout = document.getElementById('btn-logout');

let isLoginMode = true;

// Funzione per mostrare messaggi di stato dinamici
function showMessage(text, type) {
    statusMessage.innerText = text;
    statusMessage.className = "status-box"; // Reset delle classi
    
    if (type === 'error') statusMessage.classList.add('status-error');
    if (type === 'success') statusMessage.classList.add('status-success');
    if (type === 'loading') statusMessage.classList.add('status-loading');
}

function hideMessage() {
    statusMessage.style.display = 'none';
    statusMessage.className = "status-box";
}

// Gestione del cambio dinamico della scheda (Login <-> Registrazione)
linkSwitch.addEventListener('click', (e) => {
    e.preventDefault();
    isLoginMode = !isLoginMode;
    hideMessage();
    
    if (isLoginMode) {
        mainSubtitle.innerText = "Area Login";
        passwordInput.placeholder = "Inserisci la tua Password";
        btnAction.innerText = "Accedi";
        switchDesc.innerText = "Non hai un account?";
        linkSwitch.innerText = "Registrati qui";
        btnAction.style.backgroundColor = "#007bff";
    } else {
        mainSubtitle.innerText = "Crea un Account Gratuito";
        passwordInput.placeholder = "Scegli una Password sicura";
        btnAction.innerText = "Registrati Ora";
        switchDesc.innerText = "Hai già un account?";
        linkSwitch.innerText = "Accedi qui";
        btnAction.style.backgroundColor = "#28a745"; // Diventa verde in modalità registrazione
    }
});

// Invio dei moduli a Supabase
btnAction.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
        showMessage("Attenzione: Compila tutti i campi richiesti.", "error");
        return;
    }
    
    if (password.length < 6) {
        showMessage("La password deve contenere almeno 6 caratteri.", "error");
        return;
    }

    // Stato di caricamento dinamico
    btnAction.disabled = true;
    const originalBtnText = btnAction.innerText;
    btnAction.innerText = isLoginMode ? "Connessione in corso..." : "Creazione account...";
    showMessage("Elaborazione della richiesta con il server...", "loading");

    if (isLoginMode) {
        // LOGIN
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            showMessage("Errore: Credenziali non valide o utente inesistente.", "error");
            btnAction.disabled = false;
            btnAction.innerText = originalBtnText;
        } else {
            hideMessage();
            mostraAreaRiservata();
        }
    } else {
        // REGISTRAZIONE
        const { data, error } = await supabase.auth.signUp({ email, password });

        if (error) {
            showMessage("Errore durante la registrazione: " + error.message, "error");
            btnAction.disabled = false;
            btnAction.innerText = originalBtnText;
        } else {
            showMessage("Registrazione completata con successo! Ora puoi effettuare il login.", "success");
            // Forza il ritorno alla modalità login
            isLoginMode = false;
            linkSwitch.click();
            emailInput.value = email; // Mantiene l'email scritta per comodità
            passwordInput.value = "";
            btnAction.disabled = false;
        }
    }
});

// LOGOUT
btnLogout.addEventListener('click', async () => {
    await supabase.auth.signOut();
    quizSection.classList.add('hidden');
    authSection.classList.remove('hidden');
    mainSubtitle.innerText = "Area Login";
    emailInput.value = "";
    passwordInput.value = "";
    hideMessage();
});

function mostraAreaRiservata() {
    authSection.classList.add('hidden');
    quizSection.classList.remove('hidden');
    mainSubtitle.innerText = "Pannello Utente";
}

// Controllo sessione precedente automatica
async function controllaSessione() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        mostraAreaRiservata();
    }
}
controllaSessione();