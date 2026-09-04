const SUPABASE_URL = "https://ywkgihzhlokkwozxsphi.supabase.co";

const SUPABASE_KEY = "sb_publishable_8VF25OTarAE1k2g7fmZGig_oSqGsSSK";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// Pages
const homePage = document.getElementById("homePage");
const createPage = document.getElementById("createPage");
const sharePage = document.getElementById("sharePage");


// Boutons
const createButton = document.getElementById("createButton");
const backButton = document.getElementById("backButton");
const generateButton = document.getElementById("generateButton");
const copyButton = document.getElementById("copyButton");
const newQuestionButton =
    document.getElementById("newQuestionButton");


// Champs
const questionInput =
    document.getElementById("questionInput");

const charCount =
    document.getElementById("charCount");

const generatedLink =
    document.getElementById("generatedLink");

const errorMessage =
    document.getElementById("errorMessage");

const copyMessage =
    document.getElementById("copyMessage");


// Aller vers la création
createButton.addEventListener("click", function () {

    homePage.classList.add("hidden");
    createPage.classList.remove("hidden");

});


// Retour
backButton.addEventListener("click", function () {

    createPage.classList.add("hidden");
    homePage.classList.remove("hidden");

});


// Compteur de caractères
questionInput.addEventListener("input", function () {

    charCount.textContent =
        `${questionInput.value.length} / 250`;

});


// Créer la question
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


    // Enregistrer la question dans Supabase
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


    // Créer le vrai lien
    const link =
        `${window.location.origin}${window.location.pathname}?id=${data.id}`;

    generatedLink.textContent = link;


    // Afficher la page de partage
    createPage.classList.add("hidden");
    sharePage.classList.remove("hidden");


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

    sharePage.classList.add("hidden");
    createPage.classList.remove("hidden");

});
