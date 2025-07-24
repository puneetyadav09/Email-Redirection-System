const express = require('express');
const cors = require('cors');
const { processEmails } = require('./emailProcessor');

const app = express();
app.use(cors());
app.use(express.json());

app.post("/process-emails", async (req, res) => {
  try {
    console.log("🔥 Incoming request to /process-emails");

    const { email, password, fallbackEmail, departmentList } = req.body;

    console.log("📥 Payload:", { email, fallbackEmail, departmentList });

    if (!email || !password || !fallbackEmail || !departmentList) {
      console.log("❌ Missing required fields");
      return res.status(400).json({ error: "Missing required fields" });
    }

    await processEmails(email, password, fallbackEmail, departmentList);

    console.log("✅ Emails processed successfully");
    res.status(200).json({ message: "Processed successfully" });
  } catch (error) {
    console.error("❌ ERROR in /process-emails:", error.stack || error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
