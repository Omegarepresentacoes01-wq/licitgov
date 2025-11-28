import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/gemini", async (req, res) => {
  try {
    const { prompt } = req.body;

    // Modelo corrigido: gemini-3-pro-preview
    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent?key=" +
      process.env.GEMINI_API_KEY;

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    const data = await resp.json();

    // Caso o modelo retorne erro
    if (data.error) {
      return res.status(400).json({ error: data.error });
    }

    return res.json(data);
  } catch (err) {
    console.error("Erro no backend Gemini:", err);
    res.status(500).json({ error: "Erro no backend Gemini" });
  }
});

app.listen(3001, () =>
  console.log("🟢 Backend Gemini rodando em http://localhost:3001")
);
