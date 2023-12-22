const express = require("express");
const app = express();
const port = 5000;
app.use(express.json())
app.listen(port, ()=>{
    console.log("The server is listening on port " + port)
})
const {Pool} = require("pg")
const db = new Pool({
    user:"hc23-24",
    host: "poseidon.salford.ac.uk",
    database:"hc23_24_redocelot",
    password:"Hack_camp",
    port:5432,
});


app.get("/branches", (req, res)=>{
db.query("SELECT * FROM branches")
.then((result) => {
    res.json(result.rows);
})
    .catch((error) => {
        console.log(error);
    });
});

app.get("/files",(req, res) => {
    db.query("SELECT * FROM files")
    .then((result) => {
        res.json(result.rows)
    })
        .catch((error) => {
            res.send("error")
            console.log(error);
        });
});

app.get("/language", (req, res) => {
    db.query("SELECT * FROM languages")
        .then((result) => {
            res.json(result.rows)
        })
        .catch((error) => {
            res.send("error")
            console.log(error);
        });
});

