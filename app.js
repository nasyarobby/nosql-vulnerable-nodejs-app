const Express = require("express");
const app = Express();
app.use(Express.json());
app.use(Express.urlencoded({extended:true}));

app.get('/', (req, res) => {
    res.send("App is working");
});

app.listen(3000, () => {
    console.log("App running on port 3000");
})