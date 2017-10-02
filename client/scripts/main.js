window.Babble = (
    function() {
var counter = 0;
var poll = function() { //getMessages
    var request = new XMLHttpRequest();
    request.open('GET', 'http://localhost:9000/poll/'+counter, true);
    console.log('polling....');
    request.onload = function() {
        var data = JSON.parse(request.responseText);
        counter = data.count;
        //var msgs = data.append;
        //display all megs

        var elem = document.querySelectorAll('#output');
        elem[0].innerHTML+=data.append;
        poll();
    };
    request.send();
}
poll();

})();
function sendMsg (){
    var msg= document.getElementById('msg').value;
    var date= Date.now();
    console.log("sendMsg "+msg+" at: "+date);
    //message
    //name
    //email
    //time
    //JSON
    //postMessages(...)    send the message to the server
}


window.addEventListener('load',function(){
    console.log("Loading...");

    document.getElementById('myModal').style.display = "block";
});

function btnlogin()
{
    var uname= document.getElementById('userName').value;
    var email= document.getElementById('email').value;
    window.localStorage.setItem("babble",JSON.stringify({currentMessage:'',userInfo:{name:uname,email:email}}));
    document.getElementById('overlay').hidden = true;
    document.getElementById('myModal').style.display = "none";
    console.log("loging in: " + uname+"at email: "+ email);
}

function anonymous()
{
    var uname='';
    var email='';
    window.localStorage.setItem("babble",JSON.stringify({currentMessage:'',userInfo:{name:uname,email:email}}));
    document.getElementById('overlay').hidden = true;
    document.getElementById('myModal').style.display = "none"; 
    console.log("loging anonymous");    
}