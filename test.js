const http = require("http");

const server = http.createServer((req, res) => {
    res.end("Hello");
});

server.on("error", (err) => {
    console.error(err);
});

server.listen(8080, "127.0.0.1", () => {
    console.log("Listening");
});