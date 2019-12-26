var express = require('express');
var compression = require('compression');
// <<<<<<<<<<<<<<<<< var cors = require('cors');
var http = require('http');
var https = require('https');
var app = express();
var chokidar = require("chokidar");
var WebSocket = require("ws");
var socketServer;
var sockets = [];
// eslint-disable-next-line no-unused-vars
var watcher;
var watchPath;
var server;
var cert = getCert();
var options;
var config;
var ip;
var appPath;
var os = require('os');
var networkInterfaces = os.networkInterfaces();
//console.log(networkInterfaces);
//console.log(networkInterfaces.en0[1].address);
ip = networkInterfaces.en0[1].address;
appPath = process.cwd();
watchPath = appPath + "/app";
//console.log(appPath);
//console.log(watchPath);

// https://expressjs.com/en/4x/api.html
// https://expressjs.com/en/resources/middleware/compression.html
//-------------------------------
config = getConfig(); // cmd line: node index.js https 8080
console.log("\x1b[32mServer running (version 0.1)");
//-------------------------------

if (config.protocol=="http") {
  server = http.createServer(app);
} else {
  server = https.createServer({key: cert.key, cert: cert.cert, passphrase: "1234" }, app);
}

//---------------------------------------------------
socketServer = new WebSocket.Server({ server });

socketServer.on('connection', function connection(socket) {
  var socketIndex = sockets.length;
  console.log(socketIndex+" - connection");
  sockets.push(socket);
  socket.on('message', function incoming(message) {
    console.log(socketIndex+" - message: " + message);
  });

  socket.on("close", function() {
    console.log(socketIndex+" - close");
    sockets[socketIndex] = null;
  });

  socket.send('something');
});

function browserUpdate(filename) {
  var i;
  for (i=0; i<sockets.length; ++i) {
    if (sockets[i]) {
      sockets[i].send(filename);
    }
  }
}
//---------------------------------------------------

options = {
  dotfiles: 'ignore',
  etag: false,
  extensions: ['htm', 'html'],
  index: ["index.html"],
  maxAge: '1d',
  redirect: false,
  //setHeaders: function(res, path, stat) {
  setHeaders: function(res) {
    res.set('x-timestamp', Date.now());
  },
};

// <<<<<<<<<<<<<<<<<<<< app.use(cors());
app.use(compression());
app.use(express.static('app', options));

app.get('/api-test', (req, res) => { res.send('api-test route'); });
detectExit();
server.listen(config.port, function() {
  console.log(config.protocol+"://localhost:" + config.port);
  console.log(config.protocol+"://" + ip + ":" + config.port);
  console.log("Watching for changes...");
  watchFiles();
});

