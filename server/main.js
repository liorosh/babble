var http = require('http'),
url = require('url'),
fs = require('fs'),
clients = [],
messages = [];

http.createServer(function (req, res) {
    res.writeHead(200, {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin' : '*',
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE'
    });
// parse URL
var url_parts = url.parse(req.url);
//console.log(url_parts);
if  (req.method === 'POST') {

    if(req.url == '/messages'){
    var requestBody = '';
        req.on('data', function(chunk) {
            requestBody = JSON.parse(chunk);
        });
    req.on('end',function(){
        console.log('we have all the data ', requestBody);
        messages.push(requestBody.message);
        while(clients.length > 0) {
            var client = clients.pop();
            client.end(JSON.stringify( {
                count: messages.length,
                append: requestBody.message
        }));
        }
    })
}
}
/*if(url_parts.pathname == '/') {
    // file serving
    fs.readFile('../client/index.html', function(err, data) {
    res.end(data);
});

} */
else if (req.method === 'GET'){
console.log('GET');
    if(url_parts.pathname.substr(0, 9) == '/messages')
    {
// polling code here
        var count = url_parts.query.replace(/[^0-9]*/, '');
        console.log(count);
        if(messages.length > count) {
            res.end(JSON.stringify( {
                count: messages.length,
                append: messages.slice(count)
            }));
        } else {//get in line
            clients.push(res);
        }
    } 
    /*else if(url_parts.pathname.substr(0, 5) == '/msg/') {
    // message receiving
    console.log('Server 1.');
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
}*/
}
}).listen(9000, 'localhost');
console.log('Server running.');