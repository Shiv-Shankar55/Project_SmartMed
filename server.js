const express = require("express");
const pool = require("./db");

const app = express();

const PORT = 5000;

// Backend running
app.get("/", (req, res) => {
    res.send("SmartMed Backend is Running!");
});

// Test API
app.get("/api/test", (req, res) => {
    res.json({
        message: "SmartMed API is working!",
        status: "success"
    });
});

// Get all medicines
app.get("/api/medicines", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        if (page < 1 || limit < 1 || limit > 100) {
            return res.status(400).json({
                message: "Page must be >= 1 and limit must be between 1 and 100"
            });
        }

        const offset = (page - 1) * limit;

        // Get total number of medicines
        const countResult = await pool.query(
            `SELECT COUNT(*) FROM medicines`
        );

        const total = parseInt(countResult.rows[0].count);

        // Get medicines for current page
        const result = await pool.query(
            `
            SELECT
                id,
                med_name,
                final_price,
                price,
                prescription_required,
                drug_variant,
                drug_manufacturer,
                generic_name,
                img_urls
            FROM medicines
            ORDER BY id
            LIMIT $1 OFFSET $2
            `,
            [limit, offset]
        );

        res.json({
            page: page,
            limit: limit,
            total: total,
            medicines: result.rows
        });

    } catch (error) {
        console.error("Error fetching medicines:", error.message);

        res.status(500).json({
            message: "Failed to fetch medicines"
        });
    }
});

// Get medicine by ID and its full details
app.get("/api/medicines/:id", async (req, res) => {
    try {
        const medicineId = parseInt(req.params.id);

        const result = await pool.query(
            `SELECT *
             FROM medicines
             WHERE id = $1`,
            [medicineId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Medicine not found"
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error("Error fetching medicine:", error.message);

        res.status(500).json({
            message: "Failed to fetch medicine"
        });
    }
});

// Search medicines
app.get("/api/search", async (req, res) => {
    try {
        const name = req.query.name;

        if (!name) {
            return res.status(400).json({
                message: "Please provide a medicine name"
            });
        }

        const result = await pool.query(
            `
            SELECT
                id,
                med_name,
                final_price,
                price,
                prescription_required,
                drug_variant,
                drug_manufacturer,
                generic_name,
                img_urls
            FROM medicines
            WHERE med_name ILIKE $1
            ORDER BY id
            LIMIT 20
            `,
            [`%${name}%`]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "No medicines found"
            });
        }

        res.json({
            search: name,
            count: result.rows.length,
            medicines: result.rows
        });

    } catch (error) {
        console.error("Error searching medicines:", error.message);

        res.status(500).json({
            message: "Failed to search medicines"
        });
    }
});

//Get all disease
app.get("/api/diseases", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                id,
                disease_name,
                disease_url
            FROM diseases
            ORDER BY id
        `);

        res.json({
            count: result.rows.length,
            diseases: result.rows
        });

    } catch (error) {
        console.error("Error fetching diseases:", error.message);

        res.status(500).json({
            message: "Failed to fetch diseases"
        });
    }
});

//Get disease + medicines
app.get("/api/diseases/:id", async (req, res) => {
    try {
        const diseaseId = parseInt(req.params.id);

        const result = await pool.query(
            `
            SELECT
                d.id AS disease_id,
                d.disease_name,
                d.disease_url,

                m.id AS medicine_id,
                m.med_name,
                m.final_price,
                m.price,
                m.prescription_required,
                m.drug_variant,
                m.drug_manufacturer,
                m.generic_name,
                m.img_urls

            FROM diseases d

            JOIN disease_medicines dm
                ON d.id = dm.disease_id

            JOIN medicines m
                ON dm.medicine_id = m.id

            WHERE d.id = $1

            ORDER BY m.id
            `,
            [diseaseId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Disease not found or no medicines available"
            });
        }

        res.json({
            disease: {
                id: result.rows[0].disease_id,
                name: result.rows[0].disease_name,
                url: result.rows[0].disease_url
            },

            medicine_count: result.rows.length,

            medicines: result.rows.map(row => ({
                id: row.medicine_id,
                name: row.med_name,
                final_price: row.final_price,
                price: row.price,
                prescription_required: row.prescription_required,
                drug_variant: row.drug_variant,
                drug_manufacturer: row.drug_manufacturer,
                generic_name: row.generic_name,
                img_urls: row.img_urls
            }))
        });

    } catch (error) {
        console.error("Error fetching disease:", error.message);

        res.status(500).json({
            message: "Failed to fetch disease"
        });
    }
});

//Disease search
app.get("/api/disease-search", async (req, res) => {
    try {
        const name = req.query.name;

        if (!name) {
            return res.status(400).json({
                message: "Please provide a disease name"
            });
        }

        const result = await pool.query(
            `
            SELECT
                id,
                disease_name,
                disease_url
            FROM diseases
            WHERE disease_name ILIKE $1
            ORDER BY id
            LIMIT 20
            `,
            [`%${name}%`]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "No diseases found"
            });
        }

        res.json({
            search: name,
            count: result.rows.length,
            diseases: result.rows
        });

    } catch (error) {
        console.error("Error searching diseases:", error.message);

        res.status(500).json({
            message: "Failed to search diseases"
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`SmartMed server running on port ${PORT}`);
});