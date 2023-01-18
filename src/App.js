import logo from "./logo.svg";
import "./App.css";
//import setState
import { useState, useRef } from "react";

function App() {
  const chatLogRef = useRef(null);

  //add state for input and chatlog
  const [input, setInput] = useState("");
  const [chatlog, setChatlog] = useState([]);

  async function handleSubmit(e) {
    e.preventDefault();
    let newChatlog = [...chatlog, { user: "user", message: `${input}` }];
    setInput("");
    //add the user input to the chatlog array
    setChatlog(newChatlog);

    //fetch response to the api combining the chatlog array of messages and sending it as a message to localhost:3002 as a post with .join

    //send request to api-football

    const messages = newChatlog.map((message) => message.message).join("\n");

    const response = await fetch("http://localhost:3002/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: messages,
      }),
    });
    //get the response from the api and add it to the chatlog array

    const data = await response.json();
    setChatlog([...newChatlog, { user: "proStat", message: data.message }]);

    chatLogRef.current.scrollIntoView({
      behavior: "smooth",
      block: "end",
      inline: "nearest",
    });
  }

  async function handleClear(e) {
    e.preventDefault();
    setChatlog([]);
    console.log("clear");
  }

  return (
    <div className="App">
      <div className="chatframe">
        <div className="chatbox">
          <div className="chatlog" ref={chatLogRef}>
            {chatlog.map((message, i) => (
              <ChatMessage key={i} message={message} />
            ))}
          </div>
        </div>
        <form className="form" onSubmit={handleSubmit}>
          <input
            rows="1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            type="text"
            placeholder="Type your message here"
            className="chatinput"
          />
          <button type="submit" className="chatbutton"></button>
          <button
            type="button"
            name="clear"
            onClick={handleClear}
            className="chatbutton"
          ></button>
        </form>
      </div>
    </div>
  );
}

const ChatMessage = ({ message }) => {
  return (
    <div className="chatmessage">
      <div
        className={`msgIcon ${message.user === "proStat" && "proStat"}`}
      ></div>
      <div className={`msgText ${message.user === "proStat" && "proStat"}`}>
        <div className="text">{message.message}</div>
      </div>
    </div>
  );
};

export default App;
