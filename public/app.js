const socket = io();

socket.on("new-post", () => {
    loadPosts();
});

async function publish() {

    const username =
        localStorage.getItem("username");

    const content =
        document.getElementById("content").value;

    if (!username) {

        alert("Connecte-toi d'abord");
        return;

    }

    if (!content) {
        return;
    }

    await fetch("/posts", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            username,
            content
        })

    });

    document.getElementById("content").value = "";

}

async function loadPosts() {

    const response =
        await fetch("/posts");

    const posts =
        await response.json();

    const feed =
        document.getElementById("feed");

    feed.innerHTML = "";

    const currentUser =
        localStorage.getItem("username");

    let isAdmin = false;

    if (currentUser) {

        try {

            const adminCheck =
                await fetch(
                    `/admin/${currentUser}`
                );

            const adminData =
                await adminCheck.json();

            isAdmin =
                adminData?.is_admin === true;

        } catch (error) {

            console.error(error);

        }

    }

    for (const post of posts) {

        let adminButton = "";

        if (isAdmin) {

            adminButton = `
                <button
                onclick="deletePost(${post.id})">
                🗑️ Supprimer
                </button>
            `;
        }

        feed.innerHTML += `

        <div class="post">

            <strong>
                ${post.username}
            </strong>

            <br>

            ${post.content}

            <br><br>

            ${adminButton}

        </div>

        `;

    }

}

function logout() {

    localStorage.clear();

    window.location.href =
        "/login.html";

}

async function deletePost(id) {

    const username =
        localStorage.getItem("username");

    await fetch(`/posts/${id}`, {

        method: "DELETE",

        headers: {
            username
        }

    });

    loadPosts();

}

const user =
    localStorage.getItem("username");

if (user) {

    document.body.insertAdjacentHTML(
        "afterbegin",

        `
        <p>
        ✅ Connecté en tant que
        <strong>${user}</strong>
        </p>
        `
    );

}

loadPosts();