window.Babble = 
{

    counter : 0,
    getMessages : function getMessages(counter, callback)
    { 
        var request = new XMLHttpRequest();
        console.log('polling....');
        request.open('GET', 'http://localhost:9000/messages?counter='+counter, true);
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
            if(null != msgCounter)
                msgCounter.textContent=Babble.counter;
            getMessages(Babble.counter,displayMsgOnHtml);
        }
    },

    register: function register(userInfo)
    {
        
       // setTimeout(function(){

            //window.alert("registering..");
            var request = new XMLHttpRequest();
            localStorage.setItem('babble',JSON.stringify({currentMessage:'',userInfo:{name:userInfo.name,email:userInfo.email}}));
            if("undefined" !== typeof(localStorage))
            {
                var user=JSON.stringify(
                {
                    name: userInfo.name,
                    email: userInfo.email,
                    status:'in'
                })
                request.open('POST','http://localhost:9000/login',true);
                request.send(user);
            }
            request.onload = function(){}
       // },500);
    },

    postMessage: function postMessage(message, callback)
    {
        console.log("postMessage");
        var request = new XMLHttpRequest();
        request.open("POST", "http://localhost:9000/messages", true);
        request.setRequestHeader('Content-Type', 'application/json');
        request.send(JSON.stringify(message));
        request.addEventListener('load', function (e)  
        {
            if(request.status!=200)
                return;
            if(callback)
            {
                var res1 = JSON.parse(e.target.responseText);
                callback(res1);
            }
        });
    },
    deleteMessage: function deleteMessage(id, callback)
    {
        var request = new XMLHttpRequest();
        request.open('DELETE', 'http://localhost:9000/messages/' + id,true)
        request.onload = function()
        {
            if(request.status!=200)
                return;
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
        request.open('GET','http://localhost:9000/stats',true);
        request.onload = function()
        {
            
            if(request.status!=200)
                return;
                var val = JSON.parse(request.responseText);
                /* if(null != usrCount)
                {*/
                    
                    console.log(val.users);
                   
       /* }*/
            //else
            //window.alert("it was null");
            if(callback)
                callback(val);
            getStats(updateStats);
        }
        request.send();
    }
};

function sendMsg ()
{
    if(JSON.parse(localStorage.getItem('babble'))!=null)
    {
        var user = JSON.parse(localStorage.getItem('babble'));
        var msg = document.getElementById('msg');
        var date = new Date();
        var temp = date.getTime();
        Babble.postMessage(
        {
            name:user.userInfo.name,
            email:user.userInfo.email,
            message:msg.value,
            timestamp: temp
        });
        msg.value='';
    }
    console.log("sendMsg");
}

function displayMsgOnHtml(msg)
{
    var dispMsg = msg.append;
    for(i = 0;i < dispMsg.length;i++)
    {
        var tablerow =  document.createElement("div");
        var imgDiv = document.createElement("div");
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
        button.className = "deleteButton"
        libody.className = "msgClass";
        tablerow.className = "msg-container";
        imgDiv.className = "img-container";            
        button.setAttribute('aria-label','delete-message');
        button.onclick = function (){deletemsg(this.parentElement.id)};
        button.hidden = true;
        button.value = "delete";
        if(data.user == "")
            img.src = "../images/anonymous.png";
        else
            img.src = "http://www.gravatar.com/avatar/" + data.gravatar;
        img.setAttribute('alt',"");
        var m = date.getMinutes();
        m = m < 10 ? m = " 0" + m:m;
        time.innerHTML = "  " + date.getHours() + ":" + m;
        libody.id = data.id;
        if(data.user == "")
            name.textContent = "Anonymous";
        else
            name.textContent = data.user;
        msgdiv.innerHTML = data.message;
        imgDiv.appendChild(img);
        li.appendChild(imgDiv);
        if(currentUser.userInfo.name != "" && currentUser.userInfo.email != "")
        {
            if(currentUser.userInfo.name == data.user && currentUser.userInfo.email == data.email )
            {
                libody.appendChild(button);
            }
        }
        libody.appendChild(name);
        libody.appendChild(time);
        libody.appendChild(msgdiv);
        tablerow.appendChild(libody);
        li.appendChild(tablerow);
        document.getElementById("msgList").appendChild(li);
    }
}

