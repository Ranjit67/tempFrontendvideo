import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import JoinArea from "./JoinArea";

export default function JoinRoom() {
  const socketRef = useRef();
  const [hosts, sethosts] = useState([]);
  const [setCall, setsetCall] = useState("");

  useEffect(() => {
    socketRef.current = io.connect("https://groupapi.herokuapp.com/");
    socketRef.current.emit("call", socketRef.current.id);
    socketRef.current.on("for join", (host) => {
      const hostArray = Object.keys(host);
      sethosts(hostArray);
    });
  }, []);
  const groupcall = (index) => {
    setsetCall(hosts[index]);
  };
  return (
    <div>
      <input type="text" />
      <button>Submit</button>
      <div>
        {hosts &&
          hosts.map((hostId, index) => (
            <button onClick={() => groupcall(index)} key={hostId}>
              {hostId}
            </button>
          ))}
      </div>
      {setCall && <JoinArea id={setCall} />}
    </div>
  );
}
