const Express = require("express");
const app = Express();
app.use(Express.json());
app.use(Express.urlencoded({ extended: true }));

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/dvna');

require("./user.model.js");
var User = mongoose.model("user");

app.get('/', (req, res) => {
    res.send("App is working");
});

app.get('/register', (req, res) => {
    res.sendFile("register.html", { root: __dirname });
});

app.post('/register', (req, res) => {
    let newUser = new User(
        {
            name: req.body.name,
            username: req.body.username,
            password: req.body.password
        }
    );

    newUser.save(function (err, data) {
        if (err)
            res.send(err);
        else
            res.send('User registered: ' + req.body.username);
    })
});

app.get('/login', (req, res) => {
    res.sendFile("login.html", { root: __dirname });
})

app.post('/login', (req, res) => {
    User.findOne({ username: req.body.username, password: req.body.password }, (err, data) => {
        if (err) {
            console.log("Error", err.message);
            res.send(err);
        }
        else if (data)
            res.send('Login succeed. Hello, ' + data.name);
        else
            res.send('Login failed.');
    })
})

app.listen(3000, () => {
    console.log("App running on port 3000");
})