const socket = io();
socket.on(
    "new-post",
    () => {

        loadPosts();

    }
);
async function publish() {

    const username =
localStorage.getItem("username");
    const content =
        document.getElementById("content").value;

    if (!username || !content) {

        alert(
            "Remplis le pseudo et le message"
        );

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

    const user =
localStorage.getItem("username");

if(user){

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

}

async function loadPosts() {

    const response =
        await fetch("/posts");

    const posts =
        await response.json();

    const feed =
        document.getElementById("feed");

    feed.innerHTML = "";

    posts.forEach(async post => {

    const currentUser =
        localStorage.getItem("username");

    let adminButton = "";

    if(currentUser){

        const adminCheck =
            await fetch(
                `/admin/${currentUser}`
            );

        const adminData =
            await adminCheck.json();

        if(adminData?.is_admin){

            adminButton = `
                <button
                onclick="deletePost(${post.id})">
                🗑️ Supprimer
                </button>
            `;
        }

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

});

}

loadPosts();

function logout() {

    localStorage.clear();

    window.location.href = "/login.html";

}
async function deletePost(id){

    const username =
        localStorage.getItem("username");

    await fetch(`/posts/${id}`,{

        method:"DELETE",

        headers:{
            username
        }

    });

    loadPosts();

}
