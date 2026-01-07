import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { Routes, Route } from "react-router-dom";

{/*import Login from "./components/Login";*/}
import Dashboard from "./pages/LandingPage";

function App() {
  return (
    <>
      {/*
        <Login></Login>
      */}
      <Dashboard></Dashboard>
      <h1>gello</h1>
    </>
  );
}

export default App;