function getCert() {
  var data = {
    key: Buffer.from(`-----BEGIN ENCRYPTED PRIVATE KEY-----
MIIJnzBJBgkqhkiG9w0BBQ0wPDAbBgkqhkiG9w0BBQwwDgQIsKzJPYUb/rcCAggA
MB0GCWCGSAFlAwQBKgQQv3bpTPRv970pwbiX1Py4/QSCCVDLYqR0ua3THOR2ZLx3
53jrvnOExuM4EKVliAMHjGgFSZ2ND67tvxmj9DN3pDofQkOccgKdzH7c5QlG1/22
crFnyLl4wIAYxqVKM+I6o43zHXvFC1fVlnL/mlXNZe2dNFEJWtwhxiqJ7fHvIkLf
AQk4auUZE9MQrodGWYWO3PVENTfcrWSDU7UOhNJOt4wYX7O4d9fxwzSCP2tXJ1Na
Xp/CdAWw5eDhCaaZadECmynrJXl+3yV/Op1ZLMLP0HDQ+3dwGUJqvBQ7Ueo7Kr0A
kjQgC63JQyUAZGd0DZvFMI3/uJioAdHpB161NVsnWYKllpr/rY+vAttPQWVpslqC
zZSLZctbAU7h11L8ap2lttHl5unycviRWcv1M6T5CivEViK6UBwYBoKGqq0D2S6n
+aAMQ1ZG//yVlzEttxhE8HDzRzMbx8KnFczaXocXMQtJEnt7hli+4Pmre70VmUCP
JTDwVBw0eHqfHDn6rw7p5j8bQ9aJv5o2oUJ11KEF99Qxskl78GD+lp8Eu+FAKEfw
XbR+aun7tQG4JAtlJs/OiierjMThAnfSPosNoGosqVH1tIFGH4uT761NLDqpw+l+
QArLWVEjcX2ndbv77jy80YSgez+IJvva7o95ZZt0EhM6cERbKGDmXSimTOExnWlM
ISWBdM2xk4hSNszNqsyxjiJO+5LSCm+GaAd54VMzjNGynFsfSlz9u3XUiSvgOr5p
gMPEXChQoF4TH5annN3wE98oj7VXqg5n4p6akRlMIYDnejSnCUkfw52cw4xC1owV
SyuZfFE2IoucR8sLy8I5bm0sShUdu9ffttAi20qTtLEa4/TNLOrxRdrPgp8UfsSu
bzlEzQF7Z1CjMGBtcV6ElxTnDthOtfyzMezY6FDA4dvdTih4L0vqauFF1FvpqrAY
BZKGj3/onfUqWFDTJKeTlTmQZxr+tn99FGPFYyg27ZMNmtCSZOkMqeVaSEGNN9TY
nj1P4lIsNLoxIe2qoE5pceV1Y3rBqLjzmywnJAnSGj6y4HzKfh0DOHmFBckQ4hoS
f4IJ4AzUJr5VJQlRRbOq5Yt9L/TvN2hIPKsJ/KYYC7XOIF37ongRxb4zGWuXuY/5
0zP9qXl23E/3yowMsUFuG8A0OGYey+IiN0DNBwZEI8Q5qMLVVyiJRgU9iMumlEEf
h+GgCRJb7OrbmH/85wYiYUj0vQIdai17fhUO88c5kVxlmW2TKwz3HIEbWjCKpRa+
a2NrTnuzwV8AGgrlV2aPFV4hq6akmVUEHu5YTsxaC6ul/Pwv5AXtXGVwjndDvcNw
HpH9jcE5z3q+kB8Z+vSkm1ggB6gS0IpG5BTAFMDu10qc/1szGpzpyo2DTrUQxIaT
/Ei2YTKdst/FKeFl0l+qmQbnHlJGK9fPuP+FdcSHdq77IuzyLGvS6fvY4AW1noXc
EDsXW4Ru77VbUdZCA4hvyZliGV5JyubDoYhDOzVH9aEqaegtqh/w8IBDbF4ltV7s
b4UlDmmJiZib5407a1W5rQ8UXPsGwog9b7vTN8IScbWqL3K2arTfincPYCbkeDQ+
Po/AnQ3zErW4JD8/m/6Zh6Pm22l+qZEllms9xVyivoDQB2R171b3DHgohJUP8DQ8
LB2jlZ+SdyrQ/Rxmnn2ZQFg+9m2SAhcFXs3DCRlrtrzE4gRlnzD3U30f0rBTgHhk
7xSzLS/cj6SxkfkTFaO1344jh1uL9QOo4Na4X8LqtzuMCc89/RJ8pkIqkvthLkrG
yL9RbRJ8PtsqCByoBHg5DnjPeLR9JkJXx612PxJdfs2e2lG4FLrmtC9GSQE6wK++
2zgm8n2mmJcKUkkzJSUGFmg3yb/iZySWmk9AOyxJvgBoKpuzkvNXSbA5vzPTdGdR
gSDUPBbKskmGDDNz/V0JldueteX4FYdra6h6Lc2g+96ARhQqd8MtCw9KBWSt6L6x
cFyaQ+eQt7TIr2zlxQ/2Rht+GrlMmgijlTvgKo43Li/fRek6zoI8mchby1VfilFn
srm7XqwZ0qp3686mq6A+r9WshOswmUiJzdlEAMnSJrrGS8fnE/3nL0AkoxRGyXTO
rZ492qna58rkki/0OF5pM0HdRjPvefs5MtMUQh9BnHi/ohP7H7pSPuCnwAlECjJI
3GPVGXnf+TJ17xy+T9bDueHJNR5+h6MTZ7S7hNEgdhinl4QtMv2GQEpCszV4vgr/
dddphLvx/q4HYQJg5xzsK1S4/CSNW5x2gjARURe+0DPlNOT77JMVEU5PW481yy3h
kwDfTxXeRLt2t4hT7dYsBQk5/23x+yGjz6sIms0cGNuibVBidhgsEQimHdl0Fp/O
fDwAzP/eIXnERMBihOy308+GaAu5ldmeaOPbA2bqya3TP45dfoDNcQJrl29hnahR
Cq0cX0mO7Hn71X5kni6onONBMsq25FMKVVE3XlwV2gnD2CRKnpHi7jUjmlzlpjOh
j1xVu6WPX0aIn557Lvjlyjg31WUHOUvl6pfz1joARENScZ0kiQfEUfZdfUrOboOC
4V19IsRdi2CCmvBhmJ/7ARszCpuXUQoWW/I0uN+qMbXZXEUBCQPBDUgPwIadyhS1
Gf7rqTlKRM6vlyS9o3Mp+nSQDWG0iJGQTYfEfsGLQhMu4v1fHpdq1xZYS31lDude
we3iuwjK5Zu38hRI9LsVYLORM7Ixkgube+32TpuWmLbfeqLD5lghpK/b0pY2ZGUM
9egTxk2T2t9d9EXfJinTiWr6u8yoPin2PZ9k/yvgJ3eeSePEs2g8Xf0UXTg0EXMQ
miKT7cmNWLFB9UyAPnTagvuEmrr2bjmWJbOuV0zXps0gV9rGXHPAF1EbkrytHQ/T
ygresBH1dkzUWf+FapZM7ySjv8ivefTSihuTAAIzY2Y+xoi3tKg/zZzpmChIWuNo
2oVF0jbuajd+xpYuBpGCNX9CeA5WAm1+WI7m8LRORsQ+wkgep1X7+KqNqIlYlcJe
D1E8YVyOjJfzLyQebUaswSGfQFRWDAYW4DAHILxIA9SqUcJtEo0/Qzlqu+tGhO/T
cIeIkn5sDC8r0iv2iaEAa0A49kVWJoHGjNqFCdjXjtYd9i73NsDdg9BHpsVKZbNy
gxcsp4iQpov8L9qV9wlU0f/qmrDzekJc18Sgg6O9Si31ni+BjNmzHe2/SNAb4vV2
B2nGve6xfzSoeCbSqBHKitrquQ==
-----END ENCRYPTED PRIVATE KEY-----
`),
    cert: Buffer.from(`-----BEGIN CERTIFICATE-----
MIIEzjCCArYCCQDlP2QDr36giDANBgkqhkiG9w0BAQsFADApMScwJQYDVQQDDB5l
bnRlcnByaXNlb3JkZXJpbmcudmVyaXpvbi5jb20wHhcNMTkxMjA2MjA1OTA5WhcN
MjkxMjAzMjA1OTA5WjApMScwJQYDVQQDDB5lbnRlcnByaXNlb3JkZXJpbmcudmVy
aXpvbi5jb20wggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAwggIKAoICAQC2RI5lbiN5
dkLoXW3fCcTkDrqj4JGY0BPigmsPRh3v8mg8wwykstesZzFxYvRJvzHTTYxS6k7o
OTltDyYLqfufaYF5laCwPkC2i5VPkWAYmqmSyIwi2uRAGb1CPz5aFJPL4+My5eFX
1u6FyD0Wbwmh4CJSpkaBCYFzRJqqAS+6EozJU2BlQMGSbkynIzlxwHiGB/TgzoaH
8WCLeVn3/DrQ08uedfwUHj3ickleY/EibUUeB4gdNbrw17tv/auVbBySULKcXk9s
hyhnvB9dc8H2P1u0NpwhVLSFIiQJR1oS5F+dHQUOS68NSGf94JmE2I3vN9LBUfhh
VV2TokneDFEqX4MuKvj8NI75ou6pYtcu3Oi7maja6g/KKdQAaATONK85ZEEhuZZj
K/+ykRgZCEo8cl8oaSBy4Lk84jAUZVG4VyHCJ2M5SHdNP8B7OK/oRWgxO/XQ9qWs
Wy7qLD945kreUyfNHfPl+IuZ1gVqtwbopMvut3mtuJTp5NM+r6QrFJ3PcfctyTjB
YJdMZw007GKe6nIh1D4nATYhjLhXJ06AQ3BsOL4iYEyo6p2For9VTBqSdusWzOS1
MjUugBY2Jm9CBjduoAASDE62H+gZ4hs+LBl4762jYJFthPNRucaMYv0X5/SbOBkO
IW99lP0k4lnNlr7HpaeidH5mfoCk6MgZIwIDAQABMA0GCSqGSIb3DQEBCwUAA4IC
AQBYDy8tPNIaMkPvJy7igzVdPbRt518DJnP3goi6UhZY+n0XJVeVr6peOIxWOg8q
wGMoIbQQDnoC39EsojUfbqaLgl654iT9hh1zXNLjgE8XzLIeiwe+ShM/Mp2NMxx9
QOFFkRAaKE4mhKzccZzWda1OO1GE4hDig1bg5BtlNXo2AGTZS3WGb8AY63VTbILf
/GfRx/eXvjlDTp5nKvDRkcxEKwcPAAdK8unZNfbRUzTakWM28iykJ1iXDWzGAG5z
BGI3We2luiLXcS/35JcnBSeQncwPxPVcF4e8hezWGOz4q59EYgHRclqBhUpZ3C3T
jhXJ+lC5U4rh7iSHpmBYI/LzQ4WhBBneKH2mdpv6xXYPjxFFk9ESFTyueAM2f2W7
OV0IO5TK6lKs/jqQ+PEQ/6rRVG0CvNPO2ZmM+o48/qj66HUaZwPX8ggMHS4rilaL
mfrydEnsxFq73G51xwFRWWADxHpCNZaDRAXa7JT2X6cZxk5asQR+EcD7guc5/4Zi
DmqKkzEqTUEtBE+srWNVdTDraxBSR8rQXEY+e74aaKJ2blic4J4c+MiqjhfEIS70
B5mZJSYCf1b3Am+WBvy3HnPdK5JPYwlPMenAtQc0+OozsKfLI4c+jsZLNphAydLo
DJJfRWIE/V4kMR31W7J4nOCvdjZ+Qo6WTo86c8ta2a2qUg==
-----END CERTIFICATE-----
`),
  };

  return (data);
}

