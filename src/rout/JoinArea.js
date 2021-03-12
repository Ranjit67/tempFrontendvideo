import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";

import Video from "../Video";

export default function JonArea(props) {
  const uui = props.id;
  const [textField, settextField] = useState();
  // const [visibul, setvisibul] = useState(false);
  const [peers, setPeers] = useState([]);
  const [message, setmessage] = useState("");
  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef([]);
  const ref = useRef();
  useEffect(() => {
    socketRef.current = io.connect("https://groupapi.herokuapp.com/");

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        userVideo.current.srcObject = stream;
        socketRef.current.emit("uui", uui);
        socketRef.current.on("all user", (users) => {
          const peers = [];
          // console.log(users.selfId);
          socketRef.current.emit("for request", {
            userID: users.selfId,
            host: users.id,
          });
          // console.log(users.userInThisRoom.length);
          // users.userInThisRoom.forEach((userID) => {
          //   // console.log(users);
          //   // console.log(users);

          //   const peer = createPeer(userID, socketRef.current.id, stream);
          //   peersRef.current.push({
          //     peerID: userID,
          //     peer,
          //   });
          //   peers.push(peer);
          // });
          // setPeers(peers);
          // console.log(users);
        });
        let p = [];
        socketRef.current.on("user join", (paylod) => {
          const peer = addPeer(paylod.signal, paylod.hostId, stream);
          peersRef.current.push({
            peerID: paylod.hostId,
            peer,
          });

          setPeers((user) => [...user, peer]);
        });

        socketRef.current.on("receiving returning signal", (paylod) => {
          const item = peersRef.current.find((p) => p.peerID === paylod.id);
          item.peer.signal(paylod.userToHost);
        });
        socketRef.current.on("permission granted", (data) => {
          console.log(data.userInThisRoom);
          // console.log("MY data " + data.myId);
          // const peers = [];
          console.log(data.userInThisRoom);
          data.userInThisRoom.forEach((userID) => {
            // console.log(users);
            // console.log(users);

            const peer = createPeer(userID, socketRef.current.id, stream);
            peersRef.current.push({
              peerID: userID,
              peer,
            });
            let bolean = peers.find((element) => element == peer);
            if (!bolean) {
              console.log(peer);
              peers.push(peer);
              setPeers((user) => [...user, peer]);
            }
          });
          // setPeers(peers);
        });
      });

    //end useEEffect
  }, []);

  const addPeer = (hostSignal, callerID, stream) => {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });
    peer.on("signal", (signal) => {
      socketRef.current.emit("returning signal", { signal, callerID });
    });

    peer.signal(hostSignal);

    return peer;
  };
  const createPeer = (remoteSocketid, selfId, stream) => {
    // console.log(remoteSocketid);
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });
    // socketRef.current.emit("for request", {
    //   userID: remoteSocketid,
    //   host: host,
    // });

    peer.on("signal", (signal) => {
      socketRef.current.emit("sanding signal", {
        signal,
        remoteSocketid,
        selfId,
      });
    });

    return peer;
  };
  const handelTextField = (e) => {
    settextField(e.target.value);
  };
  const contactPerson = () => {
    socketRef.current.emit("uui", textField);
  };
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <video
        width="420"
        height="315"
        ref={userVideo}
        autoPlay
        playsInline
        muted
      ></video>
      {uui}
      <br />

      <input type="text" onChange={handelTextField} />
      <br />
      <button onClick={contactPerson}>contact</button>
      <br />
      {/* {console.log(peers)} */}
      {peers.map((peer, index) => {
        return <Video key={index} peer={peer} />;
      })}

      {message}
    </div>
  );
}
