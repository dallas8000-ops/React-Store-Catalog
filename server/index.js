// Express server entry point
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Example API route
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend running', time: new Date() });
});

// Add more API routes here

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
