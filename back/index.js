const express = require("express");
const {getStockQuote} = require("./helperFunction") 
const yahooFinance = require('yahoo-finance');
const http = require("http");
const  bodyParser = require("body-parser");
const socketIo = require("socket.io");
const axios = require("axios");
const port = process.env.PORT || 4001;
const app = express();


app.use(bodyParser.urlencoded({ extended:true }));
app.use(bodyParser.json());
//app uses ROUTES 
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
  });

app.post("/search", async function(req, res) {
  let stockName = req.body.stockName
  let responseFromStockAPI = await getStockQuote(stockName);
  res.send(responseFromStockAPI)
})

//routes END
const server = http.createServer(app);
const io = socketIo(server, {cors: {origin: '*'}});
io.on("connection", socket => {
  console.log("New client connected"), setInterval(
    () => getApiAndEmit(socket),
    10000
  );
  socket.on("disconnect", () => console.log("Client disconnected"));
});
const getApiAndEmit = async socket => {
  let res;
  try {
    let stocksFromClient = JSON.parse(socket.handshake.query['stocks'])
    if(stocksFromClient) {
      res = await yahooFinance.quote({
        symbols: Object.keys(stocksFromClient),
        modules: [ 'price'] // see the docs for the full list
      }, function (err, quotes) {
          if(err) {
              return err
          }
          return quotes
        // ...
      });
    } else {
    res = "Stock From Client are Empty"
    }
  } catch (error) {
    console.error(`Error: ${error.code}`);
    res = error.code
  }
    socket.emit("FromAPI", res);

};
server.listen(port, () => console.log(`Listening on port ${port}`));