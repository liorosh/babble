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
        if(Number.isInteger(data))
        {
            Babble.counter--;
            removeMessage(data);
        }
        else
        {
            callback(data.append); 
            Babble.counter = data.count;
        }
        document.getElementById('msgCount').textContent=Babble.counter;
        getMessages(Babble.counter, displayMsgOnHtml);
    };
    request.send();
},

register: function register(userInfo)
{
    var request = new XMLHttpRequest();
    localStorage.setItem("babble",JSON.stringify({currentMessage:'',userInfo:{name:userInfo.uname,email:userInfo.email}}));
    if("undefined"!==typeof(localStorage))
    {
        var user=JSON.stringify(
            {
            name: userInfo.uname,
            email: userInfo.email,
            status:'in'
        })
        request.open('POST','http://localhost:9000/login',true);
        request.send(user);
    }
    request.onload= function(){
        document.getElementById('overlay').hidden = true;
        document.getElementById('myModal').style.display = "none"; 
        

    }
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
deleteMessage: function deleteMessage(id, callback)
{
    var request = new XMLHttpRequest();
    request.open('DELETE', 'http://localhost:9000/messages/' + id,true)
    request.onload = function(){
        console.log("returned from server with message to delete..");
        if(typeof(callback==="function"))
            callback(JSON.parse(request.responseText));
    }
    request.send();
console.log(id);
},
getStats: function getStats(callback)
{
    var usrCount = document.getElementById('usrCount').textContent;
    var request = new XMLHttpRequest();
    request.open('GET','http://localhost:9000/stats',true);
    request.onload = function()
    {
         document.getElementById('usrCount').textContent = JSON.parse(request.responseText);
         getStats();
    }
    request.send();
}

};

function sendMsg ()
{

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
    for(i = 0;i < msg.length;i++)
    {
        var data = (msg[i]);
        var objId = data.id;
        var li = document.createElement("li");
        var msgdiv = document.createElement("div");
        var libody = document.createElement("div");
        var name = document.createElement("cite");
        var time = document.createElement("time");
        var date = new Date(data.time);
        var img = document.createElement("img");
        var button = document.createElement("button");
        button.setAttribute('aria-label','delete-message');
        button.className ="deleteButton"
        button.onclick = function (){deletemsg(this.parentElement.id)};
        button.hidden = true;
        button.value = "delete";
        if(data.user=="")
            img.src = "../images/anonymous.png";
        else
            img.src = "http://www.gravatar.com/avatar/" + data.email;
        img.setAttribute('alt',"");
        var m = date.getMinutes();
        m = m < 10 ? m = " 0" + m:m;
        time.innerHTML ="  " + date.getHours()+":"+ m;
        libody.id = data.id;
        libody.className = "msgClass";
        if(data.user=="")
            name.textContent ="Anonymous";
        else
            name.textContent = data.user;
        msgdiv.innerHTML = data.message;
        li.appendChild(img);
        libody.appendChild(button);
        libody.appendChild(name);
        libody.appendChild(time);
        libody.appendChild(msgdiv);
        li.appendChild(libody);
        document.getElementById("msgList").appendChild(li);
    }
}

function removeMessage(id)
{
    document.getElementById(id).parentElement.remove();
    console.log("removing message from clients..");
}
function deletemsg(id){
    console.log("deletemsg");
    Babble.deleteMessage(id,null);
}
function btnlogin()
{
    var uname= document.getElementById('userName').value;
    var email= document.getElementById('email').value;
    Babble.register({uname,email});
    console.log("loging in: " + uname+" at email: "+ email);
}

function anonymous()
{
    var uname='';
    var email='';
    Babble.register({uname,email});
    console.log("loging anonymous");    
}

//Listeners
document.getElementById('sbtMsgBtn').addEventListener("click",function(e){
    e.preventDefault();
    sendMsg();
});

window.onbeforeunload = function(){
    console.log("onbeforeunload");    
    var request = new XMLHttpRequest();
    request.open('POST','http://localhost:9000/login',true);
    request.onload = function(){
        var returnva=JSON.parse(request.responseText);
    }
    var usr = JSON.parse(localStorage.getItem('babble'));
    request.send(JSON.stringify(
    {
        name:usr.userInfo.name,
        email:usr.userInfo.email,
        status:'out'
    }))
        console.log("onbeforeunload");    
            console.log("onbeforeunload");    
                console.log("onbeforeunload");    
                    console.log("onbeforeunload");    

}


window.addEventListener('load',function()
{
    /*document.getElementById('msgCount').textContent = 0;
    document.getElementById('usrCount').textContent = 0;*/
    console.log("Loading...");
    var localData=JSON.stringify(localStorage.getItem('babble'));
    document.getElementById('myModal').style.display = "block";
    Babble.getMessages(0, displayMsgOnHtml);
    Babble.getStats();
})