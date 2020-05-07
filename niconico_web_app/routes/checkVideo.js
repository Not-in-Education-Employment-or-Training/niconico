var express = require('express');
var router = express.Router();

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('music_db.db');

/* GET home page. */
router.get('/:video_id', function(req, res, next) {
  db.serialize(function () {
    db.get("SELECT * FROM niconico_music WHERE video_id = ?", req.params.video_id, function (error, row) {
      if(error) {
        console.error('Error!', error);
        return;
      }
      if (row){
        res.send(row.hyouka);
        console.log(row);
      }else{
        res.send("mishicho");
        console.log("mishicho");
      }
    });
  });
});

module.exports = router;
