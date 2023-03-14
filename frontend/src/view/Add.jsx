import { useState } from "react";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

function Add() {
  const [sub, setSub] = useState("");
  const [pred, setPred] = useState("");
  const [obj, setObj] = useState("");
  const handleSubChange = e => { setSub(e.target.value) };
  const handlePredChange = e => { setPred(e.target.value) };
  const handleObjChange = e => { setObj(e.target.value) };

  function addTriple() {
    console.log(sub, pred, obj)
  }

  return (
      <div>
        <br/><br/><br/>
        <TextField label="Subject" variant="outlined" value={sub} onChange={handleSubChange} />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <TextField label="Predicate" variant="outlined" value={pred} onChange={handlePredChange} />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <TextField label="Object" variant="outlined" value={obj} onChange={handleObjChange} />
        <Button style={{margin: "10px 0 0 25px"}} variant="contained" onClick={addTriple}>
          Submit
        </Button>
      </div>
  );
}

export default Add;
