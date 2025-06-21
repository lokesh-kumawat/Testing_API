import 'dotenv/config'

import express from "express";
const app = express();

app.get("/", (req, res) => {
    res.send("server is running");
});

let port = process.env.PORT
app.listen(port, () => {
    console.log(`server is running on localhost ${port}`);
});