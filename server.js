var fs = require('fs');
var bodyParser = require('body-parser');
var express = require("express"); // подключаем модуль express (http сервер)
var mysql = require("mysql"); // подключаем модуль mysql
var cookieParser = require('cookie-parser');
var cookie = require('cookie');
var multer = require('multer');
var user;

app = express();
app.use(cookieParser());
var upload = multer({ dest: '/tmp' });


// создаем парсер для данных application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(__dirname)); // задаем папку, в которой ищем все файлы

// Присоединяем БД
var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: ""
});
connection.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});
connection.query("use clients", function (err, result) {
    if (err) throw err;
    console.log("use ok"); // выводим сообщение в консоль, что все хорошо  и к базе данных подключилось
  });

// Подключаем выгрузку верстки. Наша первая страница входа
app.get("/", function(req,res){
  res.setHeader("Content-Type","text/html");
  res.sendFile(__dirname +"/enter.html");

})

// Регистрация
app.post("/registration", function(req, res){
    if(!req.body) return res.sendStatus(400);
    connection.query("SELECT count(*) as cnt FROM clients", function (err, answer) {    // запросили кол-во записей
        if(err) throw err;
        var count = answer[0].cnt;  // число записей в БД
        console.log(count);

        if (count > 0) {    // в БД уже есть записи ...
            connection.query("SELECT * FROM clients", function (err, result) {
                if(err) throw err;

                console.log(result);
                var bufLog = req.body.login;
                var bufPass = req.body.password;
                var bool = true;
                var i = 0;
                while(bool && i <  result.length) {
                    var log = result[i].login.split(" ", [1]);
                    var pass = result[i].password.split(" ", [1]);
                    if(log == bufLog) {
                        bool = false;
                    }
                    i++;
                }
                if(bool) {  // не нашли пользователя с таким именем, заносим в БД ...
                    connection.query("INSERT INTO clients (login, password) VALUES( \""+ req.body.login + "\",\""+ req.body.password + "\");", function (err, result) {
                            if(err) throw err;
                            console.log("Insert ok");
                    });

                    // Добавим запись в таблицу настроек
                    connection.query("INSERT INTO setting (login, calPos, notePos, infoPos, gallPos) VALUES( \""+ req.body.login + "\",\""+ "100,50" +  "\",\""+ "100,260" + "\",\""+ "660,50" + "\",\"" + "660,260" + "\");", function (err, result) {
                            if(err) throw err;
                            console.log("Insert in setting ok");
                    });

                    res.setHeader("Content-Type","text/html");
                    res.sendFile(__dirname +"/enter.html");
                } else {
                    res.setHeader("Content-Type","text/html");
                    res.sendFile(__dirname +"/registration.html");
                }
            })
        } else {
            connection.query("INSERT INTO clients (login, password) VALUES( \""+ req.body.login + "\",\""+ req.body.password + "\");", function (err, result) {
                    if(err) throw err;
                    console.log("Insert ok");
            });

            // Добавим запись в таблицу настроек
            connection.query("INSERT INTO setting (login, calPos, notePos, infoPos, gallPos) VALUES( \""+ req.body.login + "\",\""+ "100,50" + "\",\""+ "100,260" + "\",\""+ "660,50" + "\",\"" + "660,260" + "\");", function (err, result) {
                    if(err) throw err;
                    console.log("Insert in setting ok");
            });

            // Добавим запись в таблицу виджетов
            // connection.query("INSERT INTO notes (login) VALUES ( \""+ req.body.login + "\");", function (err, result) {
            //     if(err) throw err;
            //     console.log("Insert in notes ok");
            // });

            res.setHeader("Content-Type","text/html");
            res.sendFile(__dirname +"/enter.html");
        }
    });
})

