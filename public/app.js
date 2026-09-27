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

    posts.forEach(post => {

        feed.innerHTML += `

        <div class="post">

            <strong>
                ${post.username || "Anonyme"}
            </strong>

            <br>

            ${post.content}

        </div>

        `;

    });

}

loadPosts();

function logout(){

    localStorage.removeItem("token");
    localStorage.removeItem("username");

    location.reload();

}