// node index.js https 8080
//  [0]    [1]    [2]   [3]
//var config = {protocol: "https", port: 8080};
function getConfig() {
  var conf = {protocol: "https", port: 8080}; // defaults
  if (process.argv[2]=="http") conf.protocol = "http";
  if (process.argv[3]) conf.port = parseInt(process.argv[3]);
  // Green, DodgerBlue, Red, Orange
  //console.log("\x1b[32mprotocol="+config.protocol+" port="+config.port);
  return conf;
}

function watchFiles() {
  watcher = chokidar.watch(watchPath, {ignoreInitial: true});
  watcher.on("all", function(event, path) {
    var filename;
    // console.log("watch event: "+event+" path: "+path);
    // chop off root path
    filename = path.substr(watchPath.length+1);
    if (filename.substr(0, 1)==".") return;
    if (event=="addDir") return;
    if (event=="unlinkDir") return;
    if (event=="") return;
    console.log(filename);
    browserUpdate(filename);
  });
}

function detectExit() {
  /*...
  // console.log('detectExit');
  // SIGINT is ctrl C
  process.on('SIGINT', function() {
    console.log(" exit");
    watcher.close();
    console.log('Watcher closed');
    server.close(() => {
      console.log('Server closed');
      console.log("\x1b[0m"); // reset color
    });
  });
  ...*/
}
