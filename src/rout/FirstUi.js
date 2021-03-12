import React from "react";
import { useHistory } from "react-router";

export default function FirstUi() {
  const history = useHistory();
  return (
    <div>
      <button
        onClick={() => {
          history.push("/createRoom");
        }}
      >
        Create Room
      </button>
      <button
        onClick={() => {
          history.push("/join");
        }}
      >
        Join room
      </button>
    </div>
  );
}
