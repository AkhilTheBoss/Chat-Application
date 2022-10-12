const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
// const mysql = require("mysql");
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./databse.db', sqlite3.OPEN_READWRITE, (err)=>{
  if (err){
    return console.error(err.message);
  }

  console.log("success")
});

// db.run(`CREATE TABLE MessageDB(UserName, RoomID, Sender, Message)`); // This creates the TABLE

// const SQLDrop = `DROP TABLE MessageDB`; // Delete all from the database
// db.run(SQLDrop, (err) => {
//   if (err){
//     return console.error(err.message);
//   }
//   else{
//     console.log("Deleted Table.");
//   }
// });

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});


// let connection = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     port: '8888',  /* port on which phpmyadmin run */
//     password: 'root',
//     database: 'dbname', //for mac and linux
// });
// //
// connection.connect(function(err) {
//     if (err) {
//       return console.error('error: ' + err.message);
//     }
//
//     console.log('Connected to the MySQL server.');
//   });

// db.connect(err => {
//   if (err) throw err;
//   console.log("Connected!");
// });
global.a = "";

function ReceiveRoom(RoomID){
  a = RoomID;
  console.log("RoomID:", a);
}

function SendRoom(){
  return a;
}

app.post("/database/send", (req, res) => {
  const UserName = req.body.UserName;
  const RoomID = req.body.RoomID;

  ReceiveRoom(RoomID);
  // console.log("ROOMID:", RoomID);
});

app.get("/database/receive", (req, res) => {
  console.log("About to retreive all data from the database");

  const SQLSelectAll = `SELECT * FROM MessageDB`; // Select all from the database
  db.all(SQLSelectAll, [], (err, rows) => {
    if(err){
      return console.error(err.message);
    }
    // rows.forEach((row) => {
    //   console.log("Row:", row);
    // });
    return res.send(rows);
  });
});


app.get("/database/select", (req, res) => {
  // const RoomID = req.body.RoomID;

  console.log("About to retreive selected data from the database");
  const RoomID = SendRoom();
  console.log("GetRoom:", RoomID);
  const SQLSelect = `SELECT * FROM MessageDB WHERE RoomID = ?`; // Select all from the database
  db.all(SQLSelect, [RoomID], (err, rows) => {
    // if(err){
    //   return console.error(err.message);
    // }

    // rows.forEach((row) => {
    // console.log("Rows:", rows);
    // });
    return res.send(rows);
  });

  // db.run(SQLSelect);
});


app.post("/database/insert", (req, res) => {

  const UserName = req.body.UserName;
  const RoomID = req.body.RoomID;
  const Sender = req.body.Sender;
  const Message = req.body.Message;

  console.log("UserName:", UserName);

  console.log("About to insert in the database");

  const SQLInsert = `INSERT INTO MessageDB (UserName, RoomID, Sender, Message) VALUES(?,?,?,?)`; // Insert into the database
  db.run(SQLInsert, [UserName, RoomID, Sender, Message], (err) => {
    if (err){
      return console.error(err.message);
    }
    else{
      console.log("Row in Sql table created.");
    }
  });

  // const SQLSelectAll = `SELECT * FROM MessageDB`; // Select all from the database
  // db.all(SQLSelectAll, [], (err, rows) => {
  //   if(err){
  //     return console.error(err.message);
  //   }
  //   rows.forEach((row) => {
  //     console.log("Row:", row);
  //   });
  // })

  // const SQLDrop = `DROP TABLE MessageDB`; // Delete all from the database
  // db.run(SQLDrop, (err) => {
  //   if (err){
  //     return console.error(err.message);
  //   }
  //   else{
  //     console.log("Deleted Table.");
  //   }
  // });



});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (User, room) => {  // receives from the browser if key is join_room
    socket.join(room);
    console.log(`User: ${User} joined room: ${room}`)
  });

  socket.on("messageSent", (params) => {
    console.log("params", params.room);
    // socket.broadcast.emit("messageRecieved", params);
    socket.broadcast.to(params.room).emit("messageRecieved", params);
    // io.sockets.in(params.room).emit("messageRecieved", params);
    // io.sockets.in(params.room).emit("io.sockets.in('room1').emit('function', {foo:bar});", params);
    // io.sockets.in('room1').emit('messageRecieved', {foo:bar});
    // socket.broadcast.emit("messageRecieved", params) // sends to all except the sender
    // io.to(params.room).emit('messageRecieved', params);
    // io.sockets.in('room1').emit('messageRecieved', params);
    socket.emit("messageRecieved", params)  // sends to the sender
  })

  socket.on("disconnect", () => {  // on is an event
    console.log("User Disconnected", socket.id);
  });
});

server.listen(3001, () => {
  console.log("Server running on port 3001");
})
