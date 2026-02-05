import "dotenv/config";
import express from "express";

import checkAPIKey from "./middlewares/checkAPIKey.js";
import intelHiveRoutes from "./routes/intelHiveRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(checkAPIKey);

app.get("/", (req, res) => {
  res.send("Welcome to IntelHive API!");
});

app.use("/message", intelHiveRoutes);

app.listen(PORT, async () => {
  console.log(`IntelHive listening on http://localhost:${PORT}`);
});
