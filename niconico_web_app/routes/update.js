var express = require('express');
var router = express.Router();

var sqlite3 = require('sqlite3').verbose();
var db;

router.post('/', function(req, res) {
  db = new sqlite3.Database('music_db.db');
  let setValues = () => {
    return new Promise((resolve, reject) => {
      db.serialize(function () {
        db.get("SELECT * FROM niconico_music WHERE video_id = ?", req.body.video_id, function (error, row) {
          if(row){
            //評価の更新
            process.stdout.write(`${req.body.video_id}の評価を"${req.body.hyouka}"に更新します\n`);
            db.run("update niconico_music set hyouka = ? WHERE video_id = ?", req.body.hyouka, req.body.video_id
            , function (err) {
              if (err) {
                console.error(err);
                reject();
              }
            });
            //コメントの更新
            process.stdout.write(`${req.body.video_id}のコメントを"${req.body.comment}"に更新します\n`);
            db.run("update niconico_music set comment = ? WHERE video_id = ?", req.body.comment, req.body.video_id
            , function (err) {
              if (err) {
                console.error(err);
                reject();
              }else{
                resolve();
              }
            });
          }else{
            process.stdout.write(`${req.body.video_id} 
            ${req.body.title} 
            ${req.body.hyouka} 
            ${req.body.comment}を挿入します\n`);
            db.run(
              'insert into niconico_music values (?, ?, ?, ?)',
              req.body.video_id,
              req.body.title,
              req.body.hyouka,
              req.body.comment,
              function (err) {
                if (err) {
                  console.error(err);
                  reject();
                }else{
                  resolve();
                }
              }
            );
          }
        });
      });
    });
  }
  
  setValues().then(function () {
    process.stdout.write('Success\n');
    db.close();
  }).catch(function () {
    process.stdout.write('Failure:\n');
    db.close();
  });
  res.end();
});

module.exports = router;
