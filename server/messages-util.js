var babble= require('./main.js');

function addMessage(message)
{//array insertion, return updated counter
    babble.Messages.push(message);
    return ++babble.msgId;
}

function getMessages(counter)
{//get relevant mesasges
    return babble.Messages.slice(counter);
}

function deleteMessage(id)
{
    //delete according to id parameter.
    var msgToDlt = babble.Messages.findIndex(function(msgs){
        return msgs.id == id;
    });
    if(msgToDlt!=-1)
        babble.Messages.splice(msgToDlt,1);
}
module.exports = {addMessage , getMessages , deleteMessage};