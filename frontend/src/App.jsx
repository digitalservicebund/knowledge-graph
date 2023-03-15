import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Main from "./view/Main";
import Add from "./view/Add";
import Template from "./view/Template";
import TopBar from "./component/TopBar";

function App() {
  return (
      <BrowserRouter>
        <TopBar />
        <div style={{display: "flex",  justifyContent: "center", alignItems: "center"}}>
          <Routes>
            <Route path="/" element={<Main />}/>
            <Route path="/add" element={<Add />}/>
            <Route path="/template/:id" element={<Template />}  />
          </Routes>
        </div>
      </BrowserRouter>
  );
}

export default App;
