var babble= require('./main.js');

function addMessage(message)
{
    babble.Messages.push(message);
    return ++babble.msgId;
}

function getMessages(counter)
{
    return babble.Messages.slice(counter);
}

function deleteMessage(id)
{
    var msgToDlt = babble.Messages.findIndex(function(msgs){
        return msgs.id == id;
    });
    if(msgToDlt!=-1)
        babble.Messages.splice(msgToDlt,1);
}
module.exports = {addMessage , getMessages , deleteMessage};