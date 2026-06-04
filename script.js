const SUPABASE_URL = "https://qphtafhpmazzkevtmftp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwaHRhZmhwbWF6emtldnRtdGZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1NjIwODksImV4cCI6MjA5NjEzODA4OX0.rpOOfxGgaAvO_VP5EkPkadcNRgHMeekrX4wegNDWhvY";

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const authSection = document.getElementById('auth-section');
const quizSection = document.getElementById('quiz-section');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const btnAction = document.getElementById('btn-action');
const linkSwitch = document.getElementById('link-switch');
const authInstruction = document.getElementById('auth-instruction');
const toggleContainer = document.getElementById('toggle-container');
const btnLogout = document.getElementById('btn-logout');

let isLoginMode = true;

linkSwitch.addEventListener('click', (e) => {
    e.preventDefault();
    isLoginMode = !isLoginMode;
    
    if (isLoginMode) {
        authInstruction.innerText = "Accedi per sbloccare i quiz gratuiti";
        btnAction.innerText = "Accedi";
        toggleContainer.innerHTML = 'Non hai un account? <a href="#" id="link-switch">Registrati qui</a>';
    } else {
        authInstruction.innerText = "Crea un account gratuito per partecipare";
        btnAction.innerText = "Registrati";
        toggleContainer.innerHTML = 'Hai già un account? <a href="#" id="link-switch">Accedi qui</a>';
    }
    document.getElementById('link-switch').addEventListener('click', arguments.callee);
});

btnAction.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
        alert("Per favore, compila tutti i campi.");
        return;
    }

    if (isLoginMode) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            alert("Errore di accesso: " + error.message);
        } else {
            mostraAreaRiservata();
        }
    } else {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if (error) {
            alert("Errore di registrazione: " + error.message);
        } else {
            alert("Registrazione completata! Se hai lasciato attiva la conferma via email su Supabase, controlla la tua posta. Altrimenti puoi già fare il login.");
            linkSwitch.click();
        }
    }
});

btnLogout.addEventListener('click', async () => {
    await supabase.auth.signOut();
    quizSection.classList.add('hidden');
    authSection.classList.remove('hidden');
    emailInput.value = "";
    passwordInput.value = "";
});

function mostraAreaRiservata() {
    authSection.classList.add('hidden');
    quizSection.classList.remove('hidden');
}

async function controllaSessione() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        mostraAreaRiservata();
    }
}
controllaSessione();
