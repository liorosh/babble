var http = require('http'),
url = require('url'),
fs = require('fs'),
clients = [],
messages = [];
users = [];
userReq = [];
var msgId=0;
http.createServer(function (req, res) {
   /* res.writeHead(200, {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin' : '*',
        'Access-Control-Allow-Methods': 'GET,OPTIONS,POST,DELETE'
    });*/
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Access-Control-Allow-Headers','Content-Type, From');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader("Access-Control-Allow-Methods", 'GET,OPTIONS,POST,DELETE');
// parse URL
var url_parts = url.parse(req.url);
//console.log(url_parts);
if  (req.method === 'POST') {
    if(req.url == '/messages')
    {
        var requestBody = '';
        req.on('data', function(chunk)
        {
            requestBody = JSON.parse(chunk);
        });
        req.on('end',function()
        {
            var md5=require('md5');
            console.log(md5(requestBody.email));
            console.log('we have all the data ', requestBody);
            messages.push(
            {
                    count: messages.length,
                    message:requestBody.message,
                    user:requestBody.name,
                    time:requestBody.timestamp,
                    id : msgId,
                    email:md5(requestBody.email)
            });
            console.log("finished with msg # "+msgId);
            while(clients.length > 0)
            {
                var client = clients.pop();
                client.end(JSON.stringify(
                    {
                        count: messages.length,
                        append:
                        [{
                        message:requestBody.message,
                        user:requestBody.name,
                        time:requestBody.timestamp,
                        id:msgId,
                        email:md5(requestBody.email)
                        }]
                    }));
            }
        msgId++;
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
                console.log("loging in user: "+requestBody.name+" with email: "+requestBody.email);
                users.push(
                {
                    name: requestBody.name,
                    email: requestBody.email,
                    status: requestBody.status
                });
                /*while (userReq.length > 0)
                {
                    var clientRequest = userReq.pop();
                    clientRequest.end(JSON.stringify(users.length));
                }*/
                //res.end(JSON.stringify(users.length));    
            }
            else
            {
                console.log("loging out user: "+requestBody.name+" with email: "+requestBody.email);
                var usrToRemove = users.findIndex(function(usrs){
                    return usrs.name==requestBody.name && usrs.email==requestBody.email;
                });
                users.splice(usrToRemove,1);
            }
                while (userReq.length > 0)
                {
                    var clientRequest = userReq.pop();
                    clientRequest.end(JSON.stringify({users:users.length,messages:messages.length}));
                }
                res.end(JSON.stringify({users:users.length,messages:messages.length}));
        })
    }
}
else if (req.method === 'GET'){
console.log('GET');
    if(url_parts.pathname.substr(0, 9) == '/messages')
    {
// polling code here
        var count = url_parts.query.replace(/[^0-9]*/, '');
        console.log(count);
        if(messages.length > count) 
        {
            res.end(JSON.stringify( 
            {
                count: messages.length,
                append: messages.slice(count)
            }));
        } else 
        {//get in line
            clients.push(res);
        }
    } 
    else if(req.url=='/stats')
    {
        console.log("stats...");
       userReq.push(res);
    }

}
else if (req.method === 'DELETE' )
{
    console.log("delete in server..");
    if(url_parts.pathname.substr(0,9)=='/messages')
    {
        var result;
        var msgid = JSON.parse(url_parts.pathname.substr(10));
   /* req.on('end',function()
    {
    });*/
        console.log(msgid);
        var msgToDlt = messages.findIndex(function(msgs){
            return msgs.id==msgid;
        });
        if(msgToDlt==-1)
            result=false;
        else
        {
            messages.splice(msgToDlt,1);
            result=true;
            while(clients.length>0){
                var client=clients.pop();
                client.end(JSON.stringify(msgid));
            }
        }
        res.writeHead(200, { "Content-Type": "text/json" });
        res.end(JSON.stringify(result));
    }
}
else if(req.method === 'OPTIONS'){
    console.log("options...");
    res.writeHead(204);
res.end();
}
}).listen(9000, 'localhost');
console.log('Server running.');


//update number of users
//send to all wating users the updated data
//getStats
//send to server req to wait
