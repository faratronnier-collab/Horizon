import express from "express";
import cors from "cors";
import db from "./db.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static("public"));

/* =========================
   FILTRE HORIZON
========================= */

const bannedWords = [

"con",
"connard",
"connasse",
"fdp",
"pute",
"putain",
"encule",
"enculé",
"salope",
"batard",
"bâtard",
"nique",
"ta gueule",
"abruti",
"idiot",
"débile",
"crétin",
"mongol",
"porc",
"bouffon",
"guignol",
"merde",
"bordel",
"enfoiré",
"pétasse",
"sale con",
"sale pute",
"trou du cul",
"cassos",
"loser",
"va mourir",
"bite",
"couille",
"burne",
"chatte",
"fils de pute"

];

function censor(text) {

    let result = text;

    result = result.replaceAll("<", "&lt;");
    result = result.replaceAll(">", "&gt;");

    bannedWords.forEach(word => {

        const regex = new RegExp(word, "gi");

        result = result.replace(
            regex,
            "*".repeat(word.length)
        );

    });

    return result;

}

/* =========================
   POSTS
========================= */

app.get("/posts", async (req, res) => {

    try {

        const result = await db.query(
            `
            SELECT *
            FROM posts
            ORDER BY created_at DESC
            `
        );

        res.json(result.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Erreur serveur"
        });

    }

});

app.post("/posts", async (req, res) => {

    try {

        const { username, content } = req.body;

        const filteredContent =
            censor(content);

        const result = await db.query(
            `
            INSERT INTO posts
            (username, content)
            VALUES($1, $2)
            RETURNING *
            `,
            [username, filteredContent]
        );

        res.json(result.rows[0]);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Erreur serveur"
        });

    }

});

/* =========================
   LANCEMENT
========================= */

app.listen(3000, () => {

    console.log(
        "🌅 Horizon lancé sur http://localhost:3000"
    );

});