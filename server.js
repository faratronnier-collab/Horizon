import express from "express";
import cors from "cors";
import db from "./db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();

const server = createServer(app);

const io = new Server(server,{
    cors:{
        origin:"*"
    }
});
const SECRET = "HORIZON_SECRET_2026";

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
        io.emit(
    "new-post",
    result.rows[0]
);

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

const PORT = process.env.PORT || 3000;

app.post("/register", async (req, res) => {

    try {

        const {
            username,
            email,
            password
        } = req.body;

        const hash =
            await bcrypt.hash(password, 10);

        const result =
            await db.query(
                `
                INSERT INTO users
                (
                    username,
                    email,
                    password
                )
                VALUES($1,$2,$3)
                RETURNING id, username
                `,
                [
                    username,
                    email,
                    hash
                ]
            );

        res.json({
            success: true,
            user: result.rows[0]
        });

    } catch (error) {

        console.error(error);

        res.status(400).json({
            error: "Impossible de créer le compte"
        });

    }

});

app.post("/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;

        const result =
            await db.query(
                `
                SELECT *
                FROM users
                WHERE email = $1
                `,
                [email]
            );

        const user =
            result.rows[0];

        if (!user) {

            return res.status(401).json({
                error: "Utilisateur introuvable"
            });

        }

        const valid =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!valid) {

            return res.status(401).json({
                error: "Mot de passe incorrect"
            });

        }

        const token =
            jwt.sign(
                {
                    id: user.id
                },
                SECRET
            );

        res.json({
            token,
            username: user.username
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Erreur serveur"
        });

    }

});

app.get("/profile/:username", async (req, res) => {

    try {

        const user =
            await db.query(
                `
                SELECT
                    username,
                    bio,
                    avatar,
                    created_at
                FROM users
                WHERE username = $1
                `,
                [
                    req.params.username
                ]
            );

        const posts =
            await db.query(
                `
                SELECT *
                FROM posts
                WHERE username = $1
                ORDER BY created_at DESC
                `,
                [
                    req.params.username
                ]
            );

        res.json({

            user :
            user.rows[0],

            posts :
            posts.rows

        });

    } catch(error){

        console.error(error);

        res.status(500).json({
            error:"Erreur serveur"
        });

    }

});

app.get("/admin/:username", async (req, res) => {

    try {

        const result = await db.query(
            `
            SELECT is_admin
            FROM users
            WHERE username = $1
            `,
            [req.params.username]
        );

        res.json(result.rows[0]);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Erreur serveur"
        });

    }

});

app.delete("/posts/:id", async (req, res) => {

    try {

        const username =
            req.headers.username;

        const admin =
            await db.query(
                `
                SELECT is_admin
                FROM users
                WHERE username = $1
                `,
                [username]
            );

        if(
            !admin.rows[0] ||
            !admin.rows[0].is_admin
        ){

            return res.status(403).json({
                error:"Accès refusé"
            });

        }

        await db.query(
            `
            DELETE FROM posts
            WHERE id = $1
            `,
            [req.params.id]
        );

        res.json({
            success:true
        });

    } catch(error){

        console.error(error);

        res.status(500).json({
            error:"Erreur serveur"
        });

    }

});

app.put("/profile", async (req, res) => {

    try {

        const {
            username,
            bio,
            avatar
        } = req.body;

        await db.query(
            `
            UPDATE users
            SET
                bio = $1,
                avatar = $2
            WHERE username = $3
            `,
            [
                bio,
                avatar,
                username
            ]
        );

        res.json({
            success:true
        });

    } catch(error){

        console.error(error);

        res.status(500).json({
            error:"Erreur serveur"
        });

    }

});

app.get("/special-users", async (req, res) => {

    try {

        const result = await db.query(
            `
            SELECT *
            FROM special_users
            `
        );

        res.json(result.rows);

    } catch(error){

        console.error(error);

        res.status(500).json({
            error:"Erreur serveur"
        });

    }

});

app.post("/system-message", async (req, res) => {

    try {

        const { content } = req.body;

        await db.query(
            `
            INSERT INTO system_messages
            (content)
            VALUES ($1)
            `,
            [content]
        );

        io.emit(
            "new-system-message",
            content
        );

        res.json({
            success: true
        });

    } catch(error){

        console.error(error);

        res.status(500).json({
            error: "Erreur serveur"
        });

    }

});

app.get("/system-message", async (req, res) => {

    const result = await db.query(
        `
        SELECT *
        FROM system_messages
        ORDER BY created_at DESC
        LIMIT 50
        `
    );

    res.json(result.rows);

});
server.listen(PORT, () => {

    console.log(
        `🌅 Horizon sur ${PORT}`
    );

});