// ======================================================
// REDFLAG — SCRIPT PRINCIPAL
// ======================================================

// -----------------------------
// SUPABASE
// -----------------------------

const SUPABASE_URL = "https://ywkgihzhlokkwozxsphi.supabase.co";

// Utilise ici ta clé Publishable Supabase actuelle.
// Ne mets JAMAIS une clé secrète/service_role dans ce fichier.
const SUPABASE_KEY = "sb_publishable_5og_eUGWU3fp5AEUoDoBuA_y4tZq2el";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// -----------------------------
// ÉLÉMENTS HTML
// -----------------------------

const homePage = document.getElementById("homePage");
const createPage = document.getElementById("createPage");
const sharePage = document.getElementById("sharePage");
const answerPage = document.getElementById("answerPage");
const thankPage = document.getElementById("thankPage");

const startButton = document.getElementById("createButton");

const questionInput = document.getElementById("questionInput");
const generateButton = document.getElementById("generateButton");
const errorMessage = document.getElementById("errorMessage");

const generatedLink = document.getElementById("generatedLink");
const copyButton = document.getElementById("copyButton");
const copyMessage = document.getElementById("copyMessage");

const notificationButton =
    document.getElementById("notificationButton");

const notificationMessage =
    document.getElementById("notificationMessage");

const newQuestionButton =
    document.getElementById("newQuestionButton");

const questionDisplay =
    document.getElementById("questionText");

const greenButton =
    document.getElementById("greenButton");

const redButton =
    document.getElementById("redButton");

const answerMessage =
    document.getElementById("answerMessage");


// -----------------------------
// VARIABLES
// -----------------------------

let currentQuestionId = null;


// -----------------------------
// CHANGEMENT DE PAGE
// -----------------------------

function showPage(page) {

    const pages = [
        homePage,
        createPage,
        sharePage,
        answerPage,
        thankPage
    ];

    pages.forEach(function (item) {

        if (item) {
            item.classList.add("hidden");
        }

    });

    if (page) {
        page.classList.remove("hidden");
    }
}


// -----------------------------
// PAGE D'ACCUEIL
// -----------------------------

if (startButton) {

    startButton.addEventListener("click", function () {

        showPage(createPage);

    });

}


// -----------------------------
// CRÉER UNE QUESTION
// -----------------------------

if (generateButton) {

    generateButton.addEventListener(
        "click",
        async function () {

            const question =
                questionInput.value.trim();

            if (question.length < 5) {

                errorMessage.textContent =
                    "Écris une question d'au moins 5 caractères.";

                return;
            }

            errorMessage.textContent = "";

            generateButton.disabled = true;

            generateButton.textContent =
                "Création...";

            const { data, error } =
                await supabaseClient
                    .from("questions")
                    .insert({
                        question: question
                    })
                    .select("id")
                    .single();

            if (error) {

                console.error(error);

                errorMessage.textContent =
                    "Une erreur est survenue. Réessaie.";

                generateButton.disabled = false;

                generateButton.textContent =
                    "Créer mon lien 🔗";

                return;
            }

            currentQuestionId = data.id;

            const link =
                `${window.location.origin}${window.location.pathname}?id=${data.id}`;

            generatedLink.textContent = link;

            showPage(sharePage);

            generateButton.disabled = false;

            generateButton.textContent =
                "Créer mon lien 🔗";

        }
    );

}


// -----------------------------
// COPIER LE LIEN
// -----------------------------

if (copyButton) {

    copyButton.addEventListener(
        "click",
        async function () {

            const link =
                generatedLink.textContent.trim();

            if (!link) {

                copyMessage.textContent =
                    "Aucun lien à copier.";

                return;
            }

            try {

                await navigator.clipboard.writeText(link);

                copyMessage.textContent =
                    "Lien copié ! 📋";

            } catch (error) {

                console.error(error);

                copyMessage.textContent =
                    "Impossible de copier le lien.";

            }

        }
    );

}


// -----------------------------
// NOUVELLE QUESTION
// -----------------------------

if (newQuestionButton) {

    newQuestionButton.addEventListener(
        "click",
        function () {

            currentQuestionId = null;

            questionInput.value = "";

            generatedLink.textContent = "";

            copyMessage.textContent = "";

            notificationMessage.textContent = "";

            errorMessage.textContent = "";

            showPage(createPage);

        }
    );

}


// ======================================================
// NOTIFICATIONS PUSH
// ======================================================

// Clé publique VAPID.
// La clé privée VAPID reste UNIQUEMENT dans Supabase Edge Functions.

const publicVapidKey =
    "BHOLoTHoNc76zHGJq2YjCHp3j4mcMvVKDSWBw8ecajwGEC7xe-sffa5OKbpJBQHQu_EcmOx25iU8gaLg8eMBVqs";


