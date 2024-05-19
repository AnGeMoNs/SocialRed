const {connection} = require("./database/connection"); 
const express = require("express");
const cors = require("cors");
connection();
const app = express();
const puerto = 3900;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

const UserRoutes = require("./routes/user");
const PublicationRoutes = require("./routes/publication");
const FollowRoutes = require("./routes/follow");
app.use("/api/user",UserRoutes);
app.use("/api/publication",PublicationRoutes);
app.use("/api/follow",FollowRoutes);


app.listen(puerto, () => {
    console.log("RUNNING IN THE PORT:",puerto);
});