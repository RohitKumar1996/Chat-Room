/**
 * Created by Admin on 6/4/2017.
 */

const mongo = require('mongodb').MongoClient
const client = require('socket.io').listen(8080).sockets;

mongo.connect('mongodb://127.0.0.1/chat', function (err, db) {
    if(err) throw err;

    client.on('connection', function (socket) {

        let mydb = db.collection('messages');
        let sendStatus = function (s) {
            socket.emit('status', s);
        }

        //emit all messages
        mydb.find().limit(100).sort({_id: 1}).toArray(function (err, res) {
            if(err) throw err;
            socket.emit('output', res);
        })

        //Wait for input
        socket.on('input', function (data) {

            let name = data.name;
            let message = data.message;
            let whitespacePattern = /^\s*$/;

            if(whitespacePattern.test(name) || whitespacePattern.test(message)){
                sendStatus('Name and message is required!')
            } else {
                mydb.insert({name: name, message: message}, function () {

                    //emit latest message to all clients
                    client.emit('output', [data]);

                    sendStatus({
                        message: "Message Sent.",
                        clear: true
                    })
                })
            }

        })

    })
})


