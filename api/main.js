const express = require('express');
const app = express();

app.use(express.json());

app.get('/percentage', (req, res) => {
    res.json({ value: 50 }); // Example static value, modify as needed
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));