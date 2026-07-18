const apiBaseUrl = "https://api.framioki.com";

const token =
    localStorage.getItem("access_token");

const welcomeText =
    document.getElementById("welcomeText");

const logoutButton =
    document.getElementById("logoutButton");

const apkStatus =
    document.getElementById("apkStatus");

const apkDetails =
    document.getElementById("apkDetails");

const apkFilename =
    document.getElementById("apkFilename");

const apkSize =
    document.getElementById("apkSize");

const apkLastModified =
    document.getElementById("apkLastModified");

const downloadButton =
    document.getElementById("downloadButton");

const downloadStatus =
    document.getElementById("downloadStatus");

const feedbackCategory =
    document.getElementById("feedbackCategory");

const feedbackMessage =
    document.getElementById("feedbackMessage");

const feedbackButton =
    document.getElementById("feedbackButton");

const feedbackStatus =
    document.getElementById("feedbackStatus");

function logout() {
    localStorage.removeItem("access_token");
    window.location.href = "index.html";
}


function getAuthorizationHeaders() {
    return {
        "Authorization": `Bearer ${token}`
    };
}


function formatDate(value) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Unbekannt";
    }

    return new Intl.DateTimeFormat(
        "de-DE",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    ).format(date);
}


async function loadCurrentUser() {
    if (!token) {
        logout();
        return false;
    }

    try {
        const response = await fetch(
            `${apiBaseUrl}/auth/me`,
            {
                headers: getAuthorizationHeaders()
            }
        );

        if (response.status === 401 ||
            response.status === 403) {
            logout();
            return false;
        }

        if (!response.ok) {
            throw new Error(
                `HTTP-Fehler ${response.status}`
            );
        }

        const user = await response.json();

        welcomeText.textContent =
            `Willkommen, ${user.username}!`;

        return true;
    }
    catch (error) {
        console.error(error);

        welcomeText.textContent =
            "Der Server ist derzeit nicht erreichbar.";

        return false;
    }
}


async function loadApkInfo() {
    try {
        const response = await fetch(
            `${apiBaseUrl}/tester/apk/info`,
            {
                headers: getAuthorizationHeaders()
            }
        );

        if (response.status === 401 ||
            response.status === 403) {
            logout();
            return;
        }

        if (response.status === 404) {
            apkStatus.textContent =
                "Aktuell ist keine APK verfügbar.";

            apkDetails.hidden = true;
            downloadButton.disabled = true;
            return;
        }

        if (!response.ok) {
            throw new Error(
                `HTTP-Fehler ${response.status}`
            );
        }

        const apk = await response.json();

        apkFilename.textContent =
            apk.filename;

        apkSize.textContent =
            `${apk.size_mb.toFixed(2)} MB`;

        apkLastModified.textContent =
            formatDate(apk.last_modified);

        apkStatus.textContent =
            "Die aktuelle Testversion steht bereit.";

        apkDetails.hidden = false;
        downloadButton.disabled = false;
    }
    catch (error) {
        console.error(error);

        apkStatus.textContent =
            "Die APK-Informationen konnten nicht geladen werden.";

        apkDetails.hidden = true;
        downloadButton.disabled = true;
    }
}


async function downloadApk() {
    downloadButton.disabled = true;
    downloadStatus.textContent =
        "Download wird vorbereitet …";

    try {
        const response = await fetch(
            `${apiBaseUrl}/tester/apk/download`,
            {
                headers: getAuthorizationHeaders()
            }
        );

        if (
            response.status === 401 ||
            response.status === 403
        ) {
            logout();
            return;
        }

        if (response.status === 404) {
            downloadStatus.textContent =
                "Aktuell ist keine APK verfügbar.";

            return;
        }

        if (!response.ok) {
            throw new Error(
                `HTTP-Fehler ${response.status}`
            );
        }

        const apkBlob = await response.blob();

        const downloadUrl =
            URL.createObjectURL(apkBlob);

        const downloadLink =
            document.createElement("a");

        downloadLink.href = downloadUrl;
        downloadLink.download =
            apkFilename.textContent ||
            "framioki-latest.apk";

        document.body.appendChild(downloadLink);
        downloadLink.click();
        downloadLink.remove();

        URL.revokeObjectURL(downloadUrl);

        downloadStatus.textContent =
            "Der Download wurde gestartet.";

        downloadButton.disabled = false;
    }
    catch (error) {
        console.error(error);

        downloadStatus.textContent =
            "Die APK konnte nicht heruntergeladen werden.";

        downloadButton.disabled = false;
    }
}

async function submitFeedback() {

    const category =
        feedbackCategory.value.trim();

    const message =
        feedbackMessage.value.trim();

    if (message.length === 0) {

        feedbackStatus.textContent =
            "Bitte gib eine Nachricht ein.";

        return;
    }

    feedbackButton.disabled = true;

    feedbackStatus.textContent =
        "Feedback wird gesendet...";

    try {

        const response = await fetch(
            `${apiBaseUrl}/tester/feedback`,
            {
                method: "POST",

                headers: {
                    ...getAuthorizationHeaders(),
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    category,
                    message,
                    app_version:
                        apkFilename.textContent,
                    device_info:
                        navigator.userAgent
                })
            }
        );

        if (
            response.status === 401 ||
            response.status === 403
        ) {
            logout();
            return;
        }

        const result =
            await response.json();

        feedbackStatus.textContent =
            result.message;

        if (result.success) {

            feedbackMessage.value = "";

            feedbackCategory.selectedIndex = 0;
        }

    }
    catch (error) {

        console.error(error);

        feedbackStatus.textContent =
            "Feedback konnte nicht gesendet werden.";
    }

    feedbackButton.disabled = false;
}

async function initializeDashboard() {
    const loginIsValid =
        await loadCurrentUser();

    if (!loginIsValid) {
        return;
    }

    await loadApkInfo();
}


logoutButton.addEventListener(
    "click",
    logout
);

downloadButton.addEventListener(
    "click",
    downloadApk
);

feedbackButton.addEventListener(
    "click",
    submitFeedback
);

initializeDashboard();