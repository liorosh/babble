var http = require('http'),
url = require('url'),
fs = require('fs'),
messages = require('./messages-util.js'),
clients = [],
Messages = []
users = [],
userReq = [];
var msgId=0;
http.createServer(function (req, res) {

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Access-Control-Allow-Headers','Content-Type, From');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader("Access-Control-Allow-Methods", 'GET,OPTIONS,POST,DELETE');
// parse URL
var url_parts = url.parse(req.url);

if  (req.method === 'POST') {
    if(url_parts.pathname === '/messages' )
    {
        var requestBody = '';
        req.on('data', function(chunk)
        {
            requestBody = JSON.parse(chunk);
        });
        req.on('end',function()
        {
            var md5=require('md5');
            var msg= {
                    count: Messages.length,
                    message:requestBody.message,
                    user:requestBody.name,
                    time:requestBody.timestamp,
                    id : msgId,
                    email:requestBody.email,
                    gravatar:md5(requestBody.email) 
            };
            var msgCounter = messages.addMessage(msg);
            msgId = msgCounter;
            while(clients.length > 0)
            {
                var client = clients.pop();
                client.writeHead(200, { "Content-Type": "text/json" });
                client.end(JSON.stringify(
                {
                    count: Messages.length,
                    append:[msg]
                }));
            }
        res.writeHead(200, { "Content-Type": "text/json" });
        res.end(JSON.stringify({id:msgId}));
        });
    }
    else if(req.url=='/login')
    {
        var requestBody = '';
        req.on('data', function(chunk)
        {
            requestBody = JSON.parse(chunk);
        });
        req.on('end',function()
        {
            if(requestBody.status=='in')
            {
                users.push(
                {
                    name: requestBody.name,
                    email: requestBody.email,
                    status: requestBody.status
                });
            }
            else
            {
                var usrToRemove = users.findIndex(function(usrs)
                {
                    return usrs.name == requestBody.name && usrs.email == requestBody.email;
                });
                users.splice(usrToRemove,1);
            }
                while (userReq.length > 0)
                {
                    var clientRequest = userReq.pop();
                    clientRequest.writeHead(200, { "Content-Type": "text/json" });
                    clientRequest.end(JSON.stringify({users:users.length,messages:Messages.length}));
                }
                res.writeHead(200, { "Content-Type": "text/json" });
                res.end(JSON.stringify({users:users.length,messages:Messages.length}));
        })
    }
    else if (url_parts.path.includes('messages?counter=') || url_parts.path.includes('/stats') 
            || url_parts.path.includes('/messages/'))
    {
        res.writeHead(405);
        res.end();
    }
    else
    {
        res.writeHead(404);
        res.end();
    }
}
else if (req.method === 'GET')
{
    if(!url_parts.path)
    {
        res.writeHead(404);
        res.end();
    }
    if(url_parts.pathname.substr(0, 9) === '/messages' && url_parts.query.substr(0,8) === 'counter=' && isNaN(url_parts.query.substr(8))===false)
    {
        var count = url_parts.query.replace(/[^0-9]*/, '');
        var msgsToSend = messages.getMessages(count);
        if(Messages.length > count) 
        {
            res.writeHead(200, { "Content-Type": "text/json" });
            res.end(JSON.stringify( 
            {
                count: Messages.length,
                append: msgsToSend
            }));
        } else 
        {//get in line
            clients.push(res);
        }
    }
    else if(url_parts.pathname.substr(0,9) === '/messages' && url_parts.query.substr(0,8) !== 'counter=')
    {
        res.writeHead(400);
        res.end();
    }
    else if(url_parts.pathname.substr(0,9) === '/messages' && url_parts.query.substr(0,8) === 'counter=' && isNaN(url_parts.query.substr(8)==true))
    {
        res.writeHead(400);
        res.end();
    }
    else if(url_parts.path.includes('/messages/')){
        res.writeHead(405);
        res.end();
    }
    else if(req.url=='/stats')
    {
       userReq.push(res);
    }
}
else if (req.method === 'DELETE' )
{
    if(url_parts.pathname.substr(0,10) === '/messages/')
    {
        var msgid = JSON.parse(url_parts.pathname.substr(10));
        messages.deleteMessage(msgid);
        while(clients.length > 0)
        {
            var client = clients.pop();
            client.writeHead(200, { "Content-Type": "text/json" });
            client.end(JSON.stringify(msgid));
        }
        res.writeHead(200, { "Content-Type": "text/json" });
        res.end(JSON.stringify(msgid));
    }
    else if(url_parts.path === '/messages' || url_parts.path.includes('/messages?counter=0') || url_parts.path === '/stats'
        || url_parts.path === '/login' )
    {
        res.writeHead(405);
        res.end();
    }
    else if(isNaN(msgid)==true)
    {
        res.writeHead(400);
        res.end();
    }
    else {
        res.writeHead(404);
        res.end();
    }

}
else if(req.method === 'OPTIONS')
{
    res.writeHead(204);
    res.end();
}
else 
{
    res.writeHead(405);
    res.end();
}
}).listen(9000, 'localhost');
module.exports.Messages = Messages;
module.exports.msgId = msgId;
console.log('Server running.');

