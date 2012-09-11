var http = require("http");

exports.index = function (req, res) {
  res.render("index", { title:"Silkapp Querier" })
};

exports.query = function (req, res) {
  var query = req.body.query;
  var host = "world.silkapp.com";
  silkAppQuery(host, query, function (response) {
    res.json(response);
  });
};

function silkAppQuery(host, query, callback) {
  var options = {
    host:host,
    port:80,
    path:"/s/api/v1.3.2/query/",
    method:"post",
    headers:{
      "Content-Type":"text/plain"
    }
  };
  var request = http.request(options, function (response) {
    var result = "";
    response.setEncoding("utf8");
    response.on("data", function (chunk) {
      result += chunk;
    });
    response.on("end", function () {
      callback(result);
    });
  });
  request.write(query);
  request.end();
}