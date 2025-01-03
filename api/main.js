const express = require('express');
const app = express();

app.use(express.json());

app.get('/percentage', (req, res) => {
    res.json({ value: 70 });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));