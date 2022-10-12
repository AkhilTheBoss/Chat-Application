import './App.css';
import io from "socket.io-client";
import Text from "./Text"
import React, {useState, useRef, useEffect, createContext} from "react";
import Axios from "axios";

const socket = io.connect("http://localhost:3001");

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUserName] = useState("");
  const [room, setRoom] = useState("");
  const UserNameRef = useRef();
  const RoomIDRef = useRef();

  function joinRoom(){
    const UserName = UserNameRef.current.value;
    if (UserName === "") return;
    console.log("UserName:", UserName);
    setUserName(UserName);

    const RoomID = RoomIDRef.current.value;
    if (RoomID === "") return;
    console.log("RoomID:", RoomID);
    setRoom(RoomID);
    setLoggedIn(true);

    Axios.post("http://localhost:3001/database/send", {
      UserName: UserName,
      RoomID: RoomID
    }).then((response) => {
      console.log("Post req successful");
    });

    socket.emit("join_room", UserName, RoomID); // Sends to the server
  }

  // useEffect(()=>{
  //   console.log("username:", username, "room:", room);
  // }, [username, room])

  return (
    <div className="App">
      {!loggedIn ? (
        <div>
          <h3 id = "HeadingConvo">Join A Conversation</h3>
          <div>
            <input id = "inputName" type = "text" placeholder = "Name" ref = {UserNameRef} />
          </div>
          <div>
            <input id = "inputRoom" type = "text" placeholder = "Room ID" ref = {RoomIDRef} />
          </div>
          <div>
            <button id = "inputButton" onClick = {joinRoom}>Join A Room</button>
          </div>
        </div>
      ):(
        <Text socket={socket} username = {username} room = {room}/>
      )}

    </div>
  );
}

export default App;
