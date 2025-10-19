require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) => console.error(err));

app.get("/", (req, res) => {
  res.status(200).send("Server is alive and running!");
});

app.use("/api", require("./routes/videoRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
