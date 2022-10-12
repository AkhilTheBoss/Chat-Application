import "./Text.css";
import { Form, Button, Tab, ListGroup } from "react-bootstrap";
import React, { useState, useRef, useEffect } from "react";
import Axios from "axios";

export default function Text({ socket, username, room }) {
  // console.log(username);
  const MessageInputRef = useRef();
  const [GetMessages, setGetMessage] = useState([]);
  const [LatestMessage, setLatestMessage] = useState("");
  const [TryDelete, setTryDelete] = useState(false);
  const NewMessage = "";
  const LastMessage = useRef();
  const [prevMessages, setPrevMessages] = useState([]);


  useEffect(()=>{
    console.log("About to recieve the entire table by a post req.");
    Axios.get("http://localhost:3001/database/receive").then((response) => {
      console.log("Selection of room information in database successful1.:", response.data);
    });


  }, []);

  useEffect(()=>{
    console.log("About to recieve selected data by a post req.");
    Axios.get("http://localhost:3001/database/select").then((response) => {
      setPrevMessages(response.data);
      console.log("Selection of room information in database successful2.:", response.data);
    });

  }, []);

  function ClickedMessage(Content){
    if (Content.Sender === username){
      setTryDelete(true);
      console.log("Message clicked! ", Content.message);
      // const notCompleted = GetMessages.find((obj) => obj);
      // Content.message = "MESSAGE DELETED";
      //
      // if (notCompleted != null) {
      //   console.log("notCompleted:", notCompleted);
      //   // setGetMessage(notCompleted);
      // }
      // socket.emit("messageSent", Content);

    }
  }

  // function DeleteMessage(e){
  //   alert(e.target.innerText);
  //   setTryDelete(false);
  // }

  function HandleMessages(e) {
    e.preventDefault();
    const Message = MessageInputRef.current.value;
    if (Message === "") return;
    console.log("Message:", Message);
    // setLatestMessage(Message);
    console.log("username:", username, "room:", room);
    const MessageParams = {
      room: room,
      Sender: username,
      message: Message,
      Delete: TryDelete,
    };

    console.log("About to insert data");

    Axios.post("http://localhost:3001/database/insert", {
      UserName: username,
      RoomID: room,
      Sender: username,
      Message: Message
    }).then((response) => {
      console.log("Insertion of room information in database successful.:", response);
    });

    socket.emit("messageSent", MessageParams);
    MessageInputRef.current.value = null;
    // Message = null
    // socket.on("messageRecieved", (data) => {
    //   console.log("DATA:", data);
    // })
  }

  const doStuff = (data) => {
    setGetMessage((list) => [...list, data]);
    setLatestMessage(data.message);
    console.log("Messaged received from the server is:", data);
  }

  useEffect(() => {
    // console.log("HI");
      socket.on("messageRecieved", (data) => {
        doStuff(data);
        console.log("ji");
        // return () => console.log("Cleanup..");
        // console.log("Messaged received from the server is:", data);
        // setGetMessage((list) => [...list, data.message]);
        // setLatestMessage(data.message);
        // console.log("Messaged received from the server is:", data);
        // console.log("AA:", data);
      })
  }, []);

  useEffect(() => {
    console.log("M:", LatestMessage);
    console.log("P:", GetMessages);
    LastMessage.current.scrollIntoView();
  }, [GetMessages, LatestMessage]);



  return (
    <div className="chat">
      <div id = "Header"><h2>Chat</h2></div>
      <div id = "Body">
          {prevMessages && prevMessages.map((history) => {
            {console.log("history.message:", history.Message)}
            return (
              <div>
                <p className = {username === history.Sender ? "message" : "message user"} onClick={() => ClickedMessage(history)}>{history.Message}</p>
                <div className = {username === history.Sender ? "message-info" : "message-user-info"}>
                  <p>{history.Sender}</p>
                </div>

              </div>
            )
          })}
          {GetMessages.map((message) => {
            {console.log("message.message:", message.message)}
            return (
              <div>
                <p className = {username === message.Sender ? "message" : "message user"} onClick={() => ClickedMessage(message)}>{message.message}</p>
                <div className = {username === message.Sender ? "message-info" : "message-user-info"}>
                  <p>{message.Sender}</p>
                </div>

              </div>
            )
          })}

        <div ref = {LastMessage}></div>
      </div>
      <div id="Footer">
        <input type="text" placeholder="Message.." ref={MessageInputRef} />
        <Button variant="primary" id="MessageSubmit" onClick={HandleMessages}>
          Send
        </Button>
      </div>
    </div>
  );
}
