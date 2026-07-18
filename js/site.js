const apiBaseUrl = "https://api.framioki.com";

async function login(event) {
    event.preventDefault();

    const username =
        document.getElementById("username").value;

    const password =
        document.getElementById("password").value;

    try {

        const response = await fetch(
            `${apiBaseUrl}/auth/login`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username,
                    password
                })
            });

        if (!response.ok) {
            alert("Benutzername oder Passwort falsch.");
            return;
        }

        const token = await response.json();

        localStorage.setItem(
            "access_token",
            token.access_token);

        window.location.href = "dashboard.html";

    }
    catch {

        alert("Server nicht erreichbar.");
    }
}

document
    .getElementById("loginForm")
    .addEventListener("submit", login);