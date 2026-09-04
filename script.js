const SUPABASE_URL = "https://ywkgihzhlokkwozxsphi.supabase.co";

const SUPABASE_KEY = "sb_publishable_5og_eUGWU3fp5AEUoDoBuA_y4tZq2el";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// Pages
const homePage = document.getElementById("homePage");
const createPage = document.getElementById("createPage");
const sharePage = document.getElementById("sharePage");
const answerPage = document.getElementById("answerPage");
const thankPage = document.getElementById("thankPage");


// Boutons
const createButton = document.getElementById("createButton");
const backButton = document.getElementById("backButton");
const generateButton = document.getElementById("generateButton");
const copyButton = document.getElementById("copyButton");
const newQuestionButton = document.getElementById("newQuestionButton");

const greenButton = document.getElementById("greenButton");
const redButton = document.getElementById("redButton");


// Champs
const questionInput = document.getElementById("questionInput");
const charCount = document.getElementById("charCount");
const generatedLink = document.getElementById("generatedLink");
const errorMessage = document.getElementById("errorMessage");
const copyMessage = document.getElementById("copyMessage");

const questionText = document.getElementById("questionText");
const answerMessage = document.getElementById("answerMessage");


// ID de la question actuelle
let currentQuestionId = null;


// Afficher une seule page
function showPage(page) {

    homePage.classList.add("hidden");
    createPage.classList.add("hidden");
    sharePage.classList.add("hidden");
    answerPage.classList.add("hidden");
    thankPage.classList.add("hidden");

    page.classList.remove("hidden");
}


// Accueil → création
createButton.addEventListener("click", function () {
    showPage(createPage);
});


// Retour
backButton.addEventListener("click", function () {
    showPage(homePage);
});


// Compteur de caractères
questionInput.addEventListener("input", function () {

    charCount.textContent =
        `${questionInput.value.length} / 250`;

});


// Créer une question
generateButton.addEventListener("click", async function () {

    const question = questionInput.value.trim();

    if (question.length < 5) {

        errorMessage.textContent =
            "Écris une question d'au moins 5 caractères.";

        return;
    }

    errorMessage.textContent = "";

    generateButton.disabled = true;
    generateButton.textContent = "Création...";


    const { data, error } = await supabaseClient
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


    // Créer le lien public
    const link =
        `${window.location.origin}${window.location.pathname}?id=${data.id}`;

    generatedLink.textContent = link;

    showPage(sharePage);

    generateButton.disabled = false;
    generateButton.textContent =
        "Créer mon lien 🔗";

});


// Copier le lien
copyButton.addEventListener("click", async function () {

    const link = generatedLink.textContent;

    try {

        await navigator.clipboard.writeText(link);

        copyMessage.textContent =
            "Lien copié ! ✅";

    } catch (error) {

        copyMessage.textContent =
            "Impossible de copier le lien.";

    }

});


// Nouvelle question
newQuestionButton.addEventListener("click", function () {

    questionInput.value = "";

    charCount.textContent = "0 / 250";

    copyMessage.textContent = "";

    showPage(createPage);

});


// Charger une question depuis le lien
async function loadQuestion() {

    const params =
        new URLSearchParams(window.location.search);

    const id = params.get("id");
console.log("ID reçu :", id);

    // Aucun ID = page d'accueil
    if (!id) {
        return;
    }


    currentQuestionId = id;


    const { data, error } = await supabaseClient
        .from("questions")
        .select("question")
        .eq("id", id)
        .single();


    if (error) {

        console.error(error);

        questionText.textContent =
            "Cette question n'existe pas ou n'est plus disponible.";

        showPage(answerPage);

        greenButton.disabled = true;
        redButton.disabled = true;

        return;
    }


    questionText.textContent = data.question;

    showPage(answerPage);

}


// Envoyer une réponse
async function sendAnswer(answer) {

    if (!currentQuestionId) {
        return;
    }


    greenButton.disabled = true;
    redButton.disabled = true;

    answerMessage.textContent = "Envoi...";


    const { error } = await supabaseClient
        .from("responses")
        .insert({
            question_id: currentQuestionId,
            answer: answer
        });


    if (error) {

        console.error(error);

        answerMessage.textContent =
            "Une erreur est survenue. Réessaie.";

        greenButton.disabled = false;
        redButton.disabled = false;

        return;
    }


    showPage(thankPage);

}


// Bouton GREEN FLAG
greenButton.addEventListener("click", function () {

    sendAnswer("GREEN");

});


// Bouton RED FLAG
redButton.addEventListener("click", function () {

    sendAnswer("RED");

});


// Démarrage
loadQuestion();
