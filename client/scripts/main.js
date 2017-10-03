window.Babble = {

counter : 0,
getMessages : function getMessages(counter, callback) { 
    var request = new XMLHttpRequest();
    request.open('GET', 'http://localhost:9000/messages?counter='+Babble.counter, true);
    console.log('polling....');
    request.onload = function() {
        var data = JSON.parse(request.responseText);
        counter = data.count;
        //var msgs = data.append;
        //display all megs

        callback(data.append); 
        var elem = document.querySelectorAll('#output');
        elem[0].innerHTML+=data.append;
        getMessages();
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
    request.onload = function () {
         if (req1.status >= 200 && req1.status < 400) {
                res1 = JSON.parse(req1.responseText);
            }
    }
    request.send(JSON.stringify(message));
},
};
function sendMsg (){
    if(JSON.parse(localStorage.getItem('babble'))!=null){
    var user= JSON.parse(localStorage.getItem('babble'));
    var msg= document.getElementById('msg').value;
    var date= new Date();
    var temp=date.getTime();
    Babble.postMessages({
        name:user.name,
        email:user.email,
        message:msg,
        timestamp: temp
    })
}
    console.log("sendMsg");
    
}


function displayMsgOnHtml(){

}

//getMessages(0, displayMsgOnHtml);

window.addEventListener('load',function()
{
    console.log("Loading...");
    var localData=JSON.stringify(localStorage.getItem('babble'));
    Babble.getMessages();
    document.getElementById('myModal').style.display = "block";
});

function btnlogin()
{
    var uname= document.getElementById('userName').value;
    var email= document.getElementById('email').value;
    Babble.register(uname,email);
    document.getElementById('overlay').hidden = true;
    document.getElementById('myModal').style.display = "none";
    console.log("loging in: " + uname+" at email: "+ email);
}

function anonymous()
{
    var uname='';
    var email='';
    Babble.register(uname,email);
    document.getElementById('overlay').hidden = true;
    document.getElementById('myModal').style.display = "none"; 
    console.log("loging anonymous");    
}