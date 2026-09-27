import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "horizon",
    password: "TON_MOT_DE_PASSE",
    port: 5432
});

export default pool;