// Авторизация
app.post("/autorization", function(req, res){
    if(!req.body) return res.sendStatus(400);

    connection.query("SELECT * FROM clients", function (err, result) {  // делаем запрос таблицы ВСЕХ пользователей
        if(err) throw err;

        console.log(result);

        var bufLog = req.body.login;
        var bufPass = req.body.password;


        var isUser = true;
        var i = 0;
        while(isUser && i <  result.length) {   // проходим по всем пользователям, пока не найдем текущего
            var log = result[i].login.split(" ", [1]);
            var pass = result[i].password.split(" ", [1]);
            if((log == bufLog) && (pass == bufPass)) { // данный пользователь есть в БД ...
                isUser = false; // чтобы выйти из цикла, так как нашли нашего пользователя
                user = bufLog; // запомнили пользователя

                // Выгружаем из БД таблицу настроек для нашего пользователя
                connection.query("SELECT * FROM setting WHERE login = ?", [bufLog], function (err, result) {
                    if(err) throw err;

                    //Создаем куки
                    var cal = result[0].calPos.split(",", [2]); // запишем в массив левую и верхнюю координаты календаря
                    var leftCal = cal[0];
                    var topCal = cal[1];

                    var note = result[0].notePos.split(",", [2]);   // запишем в массив левую и верхнюю координаты ежедневника
                    var leftNote = note[0];
                    var topNote = note[1];

                    // Виджет с информацией
                    var info = result[0].infoPos.split(",", [2]);
                    var leftInfo = info[0];
                    var topInfo = info[1];

                    var gall = result[0].gallPos.split(",", [2]);
                    var leftGall = gall[0];
                    var topGall = gall[1];
                    console.log("topGall:" + topGall);

                    var cookLog = cookie.serialize('login', bufLog);    // сохраним в куки логин пользователя
                    var cookLeftCal = cookie.serialize('calLeft', leftCal); //  ---//--- левая граница календаря
                    var cookTopCal = cookie.serialize('calTop', topCal) // ---//--- верхняя граница календаря
                    var cookLeftNote = cookie.serialize('noteLeft', leftNote);   // ---//--- левая граница ежедневника
                    var cookTopNote = cookie.serialize('noteTop', topNote); // ---//---верхняя граница ежедневника
                    var cookLeftInfo = cookie.serialize('infoLeft', leftInfo);
                    var cookTopInfo = cookie.serialize('infoTop', topInfo);
                    var cookLeftGall = cookie.serialize('gallLeft', leftGall);
                    var cookTopGall = cookie.serialize('gallTop', topGall);

                    res.setHeader("Set-Cookie", [cookLog, cookLeftCal, cookTopCal, cookLeftNote, cookTopNote, cookLeftInfo, cookTopInfo, cookTopGall, cookLeftGall]);    // отправляем куки
                    res.sendFile(__dirname +"/main.html");  // загружаем нашу страницу
                })
            }
            i++;
        }

        if (isUser) {   // если не нашли пользователя, то перекидываем его на страницу регистрации ...
            res.setHeader("Content-Type","text/html");
            res.sendFile(__dirname +"/registration.html");
        }
    })
})

// Получаем и сохраняем в БД данные при сохранении настроек
app.post("/saveSetting", function (req, res) {
    if(!req.body) return res.sendStatus(400);

    // var upd = false;
    // var updNote = false;
    // var updInfo = false;

    // Считываем полученные данные
    var recLog = req.body.login;
    var recCalLeft = req.body.calLeft;
    var recCalTop = req.body.calTop;
    var recNoteLeft = req.body.noteLeft;
    var recNoteTop = req.body.noteTop;
    var recInfoLeft = req.body.infoLeft;
    var recInfoTop = req.body.infoTop;
    var recGallLeft = req.body.gallLeft;
    var recGallTop = req.body.gallTop;

    // Склеиваем координаты для БД. Формат: "левая граница, верхняя граница"
    var calPos = (recCalLeft + "," + recCalTop).toString();
    var notePos = (recNoteLeft + "," + recNoteTop).toString();
    var infoPos = (recInfoLeft + "," + recInfoTop).toString();
    var gallPos = (recGallLeft + "," + recGallTop).toString();
    console.log("calPos for save " + calPos);

    // Сохраняем данные в таблицу настроек для текущего пользователя
    connection.query("UPDATE setting SET calPos = ?, notePos = ?, infoPos = ?, gallPos = ? WHERE login = ?", [calPos, notePos, infoPos, gallPos, recLog], function (err, result) {
        if(err) throw err;
        console.log("Update ok");
        //upd = true;
        // if (upd) {    // обновления прошли успешно ...
        //     // res.send(true);
        //     res.setHeader("Content-Type","text/html");
        //     res.sendFile(__dirname +"/main.html");
        // } else {
        //     //res.send(false);
        //     res.redirect('back');
        // }
        // res.setHeader("Content-Type","text/html");
        // res.sendFile(__dirname +"/main.html");
        //res.redirect('main.html');
    });
    res.setHeader("Content-Type","text/html");
    res.sendFile(__dirname +"/main.html");
    //res.redirect('main.html');
})

