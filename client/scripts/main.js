window.Babble = {

counter : 0,
getMessages : function getMessages(counter, callback)
{ 
    var request = new XMLHttpRequest();
    //xhr.setRequestHeader('Content-Type', 'application/json');
    request.open('GET', 'http://localhost:9000/messages?counter='+counter, true);
    console.log('polling....');
    request.onload = function()
    {
        var data = JSON.parse(request.responseText);
        callback(data.append); 
        Babble.counter = data.count;
        getMessages(Babble.counter, displayMsgOnHtml);
    };
    request.send();
},

register: function register(userInfo)
{
 window.localStorage.setItem("babble",JSON.stringify({currentMessage:'',userInfo:{name:userInfo.uname,email:userInfo.email}}));
},

postMessages: function postMessages(message, callback)
{
    console.log("postMessages");
    var request = new XMLHttpRequest();
    request.open('POST', 'http://localhost:9000/messages', true);
    request.onload = function () 
    {
        if (req1.status >= 200 && req1.status < 400)
        {
            res1 = JSON.parse(req1.responseText);
        }
    }
    request.send(JSON.stringify(message));
},

};

function sendMsg ()
{
    event.preventDefault();
    if(JSON.parse(localStorage.getItem('babble'))!=null)
    {
        var user= JSON.parse(localStorage.getItem('babble'));
        var msg= document.getElementById('msg').value;
        var date= new Date();
        var temp=date.getTime();
        Babble.postMessages(
        {
            name:user.userInfo.name,
            email:user.userInfo.email,
            message:msg,
            timestamp: temp
        })
    }
    console.log("sendMsg");
}

function displayMsgOnHtml(msg)
{
    for(i=0;i<msg.length;i++)
    {
        var data = JSON.parse(msg[i]);
        var objId = i;
        var li = document.createElement("li");
        var msgdiv = document.createElement("div");
        var name = document.createElement("cite");
        var time = document.createElement("time");
        var date = new Date(data.time);
        time.innerHTML ="  "+date.getHours()+":"+ date.getMinutes();
        li.id = i;
        li.className = "msgClass";
        if(data.user=="")
            name.textContent ="Anonymous";
        else
            name.textContent = data.user;
        msgdiv.innerHTML = data.message;
        li.appendChild(name);
        li.appendChild(time);
        li.appendChild(msgdiv);
        document.getElementById("msgList").appendChild(li);
    }
}

function btnlogin()
{
    var uname= document.getElementById('userName').value;
    var email= document.getElementById('email').value;
    Babble.register({uname,email});
    document.getElementById('overlay').hidden = true;
    document.getElementById('myModal').style.display = "none";
    console.log("loging in: " + uname+" at email: "+ email);
}

function anonymous()
{
    var uname='';
    var email='';
    Babble.register({uname,email});
    document.getElementById('overlay').hidden = true;
    document.getElementById('myModal').style.display = "none"; 
    console.log("loging anonymous");    
}

//Listeners
document.getElementById('sbtMsgBtn').addEventListener("click",sendMsg);
window.addEventListener('load',function()
{
    console.log("Loading...");
    var localData=JSON.stringify(localStorage.getItem('babble'));
    Babble.getMessages(0, displayMsgOnHtml);
    document.getElementById('myModal').style.display = "block";
});