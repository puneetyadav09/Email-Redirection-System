const express = require('express');
const cors = require('cors');
const { processEmails } = require('./emailProcessor');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/process-emails', async (req, res) => {
  const { email, password, fallbackEmail, departmentList } = req.body;

  if (!email || !password || !fallbackEmail || !departmentList) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const result = await processEmails({ email, password, fallbackEmail, departmentList });    
    res.json(result);
  } catch (error) {
    console.error("Error processing emails:", error); // Log the error on the server
    res.status(500).json({ error: 'Failed to process emails: ' + error.message }); // Include error message in response
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
