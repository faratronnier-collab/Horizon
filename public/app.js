const socket = io();

socket.on("connect", () => {
    console.log("✅ Socket connecté");
});

socket.on("new-post", (post) => {
    console.log("✅ Nouveau post reçu", post);

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

        <div class="user-line">

<img src= https://ui-avatars.com/api/?name=${post.username}&background=random>

<strong>${post.username}</strong>

</div>

</div>
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


loadPosts();

const currentUser =
localStorage.getItem("username");

if(currentUser){

    document.getElementById(
        "welcome"
    ).innerHTML =

    `✅ Connecté en tant que
    <strong>${currentUser}</strong>`;

}