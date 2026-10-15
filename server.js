const express = require("express");

const app = express();

const PORT = 5000;

// Home route
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

// Temporary medicine data
const medicines = [
    {
        id: 1,
        name: "Paracetamol",
        generic_name: "Paracetamol",
        price: 25
    },
    {
        id: 2,
        name: "Amoxicillin",
        generic_name: "Amoxicillin",
        price: 80
    }
];

// Get all medicines
app.get("/api/medicines", (req, res) => {
    res.json(medicines);
});

// Get medicine by ID
app.get("/api/medicines/:id", (req, res) => {
    const medicineId = parseInt(req.params.id);

    const medicine = medicines.find(m => m.id === medicineId);

    if (!medicine) {
        return res.status(404).json({
            message: "Medicine not found"
        });
    }

    res.json(medicine);
});

// Search medicines
app.get("/api/search", (req, res) => {
    const name = req.query.name;

    const results = medicines.filter(medicine =>
        medicine.name.toLowerCase().includes(name.toLowerCase())
    );

    if (results.length === 0) {
        return res.status(404).json({
            message: "No medicines found"
        });
    }

    res.json(results);
});

// Start server
app.listen(PORT, () => {
    console.log(`SmartMed server running on port ${PORT}`);
});