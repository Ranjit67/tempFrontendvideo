import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import { v1 as uuid } from "uuid";
import Video from "../Video";

export default function App() {
  const uui = uuid();
  const [textField, settextField] = useState();
  // const [visibul, setvisibul] = useState(false);
  const [hostId, sethostId] = useState();
  const [peers, setPeers] = useState([]);
  const [remotFrontId, setremoteFrontId] = useState("");
  const [wantToConnect, setwantToConnect] = useState("");
  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef([]);
  // const ref = useRef();
  useEffect(() => {
    socketRef.current = io.connect("https://groupapi.herokuapp.com/");

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        userVideo.current.srcObject = stream;
        socketRef.current.emit("uui", uui);
        socketRef.current.on("all user", (users) => {
          const peers = [];
          console.log(users.selfId);
          users.userInThisRoom.forEach((userID) => {
            // console.log(users);
            // socketRef.current.emit("for Accept", { userID, host: users.id });
            const peer = createPeer(userID, socketRef.current.id, stream);
            peersRef.current.push({
              peerID: userID,
              peer,
            });
            peers.push(peer);
          });
          setPeers(peers);
          console.log(users);
        });
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
        socketRef.current.on("permission", (data) => {
          console.log(data);
          setwantToConnect(data.user);
          sethostId(data.hostId);
          // setroomID(data.roomID);
        });
        socketRef.current.on("After permission", (data) => {
          // console.log("my id " + data.myId);
          // console.log("array ids " + data.userInThisRoomforHost);
          // const peers = [];
          // // console.log(users.selfId);
          // data.userInThisRoomforHost.forEach((userID) => {
          //   // console.log(users);
          //   // socketRef.current.emit("for Accept", { userID, host: users.id });
          //   const peer = createPeer(userID, socketRef.current.id, stream);
          //   peersRef.current.push({
          //     peerID: userID,
          //     peer,
          //   });
          //   let bolean = peers.find((element) => element == peer);
          //   if (!bolean) {
          //     peers.push(peer);
          //   }
          // });
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
    peer.on("signal", (signal) => {
      socketRef.current.emit("sanding signal", {
        signal,
        remoteSocketid,
        selfId,
      });
    });

    return peer;
  };
  // const handelTextField = (e) => {
  //   settextField(e.target.value);
  // };
  // const contactPerson = () => {
  //   socketRef.current.emit("uui", textField);
  // };
  const AcceptCall = () => {
    socketRef.current.emit("accept call", {
      accept: true,
      requesterId: wantToConnect,
      hostId: hostId,
    });
    // setwantToConnect("");
    // setremoteFrontId("")
  };
  // const Reject = () => {
  //   socketRef.current.emit("accept call", { accept: false, roomID: roomID });
  //   setwantToConnect("");
  // };
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
      {/* {uui}
      <br />

      <input type="text" onChange={handelTextField} />
      <br />
      <button onClick={contactPerson}>contact</button>
      <br /> */}

      {peers.map((peer, index) => {
        return <Video key={index} peer={peer} />;
      })}

      {wantToConnect && wantToConnect + " Want to connect.."}
      {wantToConnect && (
        <div>
          <button onClick={AcceptCall}>Accept</button>
          <button
          // onClick={Reject}
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
}
