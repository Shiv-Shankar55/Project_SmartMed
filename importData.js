const fs = require("fs");
const csv = require("csv-parser");
const pool = require("./db");

const filePath = "D:/Med_Project/backend/medicines.csv";

const medicines = [];
function cleanPrice(value) {
    if (!value) return null;

    const cleaned = value
        .replace(/Rs\./gi, "")
        .replace(/,/g, "")
        .trim();

    const number = parseFloat(cleaned);

    return isNaN(number) ? null : number;
}

fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (row) => {
        medicines.push(row);
    })
    .on("end", async () => {
    // console.log(`CSV reading completed.`);
    // console.log(`Total rows: ${medicines.length}`);

    // try {
    //     const uniqueDiseases = [
    //     ...new Map(
    //         medicines.map(row => [
    //             row.disease_name,
    //             row.disease_url
    //         ])
    //     )
    // ];

    // console.log(`Unique diseases: ${uniqueDiseases.length}`);

    // for (const [diseaseName, diseaseUrl] of uniqueDiseases) {
    //     await pool.query(
    //         `INSERT INTO diseases (disease_name, disease_url)
    //         VALUES ($1, $2)`,
    //         [diseaseName, diseaseUrl]
    //     );
    // }

    // console.log("Diseases inserted successfully!");

    // } catch (error) {
    //     console.error("Import error:", error.message);
    // }



//     console.log("Starting medicine insertion...");

// for (const row of medicines) {
//     await pool.query(
//         `INSERT INTO medicines (
//             med_name,
//             med_url,
//             final_price,
//             price,
//             prescription_required,
//             drug_variant,
//             drug_manufacturer,
//             drug_manufacturer_origin,
//             drug_content,
//             generic_name,
//             img_urls
//         )
//         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
//         [
//             row.med_name,
//             row.med_url,
//             cleanPrice(row.final_price),
//             cleanPrice(row.price),
//             row.prescription_required || null,
//             row.drug_varient || null,
//             row.drug_manufacturer || null,
//             row.drug_manufacturer_origin || null,
//             row.drug_content || null,
//             row.generic_name || null,
//             row.img_urls || null
//         ]
//     );
// }

// console.log("Medicines inserted successfully!");



console.log("Starting disease-medicine mapping...");

for (const row of medicines) {
    await pool.query(
        `INSERT INTO disease_medicines (disease_id, medicine_id)
         SELECT d.id, m.id
         FROM diseases d
         JOIN medicines m
           ON m.med_name = $1
         WHERE d.disease_name = $2
         ON CONFLICT (disease_id, medicine_id) DO NOTHING`,
        [row.med_name, row.disease_name]
    );
}

console.log("Disease-medicine mapping completed!");
})
    .on("error", (error) => {
        console.error("Error reading CSV:", error.message);
    });