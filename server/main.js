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
        {   //assemble message and push to msg array
            var md5=require('md5');
            var msg= {
                    message:requestBody.message,
                    user:requestBody.name,
                    time:requestBody.timestamp,
                    id : msgId,
                    email:requestBody.email,
                    gravatar:md5(requestBody.email) 
            };
            //send to message utiles for array insertion.
            var msgCounter = messages.addMessage(msg);
            msgId = msgCounter;
            //send message to all clients waiting for updates.
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
            //return success
        res.writeHead(200, { "Content-Type": "text/json" });
        res.end(JSON.stringify({id:msgId}));
        });
    }
    //login/logout mechanism
    else if(req.url=='/login')
    {
        var requestBody = '';
        req.on('data', function(chunk)
        {
            requestBody = JSON.parse(chunk);
        });
        req.on('end',function()
        {
            if(requestBody.status=='in')//if log in
            {
                users.push( //push users to users array
                {
                    name: requestBody.name,
                    email: requestBody.email,
                    status: requestBody.status
                });
            }
            else    //else log put
            {
                var usrToRemove = users.findIndex(function(usrs)
                {//check for index of specific user details
                    return usrs.name == requestBody.name && usrs.email == requestBody.email;
                });
                users.splice(usrToRemove,1);//remove from array
            }
                while (userReq.length > 0)//both log in and log out clears getstats requests.
                {
                    var clientRequest = userReq.pop();
                    clientRequest.writeHead(200, { "Content-Type": "text/json" });
                    clientRequest.end(JSON.stringify({users:users.length,messages:Messages.length}));
                }
                //return true
                res.writeHead(200, { "Content-Type": "text/json" });
                res.end(JSON.stringify({result:true}));
        })
    }
    //else wrong prototype for POST
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
        if(Messages.length > count) //if theres new messages in the server
        {
            var msgsToSend = messages.getMessages(count);
            res.writeHead(200, { "Content-Type": "text/json" });
            res.end(JSON.stringify( 
            {
                count: Messages.length,
                append: msgsToSend
            }));
        } 
        else //if no new messages, get in line
        {
            clients.push(res);
        }
    }
    //wrong prototype for GET
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
        //get message id
        var msgid = JSON.parse(url_parts.pathname.substr(10));
        //delete from array
        messages.deleteMessage(msgid);
        while(clients.length > 0)
        {
        //and notify all waiting clients what message id to delete
            var client = clients.pop();
            client.writeHead(200, { "Content-Type": "text/json" });
            client.end(JSON.stringify(msgid));
        }
        //if success
        res.writeHead(200, { "Content-Type": "text/json" });
        res.end(JSON.stringify(msgid));
    }
    //wrong prototype for DELETE
    else if(url_parts.path === '/messages' || url_parts.path.includes('/messages?counter=0') || url_parts.path === '/stats'
        || url_parts.path === '/login' )
    {
        res.writeHead(405);
        res.end();
    }
    else if(isNaN(msgid) == true)
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
    //return 204 for options
    res.writeHead(204);
    res.end();
}
else 
//something went wrong
{
    res.writeHead(405);
    res.end();
}
}).listen(9000, 'localhost');
//export for utils.
module.exports.Messages = Messages;
module.exports.msgId = msgId;
console.log('Server running.');

/*
Setting timeout to clear out messages older then 2 minutes to avoid
Ajax request timeout at the client end.
*/
setInterval(function() 
{
	// close out requests older than 120 seconds
	var expiration = new Date().getTime() - 180000;
    var response;
    while(clients.length > 0)
    {
        response = clients.pop();
        response.writeHead(200, { "Content-Type": "text/plain" });
        response.end(JSON.stringify(""));
    }
    while(userReq.length > 0)
    {
        response = userReq.pop();
        response.writeHead(200, { "Content-Type": "text/plain" });
        response.end(JSON.stringify(""));
    }
}, 200000);

