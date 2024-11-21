const express = require("express");

const app = express();
const port = 80;

const expressServer = app.listen(port, () => {
    console.log("Listening on port ${port}");
});

app.get("/", function(req, res) {
    res.send("Lets go!");
});
