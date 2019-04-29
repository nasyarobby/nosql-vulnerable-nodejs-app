const Express = require("express");
const app = Express();

var cookieParser = require('cookie-parser');

app.use(Express.json());
app.use(Express.urlencoded({ extended: true }));
app.use(cookieParser());

app.set('view engine', 'pug');
var mongodb = require("mongodb");
var MongoClient = mongodb.MongoClient;
var ObjectId = mongodb.ObjectID;
var url = "mongodb://localhost/";

var isAuthenticated = function (req, res, next) {
    if (req.cookies.session) {
        MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
            let dbo = db.db("dvna");
            try {
                let id = ObjectId(req.cookies.session);
                dbo.collection("users").findOne({ _id: id })
                .then(result => {
                    if (result) {
                        req.user = result;
                        next();
                    }
                    else {
                        res.clearCookie("session");
                        res.send("Invalid cookie. Clearing the cookie. Please log in again.");
                    }
                })
            } catch (err) {
                res.clearCookie("session");
                res.send(err);
            };
        });
    }
    else
        res.redirect("/login");
}

app.get('/', (req, res) => {
    res.render("home");
});

app.all('/logout', (req, res) => {
    res.clearCookie('session');
    res.send('You have been logged out.');
})

app.get('/register', (req, res) => {
    res.render("registrationForm");
});

app.post('/register', (req, res) => {
    let newUser = {
        name: req.body.name,
        username: req.body.username,
        password: req.body.password
    };

    MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
        if (err) throw err;

        db.db("dvna").collection("users").insertOne(newUser, (err, data) => {
            if (err)
                res.send(err);
            else {
                res.send('User registered: ' + req.body.username);
            }
            db.close();
        });
    });
});

app.get('/login', function (req, res, next) {
    if (req.cookies.session)
        res.redirect("/protected/searchinvoice");
    else
        next();
}, (req, res) => {
    res.render("loginForm");
})

app.post('/login', (req, res) => {

    MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
        if (err) throw err;

        // fix: cast the body request input to intended type (in this case String)
        let username = String(req.body.username);
        let password = String(req.body.password);
        
        // fix: using a proper logical operator (eg. $eq, $in) for checking equality.
        db.db("dvna").collection("users").findOne({ username: {$eq:username}, password: {$eq: password} }, (err, data) => {
            if (err) {
                res.send(err);
            }
            else if (data) {
                res.cookie('session', data._id);
                res.redirect('/protected/searchinvoice');
            }
            else
                res.send('Login failed.');
        })
    })
});

app.get('/protected/searchinvoice',
    isAuthenticated,
    (req, res) => {
        MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
            // fix: cast the querystring to intended type (in this case Number)
            let minimumAmount = Number(req.query.minimum) || 0;

            // fix: using a proper logical operator (eg. $eq, $in) to check equality
            db.db("dvna").collection("invoices").find({userId: {$eq: req.user._id},amount: {$gte: minimumAmount}}).toArray((err, data) => {
                let userInvoices = data;
                res.render('searchInvoice', {user: req.user, invoices: userInvoices, minimumAmount: minimumAmount});
            });
        });
    });

app.listen(3000, () => {
    console.log("App running on port 3000");
})