const httpProxy = require("http-proxy");
const http = require("http");

let ENV;
switch (process.env.PROXY_ENV) {
  case "qa":
    ENV = require("dotenv").config({ path: "./.env-qa" }).parsed;
    break;
  case "dev":
    ENV = require("dotenv").config({ path: "./.env-dev" }).parsed;
    break;
  default:
    ENV = require("dotenv").config({ path: "./.env" }).parsed;
}

const proxy = new httpProxy.createProxyServer({
  target: {
    protocol: ENV.PROTOCOL,
    host: ENV.HOST,
    port: ENV.PORT,
  },
  changeOrigin: true
});

const proxySocket = new httpProxy.createProxyServer({
  target: {
    protocol: ENV.WS_PROTOCOL,
    host: ENV.WS_HOST,
    port: ENV.WS_PORT
  },
  ws: true,
  changeOrigin: true
});
const proxyServer = http.createServer(function (req, res) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS, POST, GET",
    "Access-Control-Max-Age": 2592000,
    "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept, X-User-Id, X-Auth-Token, X-Auth-Header"
  };

  if (req.method === "OPTIONS") {
    res.writeHead(204, headers);
    res.end("ok");
    return;
  }
  proxy.web(req, res);

});

proxyServer.listen(3030);

const proxySocketServer = http.createServer().listen(3031);

proxySocketServer.on("upgrade", function (req, socket, head) {
  proxySocket.ws(req, socket, head);
});
