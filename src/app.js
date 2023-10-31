const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);


//load dotenv module
require("dotenv").config()
const port = process.env.PORT


require("./loaders/database")()
require("./loaders/server")(express, app)
require("./loaders/swagger")(app)


server.listen(port, () => {
    console.log("server running on port", port);
})