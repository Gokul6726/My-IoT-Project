const express = require('express')
const https = require("https");
const bodyParser = require("body-parser")
const fs = require("fs")
const app = express()
const port = 80

app.use(bodyParser.urlencoded({extended: true}))

app.use('/', express.static('public'));

var dataValue = "Real-Time Pulse ";
var pulseValue = 1;

const url = "https://api.thingspeak.com/channels/1780944/feeds.json?api_key=X5A83VA0WFBHKWRV&results=2"

app.get('/new-project', function(req, res) {

    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });


    var interval = setInterval(function(){

      https.get(url, function(response){
        response.on("data", function(data){
          patientData = JSON.parse(data)
          pulse = patientData.feeds[1].field1;
          temperature = patientData.feeds[1].field2;
          var pulseValue = pulse;
          dataValue = "Real-Time Pulse "+ pulseValue;
          console.log("SENT: "+ dataValue);
          // res.write('data: ' + { "d1": "pulse", "d2": "temperature" } +'\n\n')

          // res.write("data: "+ pulse + temperature +"\n\n")
          res.write("data: "+ pulse +"\n")
          res.write("data: "+ temperature +"\n\n")
          // res.write("data: "\n\n")
          // res.write(`id: ${(new Date()).toLocaleTimeString()}\ndata: ${data}\n\n`);
          // JSON.stringify({ x: 5, y: 6 }));


        });
      });


        // data = "Real-Time Update "+number;
        // console.log("SENT: "+data);
        // res.write("data: " + data + "\n\n")
        // number++;
    }, randomInteger(2,9)*1000);

    // close
    res.on('close', () => {
        clearInterval(interval);
        res.end();
    });
})

function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

app.get("http://localhost/html/index.html", function(reqs,resp){
})
app.post("/",function(reqs,resp){
  const query1 = reqs.body.from;
  const query2 = reqs.body.to;
  const dwnld_url = "https://api.thingspeak.com/channels/1780944/feeds.csv?start="+ query1 +"&end="+ query2;
  // const dwnld_url = "https://api.thingspeak.com/channels/1780944/feeds.csv?start=2022-11-06&end=2022-11-07";
  const file = fs.createWriteStream("file.csv");
  https.get(dwnld_url,function(resp){
    console.log(resp.statusCode);
    resp.pipe(file);
    file.on("finish", () => {
       file.close();
       console.log("Download Completed");

   });

  });
  // console.log(reqs.body.from);
  // console.log(reqs.body.to);
  // console.log("post recieved");
})

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`)
})
