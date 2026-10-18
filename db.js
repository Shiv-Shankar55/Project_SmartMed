const { Pool } = require("pg");

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "smartmed",
    password: "2580",
    port: 5432
});

module.exports = pool;

// pool.connect()
//     .then(() => {
//         console.log("PostgreSQL connected successfully!");
//     })
//     .catch((error) => {
//         console.error("PostgreSQL connection failed:", error.message);
//     });