// -----------------------------
// Conversion clé VAPID
// -----------------------------

function urlBase64ToUint8Array(base64String) {

    const padding =
        "=".repeat(
            (4 - base64String.length % 4) % 4
        );

    const base64 =
        (base64String + padding)
            .replace(/-/g, "+")
            .replace(/_/g, "/");

    const rawData =
        window.atob(base64);

    return Uint8Array.from(
        [...rawData].map(function (char) {

            return char.charCodeAt(0);

        })
    );

}


// -----------------------------
// ACTIVER LES NOTIFICATIONS
// -----------------------------

if (notificationButton) {

    notificationButton.addEventListener(
        "click",
        async function () {

            if (!("Notification" in window)) {

                notificationMessage.textContent =
                    "Les notifications ne sont pas supportées.";

                return;
            }

            if (!("serviceWorker" in navigator)) {

                notificationMessage.textContent =
                    "Les notifications ne sont pas disponibles.";

                return;
            }

            if (!currentQuestionId) {

                notificationMessage.textContent =
                    "Crée d'abord une question.";

                return;
            }

            try {

                notificationMessage.textContent =
                    "Activation...";

                const permission =
                    await Notification.requestPermission();

                if (permission !== "granted") {

                    notificationMessage.textContent =
                        "Notifications non autorisées.";

                    return;
                }

                const registration =
                    await navigator.serviceWorker.ready;

                let subscription =
                    await registration.pushManager
                        .getSubscription();

                if (!subscription) {

                    subscription =
                        await registration.pushManager.subscribe({

                            userVisibleOnly: true,

                            applicationServerKey:
                                urlBase64ToUint8Array(
                                    publicVapidKey
                                )

                        });

                }

                // Évite d'ajouter une nouvelle ligne
                // inutilement si l'abonnement existe déjà.

                const { error } =
                    await supabaseClient
                        .from("push_subscriptions")
                        .insert({

                            question_id:
                                currentQuestionId,

                            subscription:
                                subscription.toJSON()

                        });

                if (error) {

                    console.error(error);

                    notificationMessage.textContent =
                        "Impossible d'activer les notifications.";

                    return;
                }

                notificationMessage.textContent =
                    "Notifications activées ! 🔔";

                console.log(
                    "Abonnement enregistré :",
                    subscription
                );

            } catch (error) {

                console.error(error);

                notificationMessage.textContent =
                    "Une erreur est survenue.";

            }

        }
    );

}


// ======================================================
// PAGE DE RÉPONSE
// ======================================================

async function loadQuestion() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const id =
        params.get("id");

    console.log("ID reçu :", id);

    if (!id) {

        showPage(homePage);

        return;
    }

    currentQuestionId = id;

    const { data, error } =
        await supabaseClient
            .from("questions")
            .select("question")
            .eq("id", id)
            .single();

    if (error || !data) {

        console.error(error);

        if (answerMessage) {

            answerMessage.textContent =
                "Cette question n'existe pas ou n'est plus disponible.";

        }

        showPage(answerPage);

        return;
    }

    questionDisplay.textContent =
        data.question;

    showPage(answerPage);

}


// -----------------------------
// ENVOYER UNE RÉPONSE
// -----------------------------

async function sendAnswer(answer) {

    if (!currentQuestionId) {

        return;
    }

    greenButton.disabled = true;

    redButton.disabled = true;

    answerMessage.textContent =
        "Envoi...";

    const { error } =
        await supabaseClient
            .from("responses")
            .insert({

                question_id:
                    currentQuestionId,

                answer:
                    answer

            });

    if (error) {

        console.error(error);

        answerMessage.textContent =
            "Une erreur est survenue. Réessaie.";

        greenButton.disabled = false;

        redButton.disabled = false;

        return;
    }

    // La réponse est enregistrée.
    // La notification automatique sera gérée
    // par la fonction Edge Supabase.

    showPage(thankPage);

}


// -----------------------------
// GREEN FLAG
// -----------------------------

if (greenButton) {

    greenButton.addEventListener(
        "click",
        function () {

            sendAnswer("GREEN");

        }
    );

}


// -----------------------------
// RED FLAG
// -----------------------------

if (redButton) {

    redButton.addEventListener(
        "click",
        function () {

            sendAnswer("RED");

        }
    );

}


// ======================================================
// SERVICE WORKER
// ======================================================

if ("serviceWorker" in navigator) {

    window.addEventListener(
        "load",
        async function () {

            try {

                const registration =
                    await navigator.serviceWorker.register(
                        "./sw.js"
                    );

                console.log(
                    "Service Worker RedFlag activé :",
                    registration
                );

            } catch (error) {

                console.error(
                    "Erreur Service Worker :",
                    error
                );

            }

        }
    );

}


// ======================================================
// DÉMARRAGE
// ======================================================

loadQuestion();
