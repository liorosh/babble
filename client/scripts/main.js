window.Babble = 
{

    counter : 0,
    getMessages : function getMessages(counter, callback)
    { 
        var request = new XMLHttpRequest();
        request.open('GET', 'http://localhost:9000/messages?counter='+counter, true);
        request.send();
        request.onload = function()
        {
            if(request.status!=200)//if no success
                return;
            var data = JSON.parse(request.responseText);

            if(Number.isInteger(data))//if got back from Delete
            { 
                removeMessage(data);    //send id to remove.
            }
            else    //else, got back with new messages
            {
                Babble.counter = data.count;
                callback(data); 
            }
            //update counter
            msgCounter = document.getElementById('msgCount');
            if(null != msgCounter)
                msgCounter.textContent=Babble.counter;
            getMessages(Babble.counter,displayMsgOnHtml);
        }
    },

    register: function register(userInfo,callback)
    {
        //save to local storage and send to server only if local storage is defined.
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
        request.onload = function()
        {
            if(request.status != 200)//if no success
                return;
            var result= JSON.parse(request.responseText);
            if(callback)//validate true.
                callback(result);
        }
    },

    postMessage: function postMessage(message, callback)
    {
        //open message request and send Json string of message object.
        var request = new XMLHttpRequest();
        request.open("POST", "http://localhost:9000/messages", true);
        request.setRequestHeader('Content-Type', 'application/json');
        request.send(JSON.stringify(message));
        request.addEventListener('load', function (e)  
        {
            if(request.status!=200) //if no success
                return;
            if(callback)
            {//check for message id.
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
            if(request.status != 200) //if no success
                return;
            //send message id to be removed.
            if(callback)
                callback(JSON.parse(request.responseText));
        }
        request.send();
    },
    getStats: function getStats(callback)
    {
        var request = new XMLHttpRequest();
        request.open('GET','http://localhost:9000/stats',true);
        request.onload = function()
        {
            if(request.status != 200)//if no success
                return;
            //update stats element and send another recursive request to wait again for new updates.
            var val = JSON.parse(request.responseText);
            if(callback)    
                callback(val);
            getStats(updateStats);
        }
        request.send();
    }
};

//post message handler, sends to Babble.postMessage
function sendMsg ()
{
    if(JSON.parse(localStorage.getItem('babble'))!=null)
    {
        var user = JSON.parse(localStorage.getItem('babble'));
        var msg = document.getElementById('msg');
        var date = new Date();
        var temp = date.getTime();
        //gather information needed for message posting
        Babble.postMessage(
        {
            name:user.userInfo.name,
            email:user.userInfo.email,
            message:msg.value,
            timestamp: temp
        });
        //resets textarea
        msg.value = '';
    }
}

function displayMsgOnHtml(msg)
{
    var dispMsg = msg.append;
    for(i = 0; i < dispMsg.length ; i++)
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
        //row containers
        tablerow.className = "msg-container";
        imgDiv.className = "img-container";
        //create delete button        
        button.className = "deleteButton";
        button.setAttribute('aria-label','delete-message');
        button.setAttribute('tabindex', data.id+1 );
        button.onclick = function (){deletemsg(this.parentElement.id)};
        button.hidden = true;
        button.value = "delete";
        //picture depending on user type along with empty alt
        if(data.user == "")
        img.src = "../images/anonymous.png";
        else
            img.src = "http://www.gravatar.com/avatar/" + data.gravatar;
        img.setAttribute('alt',"");
        //create time in a HH:MM format.
        var m = date.getMinutes();
        var h = date.getHours() 
        m = m < 10 ? m = " 0" + m:m;
        h = h < 10 ? h = " 0" + h:h;
        time.innerHTML = "  " + h + ":" + m;
        //msg class, attributes and user details along with message itself
        libody.className = "msgClass";
        libody.setAttribute('tabindex', data.id+1 );
        libody.id = data.id;
        if(data.user == "")
            name.textContent = "Anonymous";
        else
            name.textContent = data.user;
        msgdiv.innerHTML = data.message;
        imgDiv.appendChild(img);
        li.appendChild(imgDiv);
        //append delete button to registered users and their messages only
        if(currentUser.userInfo.name != "" && currentUser.userInfo.email != "")
        {
            if(currentUser.userInfo.name == data.user && currentUser.userInfo.email == data.email )
            {
                libody.appendChild(button);
            }
        }
        //building hirearchy
        libody.appendChild(name);
        libody.appendChild(time);
        libody.appendChild(msgdiv);
        tablerow.appendChild(libody);
        li.appendChild(tablerow);
        document.getElementById('msgList').appendChild(li);
    }
}
//listener for textarea height change
var textarea = document.getElementById("msg");
var limit = 200;

textarea.oninput = function() {
  textarea.style.height = "";
  textarea.style.height = Math.min(textarea.scrollHeight, 300) + "px";
  textarea.parentElement.style.height = textarea.style.height;
  document.getElementById('msgList').setAttribute ("style","height:calc(81% - "+textarea.style.height+" )");
};

//update stats html content with data received from server. this function is sent as callback
function updateStats(stats)
{
    var usrCount = document.getElementById('usrCount');
    var msgCount = document.getElementById('msgCount');
    usrCount.textContent = stats.users;
    msgCount.textContent = stats.messages;
}
/*
removes message according to its unique id number received.
removes an entire li item from the ol element.
*/
function removeMessage(id)
{
    var msg = document.getElementById(id);
    if(null != msg){
        msg.parentElement.parentElement.remove();
        Babble.counter--;
    }
    console.log("removing message from clients..");
}

//button handler for the delete button
function deletemsg(id)
{
    console.log("deletemsg");
    Babble.deleteMessage(id);
}
//login handlers for save and anonumous users.
//getting data and sending to Babble.register
function btnlogin()
{
    var name = document.getElementById('userName').value;
    var email = document.getElementById('email').value;
    Babble.register({name,email});
    hideModal();
}

function anonymous()
{
    var name = '';
    var email = '';
    Babble.register({name,email});
    hideModal();    
}

//hides modal after login occured.
function hideModal()
{
    var modal =  document.getElementById('myModal');
    var overlay = document.getElementById('overlay');
    if(modal != null)
    {
        modal.style.display = "block";
        modal.style.display = "none"; 
    }
    if(overlay !=null)
        overlay.hidden = true;
    Babble.getMessages(0,displayMsgOnHtml);
}

/*
function to be called from unloading listners and send a logout request to the server.
*/

function logout(usr,callback)
{
    var request = new XMLHttpRequest();
    request.open('POST','http://localhost:9000/login',true);
    request.onload = function()
    {
        if(request.status!=200) //if no success
            return;
        var returnva = JSON.parse(request.responseText);
        if(callback)
            callback(returnva.result)
    }
    request.send(JSON.stringify(usr));
}
//Listeners

window.onbeforeunload = function()
{
    console.log("onbeforeunload");    
   
    var usr = JSON.parse(localStorage.getItem('babble'));
    logout(
    {
        name:usr.userInfo.name,
        email:usr.userInfo.email,
        status:'out'
    })
        usr.currentMessage = document.getElementById('msg').value;
        localStorage.setItem('babble',JSON.stringify(usr));
        console.log("onbeforeunload");    
}
window.onunload = function()
{
    var usr = JSON.parse(localStorage.getItem('babble'));
    logout(
    {
        name:usr.userInfo.name,
        email:usr.userInfo.email,
        status:'out'
    })
           usr.currentMessage = document.getElementById('msg').value;
           localStorage.setItem('babble',JSON.stringify(usr));
        console.log("onbeforeunload");    
}

//Page Loading
window.addEventListener('load',function()
{
//send getstats to wait for information to be retreived after login
    Babble.getStats(updateStats);
    var localData = JSON.parse(localStorage.getItem('babble'));
    if(localData == null)   //if no local data, create one.
    {
        localStorage.setItem('babble',JSON.stringify({currentMessage:'',userInfo:{name:"",email:""}}));
    }  
    //create button listener
    sbmtBtn = document.getElementById('sbtMsgBtn');
    if(sbmtBtn != null)
    {
        sbmtBtn.addEventListener("click",function(e)
        {
            e.preventDefault();
            sendMsg();
        });
    }
    //create Enter button post listener.
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
//get details from local storage, if not anonymous, register with exisiting information and hide modal automatically
    var name = localData.userInfo.name;
    var email = localData.userInfo.email;
    if(name != "" && email !="")
    {
        hideModal();
        Babble.register({name,email});
    }
})