// Сохраняем в БД запись ежедневника для тукещего клиента
app.post("/saveNote", function (req, res) {
    if(!req.body) return res.sendStatus(400);

    connection.query("INSERT INTO notes (login, note, date) VALUES( \""+ req.body.login + "\",\""+ req.body.text +  "\",\""+ req.body.date + "\");", function (err, result) {
        if(err) throw err;
        console.log(req.body.login + "\'s note was added");
    })
})

// Отправляем записи ежедневника для текущего пользователя
app.post("/getNote", function (req, res) {
    if(!req.body) return res.sendStatus(400);

    var login = req.body.login;
    // Делаем выборку всех записей ежедневника для нашего пользователя
    connection.query("SELECT * FROM notes WHERE login = ?", [login], function (err, result) {
        if(err) throw err;
        console.log("result is...");
        console.log(result);
        res.send(result);   // отправлем записи клиенту
    });
})

app.post("/getInfo", function (req, res) {
    if(!req.body) return res.sendStatus(400);

    var count;  // число записей
    var lastDate;   // дата последней записи
    var imgCount;   // число картинок
    var answer = {};    // пошлем клиету
    // Получим количество записей
    connection.query("SELECT count(*) as cnt FROM notes WHERE login = ?", [req.body.login], function (err, count) {
        if(err) throw err;
        console.log(count[0].cnt);
        count = count[0].cnt;
        answer['count'] = count;

        // Получим дату последней записи
        connection.query("SELECT * FROM notes WHERE login = ?", [req.body.login], function (err, result) {
            console.log(count);
            if (count == 0) {
                answer['date'] = '...';
                console.log(answer);
            } else {
                lastDate = result[result.length-1].date;
                answer['date'] = lastDate;
                console.log(answer);
            }
        });

        // Получим кол-во картинок
        connection.query("SELECT count(*) as cnt FROM image WHERE login = ?", [req.body.login], function (err, count) {
            if(err) throw err;
            imgCount = count[0].cnt;
            answer['imgCount'] = imgCount;
            res.send(answer);
        });
    });
})

// Загрузка картинок
app.post('/upload', upload.single("file"), function (req, res) {

  var file = __dirname + "\\" + req.file.originalname;
   fs.readFile( req.file.path, function (err, data) {
        fs.writeFile(file, data, function (err) {
         if( err ){
            console.error( err );
         }else{
            console.log(file);
            var file1= file.replace(/\\(?!\")/g,"/");
            console.log(file1);
             connection.query("INSERT INTO image (login, img) VALUES( \""+ user + "\",\""+ file1 + "\");", function (err, result) {
                  if(err) throw err;
                  console.log("image was upload");
              });
          }
       });
   });
   res.redirect('main.html');
})

// Отправка картинок клиенту
app.post("/getImg", function (req, res) {
    console.log(req.body.login);
    connection.query("SELECT count(*) as cnt FROM image WHERE login = ?", [req.body.login], function (err, result) {
        console.log("count img");
        console.log(result[0].cnt);
    })
    connection.query("SELECT * FROM image WHERE login = ?", [req.body.login], function (err, result) {
        if(err) throw err;
        res.send(result);
    });
})


app.listen(2000);
console.log('Server running on port 2000');
