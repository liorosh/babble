var http = require('http'),
url = require('url'),
fs = require('fs'),
clients = [],
messages = ['testing'];

http.createServer(function (req, res) {
// parse URL
var url_parts = url.parse(req.url);
console.log(url_parts);
if  (req.method === 'POST') {
    var requestBody = '';
        req.on('data', function(chunk) {
            requestBody += chunk.toString();
        });
        req.on('end',function(){
    console.log('we have all the data ', requestBody);
    messages.push(requestBody);
    while(clients.length > 0) {
        var client = clients.pop();
        client.end(JSON.stringify( {
        count: messages.length,
        append: requestBody+"\n"}));
    }
})
}
if(url_parts.pathname == '/') {
// file serving
fs.readFile('../client/index.html', function(err, data) {
res.end(data);
});
} else if(url_parts.pathname.substr(0, 5) == '/poll') {
// pol ling code here
var count = url_parts.pathname.replace(/[^0-9]*/, '');
console.log(count);
if(messages.length > count) {
res.end(JSON.stringify( {
count: messages.length,
append: messages.slice(count).join("\n")+"\n"
}));
} else {
clients.push(res);
}
} else if(url_parts.pathname.substr(0, 5) == '/msg/') {
// message receiving
var msg = unescape(url_parts.pathname.substr(5));
messages.push(msg);
while(clients.length > 0) {
var client = clients.pop();
client.end(JSON.stringify( {
count: messages.length,
append: msg+"\n"
}));
}
res.end();
}

}).listen(8080, 'localhost');
console.log('Server running.');