var http = require("http");
var xmlMapping = require("xml-mapping");

exports.index = function (req, res) {
  res.render("index", { title:"Silkapp Querier" })
};

exports.sites = function (req, res) {
  silkAppApi.sites(function (response) {
    res.json(xmlMapping.load(response));
  });
};

exports.tags = function (req, res) {
  silkAppApi.tags(req.param("site"), function (response) {
    res.json(xmlMapping.load(response));
  });
};

exports.query = function (req, res) {
  var query = req.param("query");
  var host = req.param("host");
  silkAppApi.query(host, query, function (response) {
    res.json(xmlMapping.load(response));
  });
};

var silkAppApi = {
  config:{
    headers:{
      "Content-Type":"text/plain"
    }
  },
  sites:function (callback) {
    var options = {
      host:"api.silkapp.com",
      port:80,
      path:"/v1.3.2/site/?count=1000",
      method:"get",
      headers:this.config.headers
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
      response.on("error", function (error) {
        console.log("error", error);
      });
    });
    request.end();
  },
  tags:function (host, callback) {
    var path = "/s/api/v1.3.2/site/uri/" + host + "/taglist/";
    console.log(host);
    console.log(path);
    var options = {
      host:host,
      port:80,
      path:path,
      method:"get",
      headers:this.config.headers
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
      response.on("error", function (error) {
        console.log("error", error);
      });
    });
    request.end();
  },
  query:function (host, query, callback) {
    var options = {
      host:host,
      port:80,
      path:"/s/api/v1.3.2/query/",
      method:"post",
      headers:this.config.headers
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
      response.on("error", function (error) {
        console.log("error", error);
      });
    });
    request.write(query);
    request.end();
  }
};