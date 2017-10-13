window.Babble = {

counter : 0,
getMessages : function getMessages(counter, callback)
{ 
    var request = new XMLHttpRequest();
    console.log('polling....');
    request.open('GET', 'http://10.0.0.3:9000/messages?counter='+counter, true);
    request.send();
    request.onload = function()
    {
        if(request.status!=200)
            return;
        var data = JSON.parse(request.responseText);


        if(Number.isInteger(data))
        {
           
            removeMessage(data);
        }
        else
        {
            Babble.counter = data.count;
            callback(data); 
        }
        
        msgCounter = document.getElementById('msgCount');
        if(null!= msgCounter)
            msgCounter.textContent=Babble.counter;
        getMessages(Babble.counter,displayMsgOnHtml);
    }
},

register: function register(userInfo)
{
    var request = new XMLHttpRequest();
    localStorage.setItem('babble',JSON.stringify({currentMessage:'',userInfo:{name:userInfo.name,email:userInfo.email}}));
    if("undefined"!==typeof(localStorage))
    {
        var user=JSON.stringify(
            {
            name: userInfo.name,
            email: userInfo.email,
            status:'in'
        })
        request.open('POST','http://10.0.0.3:9000/login',true);
        request.send(user);
    }
    request.onload= function(){}
},

postMessage: function postMessage(message, callback)
{
    console.log("postMessage");
    var request = new XMLHttpRequest();
    request.open("POST", "http://10.0.0.3:9000/messages", true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify(message));
    request.addEventListener('load', function (e)  
    {
        /*if ((request.status >= 200 && request.status < 400))
        {}*/
            if(callback){
            var res1 = JSON.parse(e.target.responseText);
                callback(res1);
            }
    });
},
deleteMessage: function deleteMessage(id, callback)
{
    var request = new XMLHttpRequest();
    request.open('DELETE', 'http://10.0.0.3:9000/messages/' + id,true)
    request.onload = function()
    {
        console.log("returned from server with message to delete..");
        if(callback)
            callback(JSON.parse(request.responseText));
    }
    request.send();
console.log(id);
},
getStats: function getStats(callback)
{
    var usrCount = document.getElementById('usrCount').textContent;
    var request = new XMLHttpRequest();
    request.open('GET','http://10.0.0.3:9000/stats',true);
    request.onload = function()
    {
        var usrCount = document.getElementById('usrCount');
        var val = JSON.parse(request.responseText);
        if(null != usrCount)
            usrCount.textContent = val.users;
        if(callback)
            callback(val);
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
        Babble.postMessage(
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
    var dispMsg=msg.append;
    for(i = 0;i < dispMsg.length;i++)
    {
        var data = (dispMsg[i]);
        var objId = data.id;
        var li = document.createElement("li");
        var msgdiv = document.createElement("div");
        var libody = document.createElement("div");
        var name = document.createElement("cite");
        var time = document.createElement("time");
        var date = new Date(data.time);
        var img = document.createElement("img");
        var currentUser = JSON.parse(localStorage.getItem('babble'));
        var button = document.createElement("button");
        button.setAttribute('aria-label','delete-message');
        button.className ="deleteButton"
        button.onclick = function (){deletemsg(this.parentElement.id)};
        button.hidden = true;
        button.value = "delete";
        if(data.user=="")
        img.src = "../images/anonymous.png";
        else
        img.src = "http://www.gravatar.com/avatar/" + data.gravatar;
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
        if(currentUser.userInfo.name!="" && currentUser.userInfo.email!="")
        {
            if(currentUser.userInfo.name == data.user && currentUser.userInfo.email == data.email )
            {
                
                libody.appendChild(button);
            }
            
        }
        
        libody.appendChild(name);
        libody.appendChild(time);
        libody.appendChild(msgdiv);
        li.appendChild(libody);
        document.getElementById("msgList").appendChild(li);
    }
}
var textarea = document.getElementById("msg");
var limit = 200;

textarea.oninput = function() {
  textarea.style.height = "";
  textarea.style.height = Math.min(textarea.scrollHeight, 300) + "px";
};
function removeMessage(id)
{
    var msg = document.getElementById(id);
    if(null != msg){
        msg.parentElement.remove();
        Babble.counter--;
    }
    console.log("removing message from clients..");
}
function deletemsg(id){
    console.log("deletemsg");
    Babble.deleteMessage(id);
}
function btnlogin()
{
    var name = document.getElementById('userName').value;
    var email= document.getElementById('email').value;
    Babble.register({name,email});
    console.log("loging in: " + name+" at email: "+ email);
    hideModal();
}

function anonymous()
{
    var name='';
    var email='';
    Babble.register({name,email});
    console.log("loging anonymous");
    hideModal();    
}
function hideModal(){
        var modal =  document.getElementById('myModal');
       var overlay = document.getElementById('overlay');
        if(modal != null){
        modal.style.display = "block";
        modal.style.display = "none"; 
        }
       if(overlay!=null)
        overlay.hidden = true;
        Babble.getMessages(0,displayMsgOnHtml);
}
//Listeners


window.onbeforeunload = function()
{
    console.log("onbeforeunload");    
    var request = new XMLHttpRequest();
    request.open('POST','http://10.0.0.3:9000/login',true);
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
        usr.currentMessage = document.getElementById('msg').value;
        console.log("onbeforeunload");    
}
window.onunload = function()
{
    console.log("onbeforeunload");    
    var request = new XMLHttpRequest();
    request.open('POST','http://10.0.0.3:9000/login',true);
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
           usr.currentMessage = document.getElementById('msg').value;
        console.log("onbeforeunload");    
}


window.addEventListener('load',function()
{
    console.log("Loading...");
    /*Babble.getMessages(0, displayMsgOnHtml);
    Babble.getStats();*/
    if(localData==null)
    {
        localStorage.setItem('babble',JSON.stringify({currentMessage:'',userInfo:{name:"",email:""}}));
    }   
    var localData = JSON.parse(localStorage.getItem('babble'));
    if(localData.userInfo.name!="" && localData.userInfo.name!="")
    {
        btnlogin();
        hideModal();
    }
    sbmtBtn = document.getElementById('sbtMsgBtn');
    if(sbmtBtn!=null){
        sbmtBtn.addEventListener("click",function(e){
        e.preventDefault();
        sendMsg();
        });
}
    
    Babble.getStats();
    /*document.getElementById('msgCount').textContent = 0;
    document.getElementById('usrCount').textContent = 0;*/
})