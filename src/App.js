import { BrowserRouter, Route, Switch } from "react-router-dom";
import React from "react";
import CreateRoom from "./rout/CreateRoom";
import JoinRoom from "./rout/JoinRoom";
import FirstUi from "./rout/FirstUi";
export default function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/" component={FirstUi} />
        <Route exact path="/join" component={JoinRoom} />
        <Route exact path="/createRoom" component={CreateRoom} />
      </Switch>
    </BrowserRouter>
  );
}
