const express = require("express");
const app = express()
const http = require("http").Server(app);
const io = require("socket.io")(http,{cors: {
    origin: "*", // or specify your frontend: "http://localhost:3000"
    methods: ["GET", "POST"]
  }});

const cors = require('cors')
app.use(cors())

app.get("/",(req,res)=>{
    res.json({status: "ok"})
})

let map = new Map()

function userConnecting(socket){    // function added the user to the pool
    socket.on("userNameData",(userName, callback) => {
    if([...map.values()].includes(userName)){
        callback("user name already exist ")
    }else{
        map.set(socket.id,userName)
        callback(`user ${userName} is added to the pool`);
        activeUsers()//brodcast the active user list
    }
    })
}

function userDisconnect(socket){
    socket.on("disconnect",()=>{
        map.delete(socket.id);
        activeUsers()  //brodcast the active user list
        console.log('user disconnected');
    })
}

function activeUsers(){  //brodcast the active user list
    const activeUserData = [...map.entries()].map(([id,userName])=>({"id": id, "userName" : userName}))
    io.emit("activeUsers",activeUserData)
}
io.on("connection",(socket)=>{
    console.log('user connected');
    userConnecting(socket)  //function added the user to the pool
    userDisconnect(socket); //dunction which del the user the form the pool 
    socket.on("chatMessage",(msg)=>{
        console.log(msg)
        io.to(msg.id).emit('chatMessage', msg);
    });
    
})

io.on("chatMessage",(msg)=>{
    console.log(msg)
})

http.listen(4000, ()=>{
    console.log('listening on *: http://localhost:4000/');
  });
