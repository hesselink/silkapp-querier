var express = require("express")
  , routes = require("./routes");

var app = module.exports = express();

app.configure(function () {
  app.set("views", __dirname + "/views");
  app.set("view engine", "jade");
  app.set("view options", {layout:false});
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + "/public"));
});

app.configure("development", function () {
  app.use(express.errorHandler({ dumpExceptions:true, showStack:true }));
});

app.configure("production", function () {
  app.use(express.errorHandler());
});

app.get("/", routes.index);
app.get("/sites", routes.sites);
app.get("/tags", routes.tags);
app.post("/query", routes.query);

var port = process.env.PORT || 5000;
app.listen(port, function () {
  console.log("express-bootstrap app running");
});
