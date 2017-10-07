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
        var md5=require('md5');
        console.log(md5(requestBody.email));
        console.log('we have all the data ', requestBody);
        messages.push(JSON.stringify( {
                count: messages.length,
                message:requestBody.message,
                user:requestBody.name,
                time:requestBody.timestamp,
                id : messages.length,
                email:md5(requestBody.email)
               
        }));
        while(clients.length > 0) {
            var client = clients.pop();
            client.end(JSON.stringify( {
                count: messages.length,
                append:
                 [JSON.stringify({
                message:requestBody.message,
                user:requestBody.name,
                time:requestBody.timestamp,
                id:messages.length,
                email:md5(requestBody.email)
                 })]
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
    else{
       // res.writeHead(400);
       //res.end();
    }

}
}).listen(9000, 'localhost');
console.log('Server running.');