var login, calLeft, calTop, noteLeft, noteTop, infoLeft, infoTop, gallTop, gallLeft;

// Календарь
function Calendar2(id, year, month) {
    var Dlast = new Date(year,month+1,0).getDate(),
    D = new Date(year,month,Dlast),
    DNlast = new Date(D.getFullYear(),D.getMonth(),Dlast).getDay(),
    DNfirst = new Date(D.getFullYear(),D.getMonth(),1).getDay(),
    calendar = '<tr>',
    month=["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
    if (DNfirst != 0) {
    for(var  i = 1; i < DNfirst; i++) calendar += '<td>';
    } else {
        for(var  i = 0; i < 6; i++) calendar += '<td>';
    }
    for(var  i = 1; i <= Dlast; i++) {
        if (i == new Date().getDate() && D.getFullYear() == new Date().getFullYear() && D.getMonth() == new Date().getMonth()) {
                calendar += '<td class="today">' + i;
        } else {
            calendar += '<td>' + i;
        }
        if (new Date(D.getFullYear(),D.getMonth(),i).getDay() == 0) {
        calendar += '<tr>';
        }
    }

    for(var  i = DNlast; i < 7; i++) {
        calendar += '<td>&nbsp;';
    }
    document.querySelector('#'+id+' tbody').innerHTML = calendar;
    document.querySelector('#'+id+' thead td:nth-child(2)').innerHTML = month[D.getMonth()] +' '+ D.getFullYear();
    document.querySelector('#'+id+' thead td:nth-child(2)').dataset.month = D.getMonth();
    document.querySelector('#'+id+' thead td:nth-child(2)').dataset.year = D.getFullYear();
    if (document.querySelectorAll('#'+id+' tbody tr').length < 6) {  // чтобы при перелистывании месяцев не "подпрыгивала" вся страница, добавляется ряд пустых клеток. Итог: всегда 6 строк для цифр
        document.querySelector('#'+id+' tbody').innerHTML += '<tr><td>&nbsp;<td>&nbsp;<td>&nbsp;<td>&nbsp;<td>&nbsp;<td>&nbsp;<td>&nbsp;';
    }
}
Calendar2("calendar2", new Date().getFullYear(), new Date().getMonth());
// переключатель минус месяц
document.querySelector('#calendar2 thead tr:nth-child(1) td:nth-child(1)').onclick = function() {
Calendar2("calendar2", document.querySelector('#calendar2 thead td:nth-child(2)').dataset.year, parseFloat(document.querySelector('#calendar2 thead td:nth-child(2)').dataset.month)-1);
}
// переключатель плюс месяц
document.querySelector('#calendar2 thead tr:nth-child(1) td:nth-child(3)').onclick = function() {
Calendar2("calendar2", document.querySelector('#calendar2 thead td:nth-child(2)').dataset.year, parseFloat(document.querySelector('#calendar2 thead td:nth-child(2)').dataset.month)+1);
}

// Перемещение виджетов
function getSetting() {
    $("#box_calendar").draggable();
    var calendarPos = $("#box_calendar").offset();
    $("#box_notes").draggable();
    console.log("left: " + calendarPos.left + " top: " + calendarPos.top);
    var notePos = $("#box_notes").offset();
    console.log("left: " + notePos.left + " top: " + notePos.top);
    $("#stat").draggable();
    $("#gallery").draggable();
  }

 // Выгружаем натсройки нашего пользователя
 $(document).ready(function () {
     console.log(document.cookie);
     // Считываем куки
     var readenCookie = document.cookie.split(";");
     console.log(readenCookie);
     for (var i = 0; i < readenCookie.length; i++) {
         var buf = readenCookie[i].split("=");
        console.log(buf);
        if (buf[0] == " login") {   // нашли логин
            login = buf[1];
            console.log('login ' + login);
        } else if (buf[0] == " calLeft") {  // нашли левую грпницу календаря
            calLeft = buf[1];
            console.log('left ' + calLeft);
        } else if (buf[0] == " calTop") {   // нашли верхнюю границу календаря
            calTop = buf[1];
            console.log('top ' + calTop);
        } else if (buf[0] == " noteLeft") {
            noteLeft = buf[1];
        } else if (buf[0] == " noteTop") {
            noteTop = buf[1];
        } else if (buf[0] == " infoLeft") {
            infoLeft = buf[1];
        } else if (buf[0] == " infoTop") {
            infoTop = buf[1];
        } else if (buf[0] == " gallLeft") {
            gallLeft = buf[1];
        } else if (buf[0] == " gallTop") {
            gallTop = buf[1];
            console.log("gallTop:" + gallTop);
        }
     }
     // Выставляем виджеты в соответствии с данными о пользователе
     $("#box_calendar").offset({top: calTop, left: calLeft});
     $("#box_notes").offset({top: noteTop, left: noteLeft});
     $("#stat").offset({top: infoTop, left: infoLeft});
     $("#gallery").offset({top: gallTop, left: gallLeft});
 })

 // Сохраняем изменения пользователя
$(document).on('click', '#save_btn', function () {
     // Получаем координаты виджетов
     var calendarPos = $("#box_calendar").offset();
     var notePos = $("#box_notes").offset();
     var infoPos = $("#stat").offset();
     var gallPos = $("#gallery").offset();
     var sendCalLeft = calendarPos.left;
     var sendCalTop = calendarPos.top;
     var sendNoteLeft = notePos.left;
     var sendNoteTop = notePos.top;
     var sendInfoLeft = infoPos.left;
     var sendInfoTop = infoPos.top;
     var sendGallLeft = gallPos.left;
     var sendGallTop = gallPos.top;

     console.log(document.cookie);

     console.log("current log " + login);
     console.log("left " + sendCalLeft);
     // Отправляем координаты на сервер для нашего пользователя
     $.post("/saveSetting", {
         login: login,
         calLeft: sendCalLeft,
         calTop: sendCalTop,
         noteLeft: sendNoteLeft,
         noteTop: sendNoteTop,
         infoLeft: sendInfoLeft,
         infoTop: sendInfoTop,
         gallLeft: sendGallLeft,
         gallTop: sendGallTop
     },
     function () {
        alert('Изменения сохранены');
     })
})

// Отправка в БД записи в ежедневнике
$(document).on('click', '#note_btn', function () {
    var text = $("#note").val();    // считали запись
    var buf = new Date();
    var date = buf.toDateString();

    var length = text.length;
    if (length < 5 || length > 250) {
        alert("Заметка не может содержать меньше 5 или больше 250 симвлов");
    } else {
        console.log('date ' + date + ' text ' + text);
        // Отправляем запись в БД для текущего пользователя
        $.post("/saveNote", {
            login: login,
            text: text,
            date: date
        })
    }
})

// Получение всех записей для тукещего пользователя
$(document).ready(function () {
    $.post("/getNote", {
        login: login
    }, function (data) {
        for (var i = 0; i < data.length; i++) { // выгружаем все заметки
            var text = data[i].date + "\n" + data[i].note + "\n";
            $("#myNote").append(text);
        }
    });
})

// Получение информации о профиле
$(document).ready(function () {
    $.post("/getInfo", {
        login: login
    },
    function (data) {
        $("#info").append("Число записей: " + data.count + "\nДата последней записи: " + data.date + "\nЧисло картинок: " + data.imgCount);
    });
})

// Выгружаем картинки на нашу страничку
function getPicture(path) {
    var elem = document.getElementById('img');

    for (var i = 0; i < path.length; i++) {
        var img = document.createElement("IMG");
        img.src = path[i] ;
        elem.appendChild(img);

        $('img').css({
            'width': '400px',
            'height': '200px',
            'border-radius': '5px'
        })

        $('img').hover(function () {
            $('img').css({
                'width': '500px',
                'height': '300px'
            })
        }, function () {
            $('img').css({
                'width': '400px',
                'height': '200px'
            })
        })
    }
}

// Получение картинок из БД
$(document).ready(function () {
    var name = [];
    $.post("/getImg", {
        login:login
    }, function (data) {
        for (var i = 0; i < data.length; i++) {
            var buf = data[i].img.split("/");
            name.push(buf[buf.length-1]);
        }
        getPicture(name);
    })
})