var textarea = document.getElementById("msg");
var limit = 200;

textarea.oninput = function() {
  textarea.style.height = "";
  textarea.style.height = Math.min(textarea.scrollHeight, 300) + "px";
  textarea.parentElement.style.height = textarea.style.height;
  document.getElementById('msgList').style.height = "calc(100%-"+textarea.parentElement.style.height+")";
};
/*
makeGrowable(document.querySelector('.js-growable'));


function makeGrowable(container) {
	var area = container.querySelector('textarea');
	var clone = container.querySelector('span');
	area.addEventListener('input', function(e) {
		clone.textContent = area.value;
	});
}*/

function updateStats(stats)
{
    var usrCount = document.getElementById('usrCount');
    var msgCount = document.getElementById('msgCount');
    usrCount.textContent = stats.users;
    msgCount.textContent = stats.messages;
}
function removeMessage(id)
{
    var msg = document.getElementById(id);
    if(null != msg){
        msg.parentElement.parentElement.remove();
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
    var email = document.getElementById('email').value;
    Babble.register({name,email});
    console.log("loging in: " + name + " at email: " + email);
    hideModal();
}

function anonymous()
{
    var name = '';
    var email = '';
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
       if(overlay !=null)
        overlay.hidden = true;
        Babble.getMessages(0,displayMsgOnHtml);
}
//Listeners


window.onbeforeunload = function()
{
    console.log("onbeforeunload");    
    var request = new XMLHttpRequest();
    request.open('POST','http://localhost:9000/login',true);
    request.onload = function(){
        if(request.status!=200)
            eturn;
        var returnva = JSON.parse(request.responseText);
    }
    var usr = JSON.parse(localStorage.getItem('babble'));
    request.send(JSON.stringify(
    {
        name:usr.userInfo.name,
        email:usr.userInfo.email,
        status:'out'
    }))
        usr.currentMessage = document.getElementById('msg').value;
        localStorage.setItem('babble',JSON.stringify(usr));
        console.log("onbeforeunload");    
}
window.onunload = function()
{
    console.log("onbeforeunload");    
    var request = new XMLHttpRequest();
    request.open('POST','http://localhost:9000/login',true);
    request.onload = function(){
        if(request.status!=200)
            return;
        var returnva = JSON.parse(request.responseText);
    }
    var usr = JSON.parse(localStorage.getItem('babble'));
    request.send(JSON.stringify(
    {
        name:usr.userInfo.name,
        email:usr.userInfo.email,
        status:'out'
    }))
           usr.currentMessage = document.getElementById('msg').value;
           localStorage.setItem('babble',JSON.stringify(usr));
        console.log("onbeforeunload");    
}


window.addEventListener('load',function()
{
    Babble.getStats(updateStats);
    console.log("Loading...");
    
    /*Babble.getMessages(0, displayMsgOnHtml);*/
    var localData = JSON.parse(localStorage.getItem('babble'));
    if(localData == null)
    {
        localStorage.setItem('babble',JSON.stringify({currentMessage:'',userInfo:{name:"",email:""}}));
    }   
    var name = localData.userInfo.name;
    var email = localData.userInfo.email;
    sbmtBtn = document.getElementById('sbtMsgBtn');
    if(sbmtBtn != null)
    {
        sbmtBtn.addEventListener("click",function(e)
        {
            e.preventDefault();
            sendMsg();
        });
    }
    var msgInput = document.getElementById('msg');
    if(null != msgInput)
    {
        msgInput.value = localData.currentMessage;
        msgInput.addEventListener("keypress", function(e)
        {   
            if(13 == e.charCode)
            sendMsg();
        });
    }
    /*document.getElementById('msgCount').textContent = 0;
    document.getElementById('usrCount').textContent = 0;*/
    if(name != "" && email !="")
    {
        hideModal();
        Babble.register({name,email});
    }
})