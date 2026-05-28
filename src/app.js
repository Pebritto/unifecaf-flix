const express = require("express");
const cors = require("cors");
const filmeRoutes = require("./routes/filmeRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/v1/controle-filmes", filmeRoutes);

module.exports = app;
