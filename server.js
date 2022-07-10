const express = require("express");
const app = express();
const server = require("http").Server(app);
app.set("view engine", "ejs");
app.use(express.static("public"));

const { v4: uuidv4 } = require("uuid");

const io = require("socket.io")(server, {
    cors: {
        origin: '*'
    }
});

const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
    debug: true,
});

app.use("/peerjs", peerServer);

app.get("/", (req, res) => {
    res.redirect(`/${uuidv4()}`);
});

var nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    port: 465,
    host: "smtp.gmail.com",
    auth: {
        user: 's.aravindtest1@gmail.com',
        pass: 'rprlnsysgamhbrnx',
    },
    secure: true,
})

app.post("/send-mail", (req, res) => {

    const to = req.body.to;
    const url = req.body.url;

    const mailData = {
        from: "s.aravindtest1@gmail.com",
        to: to,
        subject: "hi join me in video chat app",
        html: `<p>hi,</p><p>come and join in video chat app</p><p>link to join - ${url}</p>`
    }

    transporter.sendMail(mailData, (err, info) => {
        if (err) return console.log(err)
        res.status(200).send({ message: "Invitation sent", message_id: info.messageId })
    })
})

app.get("/:room", (req, res) => {
    res.render("index", { roomId: req.params.room });
});

io.on("connection", (socket) => {
    socket.on("join-room", (roomId, userId, userName) => {
        socket.join(roomId);
        io.to(roomId).emit("user-connected", userId);
        socket.on("message", (message) => {
            io.to(roomId).emit("createMessage", message, userName);
        });
    })
});

server.listen(process.env.PORT || 3030);
//server.listen(3030);