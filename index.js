var express = require("express"),
    app = express(),
    pg = require("pg"),
    path = require("path");

app.set("port", (process.env.PORT || 5000));

/*
* PG Client connection
*/
pg.defaults.ssl = true;

var dbString = process.env.DATABASE_URL;

var sharedPgClient;

pg.connect(dbString, function(err,client){
    if(err){
        console.error("PG Connection Error")
    }
    console.log("Connected to Postgres");
    sharedPgClient = client;
});

/*
 * ExpressJS View Templates
 */
app.set("views", path.join(__dirname, "./app/views"));
app.set("view engine", "ejs");

/*
 * Main Landing Page
 */
app.get("/",function defaultRoute(req, res){
    res.send("Hello World.  See <a href='accounts'>Salesforce Accounts Page</a>");
});

/*
 * Accounts Landing Page
 */
app.get("/accounts",function defaultRoute(req, res){
    var query = "SELECT * FROM salesforce.account";
    var result = [];
    sharedPgClient.query(query, function(err, result){
        console.log("Jobs Query Result Count: " + result.rows.length);
        res.render("index.ejs", {connectResults: result.rows});
    });
});

/*
 * Jobs Landing Page
 */
app.get("/upload/:fileName/:fileContent",function defaultRoute(req, res){

    var fileName = req.params.fileName;
    var fileContent = req.params.fileContent;
    //res.send("Uploading the file called: " + fileName);

    var params = {
        Key:    'public/' + fileName,
        Bucket: process.env.BUCKETEER_BUCKET_NAME,
        Body:   new Buffer(fileContent)
    };

    s3.putObject(params, function put(err, data) {
        if (err) {
            console.log(err, err.stack);
            return;
        } else {
            console.log(data);
        }

        delete params.Body;
        s3.getObject(params, function put(err, data) {
            if (err) {
                console.log(err, err.stack);
            } else {
                console.log(data);
            }

            //console.log(data.Body.toString());
            console.log(data.Body.toString());
            res.send(data.Body.toString());
        });
    });

});



/*
 * Run Server
 */
var server = app.listen(app.get('port'), function(){
    console.log('Node Connect App Running at http://%s:%s', server.address().address, server.address().port);
});
