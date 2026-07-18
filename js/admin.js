const apiBaseUrl = "https://api.framioki.com";

const token = localStorage.getItem("access_token");

const feedbackList =
    document.getElementById("feedbackList");

if (!token) {
    window.location.href = "index.html";
}

async function loadFeedback() {
    try {
        const response = await fetch(
            `${apiBaseUrl}/admin/feedback`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (response.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "index.html";
            return;
        }

        if (!response.ok) {
            throw new Error(
                `HTTP-Fehler: ${response.status}`
            );
        }

        const feedback = await response.json();

        renderFeedback(feedback);
    } catch (error) {
        console.error(
            "Feedback konnte nicht geladen werden:",
            error
        );

        feedbackList.textContent =
            "Das Feedback konnte nicht geladen werden.";
    }
}

function renderFeedback(feedback) {
    feedbackList.replaceChildren();

    if (feedback.length === 0) {
        const message = document.createElement("p");

        message.textContent =
            "Noch kein Feedback vorhanden.";

        feedbackList.appendChild(message);
        return;
    }

    feedback.forEach((item) => {
        const card =
            document.createElement("article");

        card.className = "feedback-card";

        const category =
            document.createElement("h3");

        category.textContent = item.category;

        const author =
            document.createElement("p");

        const authorLabel =
            document.createElement("strong");

        authorLabel.textContent = "Von: ";

        author.append(
            authorLabel,
            item.username
        );

        const date =
            document.createElement("p");

        const dateLabel =
            document.createElement("strong");

        dateLabel.textContent = "Datum: ";

        date.append(
            dateLabel,
            formatDate(item.created_at)
        );

        const appVersion =
            document.createElement("p");

        const appVersionLabel =
            document.createElement("strong");

        appVersionLabel.textContent =
            "App-Version: ";

        appVersion.append(
            appVersionLabel,
            item.app_version || "Keine Angabe"
        );

        const deviceInfo =
            document.createElement("p");

        const deviceInfoLabel =
            document.createElement("strong");

        deviceInfoLabel.textContent =
            "Gerät: ";

        deviceInfo.append(
            deviceInfoLabel,
            item.device_info || "Keine Angabe"
        );

        const message =
            document.createElement("p");

        const messageLabel =
            document.createElement("strong");

        messageLabel.textContent =
            "Nachricht:";

        const messageText =
            document.createElement("span");

        messageText.className =
            "feedback-message";

        messageText.textContent =
            item.message;

        message.append(
            messageLabel,
            messageText
        );

        const statusArea =
            createStatusArea(item);

        card.append(
            category,
            author,
            date,
            appVersion,
            deviceInfo,
            message,
            statusArea
        );

        feedbackList.appendChild(card);
    });
}

function createStatusArea(item) {
    const container =
        document.createElement("div");

    container.className =
        "feedback-status-area";

    const label =
        document.createElement("label");

    label.textContent = "Status";

    label.htmlFor =
        `feedback-status-${item.id}`;

    const select =
        document.createElement("select");

    select.id =
        `feedback-status-${item.id}`;

    select.className =
        "feedback-status-select";

    const statuses = [
        "Offen",
        "In Bearbeitung",
        "Erledigt"
    ];

    statuses.forEach((status) => {
        const option =
            document.createElement("option");

        option.value = status;
        option.textContent = status;

        if (status === item.status) {
            option.selected = true;
        }

        select.appendChild(option);
    });

    const statusMessage =
        document.createElement("span");

    statusMessage.className =
        "feedback-status-message";

    select.addEventListener(
        "change",
        () => {
            updateFeedbackStatus(
                item.id,
                select.value,
                select,
                statusMessage
            );
        }
    );

    container.append(
        label,
        select,
        statusMessage
    );

    return container;
}

async function updateFeedbackStatus(
    feedbackId,
    newStatus,
    select,
    statusMessage
) {
    select.disabled = true;

    statusMessage.textContent =
        "Wird gespeichert...";

    try {
        const response = await fetch(
            `${apiBaseUrl}/admin/feedback/${feedbackId}/status`,
            {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    status: newStatus
                })
            }
        );

        if (response.status === 401) {
            localStorage.removeItem(
                "access_token"
            );

            window.location.href =
                "index.html";

            return;
        }

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.detail ||
                "Status konnte nicht gespeichert werden."
            );
        }

        statusMessage.textContent =
            "Gespeichert";

        setTimeout(() => {
            statusMessage.textContent = "";
        }, 2000);
    } catch (error) {
        console.error(
            "Status konnte nicht aktualisiert werden:",
            error
        );

        statusMessage.textContent =
            error.message;
    } finally {
        select.disabled = false;
    }
}

function formatDate(dateValue) {
    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return dateValue;
    }

    return date.toLocaleString("de-DE", {
        dateStyle: "medium",
        timeStyle: "short"
    });
}

loadFeedback();