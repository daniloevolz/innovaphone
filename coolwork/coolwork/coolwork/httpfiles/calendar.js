

var Calendar = Calendar || {};

Calendar.createCalendar = function(divMain,availability,schedules,callback,module){

divMain.innerHTML += `
                <!-- caso precise , incluir isso .max-w-s --> 
                    <div class="flex height-[366px] p-1 flex-col items-center gap-3 items-stretch bg-dark-100">
                        <div class="p-1 flex justify-between items-center items-stretch">
                            <span  tabindex="0" class = "flex gap-1 items-center" id = "month-year" ></span>
                            <div class="flex items-center justify-end">
                                <button aria-label="calendar backward" class="focus:text-gray-400 hover:text-gray-400 text-gray-800 dark:text-gray-100" id= "prevMonth">
                                <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-chevron-left" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                    <polyline points="15 6 9 12 15 18" />
                                </svg>
                            </button>
                            <button aria-label="calendar forward" class="focus:text-gray-400 hover:text-gray-400 ml-3 text-gray-800 dark:text-gray-100" id ="nextMonth"> 
                                  <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler  icon-tabler-chevron-right" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                    <polyline points="9 6 15 12 9 18" />
                                </svg>
                            </button>
    
                            </div>

                            </div>
                        
                        <table class="w-full font-sans" id = "calendar-body">

                        </table>
                    </div>


`
setTimeout(function(){
    buildCalendar(availability,callback,module,schedules)
},250)



}

//Calendar.createCalendar("mainDiv") // apenas para visualização na pagina html
// moment.locale('pt-br');

var year;
var currentMonth;

function buildCalendar(availability,callback,module,schedules) {
   
    console.log("Module " + module)
    var date = new Date();
    currentMonth = date.getMonth();
     year = date.getFullYear();

    //  cells.forEach(function (cell) {
    //   var cellDate = cell.getAttribute("data-date");
    //   if (selectedCells.includes(cellDate)) {
    //       cell.classList.add("selected");
    //       cell.classList.add("selectedCellFocus");
    //   }
  //});

    document.getElementById("prevMonth").addEventListener("click", function () {
      currentMonth--;
      if (currentMonth < 0) {
        currentMonth = 11;
        year--;
      }
      rebuildCalendar(availability,callback,module,schedules);
      
    });
  
    document.getElementById("nextMonth").addEventListener("click", function () {
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        year++;
      }
      rebuildCalendar(availability, callback,module,schedules);
      
    });
    
    rebuildCalendar(availability, callback,module,schedules);
    
    
  }
  function buildDailySchedule(day) {
    var scheduleContainer = document.getElementById("schedule-container");
    scheduleContainer.innerHTML = `
      <div class="clock">
        <div class="clock-face">
          ${generateClockMarks()}
        </div>
      </div>`;
  }
  
  function generateClockMarks() {
    let marksHTML = '';
    for (let i = 1; i <= 12; i++) {
      marksHTML += `<div class="triangle" style="--i: ${i};"><b>${i}</b></div>`;
    }
    return marksHTML;
  }
  
  function generateWeekdayHeader() {
    // moment.locale(navigator.language || navigator.userLanguage);
    var lang = navigator.language.split("-")[0]

    const weekdays = moment.weekdaysShort();
    const thead = document.createElement("thead");
    const tr = document.createElement("tr");

    for (var index = 0; index < weekdays.length; index++) {
       var day = Wecom.coolworkTexts[lang][index]
       const th = document.createElement("th");
       const div = document.createElement("div");
       const p = document.createElement("p");
   
       div.classList.add("w-full", "flex", "justify-center");
       p.classList.add("color-dark-300");
 
       p.textContent = day
         
         
       div.appendChild(p);
       th.appendChild(div);
       tr.appendChild(th);
    }
    thead.appendChild(tr);
    return thead;
  }
  var selectedCells = [];
  function rebuildCalendar(availability,callback,module,schedules) {
    var calendarBody = document.getElementById("calendar-body");
    calendarBody.innerHTML = "";
  
    var date = new Date([year, currentMonth, 1]);
    var currentMonthFirstDay = date.getDay();
    var daysInMonth = new Date(year, currentMonth + 1, 0).getDate();

  
    var prevMonth = new Date(year, currentMonth, 0);
    var daysInPrevMonth = prevMonth.getDate();
    var prevMonthStartDay = prevMonth.getDay();

    var day = 1;
    var row;
  
    var monthYearHeader = document.getElementById("month-year");
    monthYearHeader.innerHTML = getMonthName(currentMonth) + " " + year;
  
    calendarBody.appendChild(generateWeekdayHeader()); // dias da semana
  
    row = calendarBody.insertRow();
    // dias do mes passado
    for (var i = prevMonthStartDay; i >= 0; i--) {
        var cell = row.insertCell();
        var dayToShow = daysInPrevMonth - i;
        var cellDiv = document.createElement("div");
        cellDiv.classList.add("px-2", "py-2", "cursor-pointer", "flex", "w-full", "text-transparent","justify-center", "divCell");
        cellDiv.classList.remove("unavailable","available","parcialavailable")
        cellDiv.style.backgroundColor = 'transparent'
        cell.appendChild(cellDiv);
        var pDiv = document.createElement("p")
        pDiv.classList.add("text-base","text-gray-500","text-opacity-80","pCell")
        cellDiv.appendChild(pDiv)
        pDiv.innerHTML = dayToShow
        cell.classList.add("prev-month");
        cell.addEventListener("click", function() {
            currentMonth--;
            if (currentMonth < 0) {
              currentMonth = 11;
              year--;
            }
            rebuildCalendar(availability,callback,module,schedules);
            
          });
      }
    // dias atuais 
    for (var i = 0; i < daysInMonth; i++) {
      if (row.cells.length === 7) {
        row = calendarBody.insertRow();
      }
      var cell = row.insertCell();
      var cellDiv = document.createElement("div")
      cellDiv.classList.add("px-2", "py-2", "cursor-pointer", "flex", "w-full", "justify-center", "divCell","rounded-lg");
      cellDiv.setAttribute("tabindex",0)
      cell.appendChild(cellDiv)
      var pDiv = document.createElement("p")
      pDiv.classList.add("text-base","text-gray-500","dark:text-gray-100","font-semibold","pCell")
      pDiv.style.color = "var(--text-standard)"
      cellDiv.appendChild(pDiv)
      pDiv.innerHTML = day;
      cell.addEventListener("click", function () {
        // buildDailySchedule(parseInt(this.innerHTML));
      });
      day++;
    }
    // dias do mes seguinte
    var nextMonthDay = 1;
    while (row.cells.length < 7) {
      var cell = row.insertCell();
      var cellDiv = document.createElement("div")
      cellDiv.classList.add("px-2", "py-2", "cursor-pointer", "flex", "w-full","text-transparent", "justify-center", "divCell");
      cellDiv.classList.remove("unavailable","available","parcialavailable")
      cellDiv.style.backgroundColor = 'transparent'
      cell.appendChild(cellDiv)
      var pDiv = document.createElement("p")
      pDiv.classList.add("text-base","text-gray-500","text-opacity-80","pCell")
      cellDiv.appendChild(pDiv)
      pDiv.innerHTML = nextMonthDay
      cell.classList.add("next-month");
      cell.addEventListener("click", function() {
        currentMonth++; 
        if (currentMonth > 11) {
          currentMonth = 0;
          year++;
        }
        rebuildCalendar(availability,callback,module,schedules);
      });
      nextMonthDay++;
    }
    var cells = document.querySelectorAll("#calendar-body tr td div");

  //   selectedCells.forEach(function (selectedCell) {

  //     var dataCell = moment(selectedCell.getAttribute("data-date"))
  //     console.log("dataCell " + dataCell.format("YYYY-MM-DD"))
  //     var cell = document.querySelector('[data-date="' + dataCell.format("YYYY-MM-DD") + '"]');
  //     if (cell) {
  //         cell.classList.add("selected");
  //         cell.classList.add("selectedCellFocus");
  //     }
  // });

    

cells.forEach(function (cell) {
  
  var selectedDate = moment([year, currentMonth, cell.textContent]);

  var diaDaSemana = selectedDate.format('dddd');
  cell.setAttribute("day-week", diaDaSemana);

  var selectedDay = parseInt(cell.textContent);
  var formattedDate = moment(selectedDay + "-" + (currentMonth + 1) + "-" + year, "D-M-YYYY").format("YYYY-MM-DD");
  //console.log("FORMATTED-DATE" + formattedDate)
  cell.setAttribute("data-date", formattedDate);
  
  cell.addEventListener("click", function () {
    if (module == "schedule" || module == "update") {
      // Lógica para modo de agendamento
     
      // if (cell.classList.contains("selected")) {
      //   // Desselecionar a data clicada se já estiver selecionada
      //   cell.classList.remove("selected");
      //   cell.classList.remove("selectedCellFocus");
      //   console.log("Erick Calendar 2", JSON.stringify(cell))
  
      //   // selectedCells = selectedCells.filter(function (selectedCell) {
      //   //   return selectedCell !== cell;
      //   // });
      //   selectedCells.pop(cell)
      // } else if(selectedCells.length < 1){
      //   // Selecionar a data clicada
      //   cell.classList.add("selected");
      //   cell.classList.add("selectedCellFocus");
      //   //selectedCells = []
      //   selectedCells.push(cell);
      //   console.log("Erick Calendar 2", JSON.stringify(selectedCells))
      // }
  
      // if (selectedCells.length === 1) {
      //   var selectedDate;
      //   selectedDate = moment(selectedCells[0].getAttribute("data-date"));
      //   console.log("Data selecionada: " + selectedDate.format("YYYY-MM-DD"));

      //   callback({
      //     selectedDate: selectedDate.format("YYYY-MM-DD")
      //   });
      // }
  
      // Remove a classe "selected" de todas as células
      cells.forEach(function(cell) {
          cell.classList.remove('selected');
          cell.classList.remove('selectedCellFocus');
      });
      
      // Adiciona a classe "selected" apenas à célula clicada
      this.classList.add('selected');
      this.classList.add('selectedCellFocus');
      // Obtém o valor do atributo "data-date" da célula clicada
      var selectedDate = this.getAttribute('data-date')//.format("YYYY-MM-DD");
      console.log("ERICK Calendar 2", selectedDate)
      // Chama o callback com o dia clicado
      callback({
        selectedDate
      });
      // if (typeof callback === 'function') {
      //     callback(selectedDate);
      // }
      // function callback(selectedDate) {
      //   selectedDate.format("YYYY-MM-DD")
      //   console.log('Dia clicado:', selectedDate);
      //   // Ou faça qualquer outra coisa com o dia clicado
      
    } 
    // colocar modo Edição junto com schedule
    else if (module === "availability") {
      // Lógica para modo de disponibilidade
      if (!cell.classList.contains("selected")) {
        // Selecionar a data clicada
        if (selectedCells.length < 2) {
          cell.classList.add("selected");
          cell.classList.add("selectedCellFocus");
          selectedCells.push(cell);
        }
        else if(selectedCells.length < 1){
          selectedCells = []
          console.log("SelectedCells Vazia , Nenhuma Data Escolhida")
        }
      } else {
        // Desselecionar a data clicada se já estiver selecionada
        cell.classList.remove("selected");
        cell.classList.remove("selectedCellFocus");
  
        selectedCells = selectedCells.filter(function (selectedCell) {
          return selectedCell !== cell;
        });
      }
  
      if (selectedCells.length === 2) {
        var startDate = moment(selectedCells[0].getAttribute("data-date"));
        var endDate = moment(selectedCells[1].getAttribute("data-date"));
  
        console.log("Data de início: " + startDate.format("YYYY-MM-DD"));
        console.log("Data de fim: " + endDate.format("YYYY-MM-DD"));
  
        // Enviar os dados por meio do callback
        callback({
          startDate: startDate.format("YYYY-MM-DD"),
          endDate: endDate.format("YYYY-MM-DD")
        });
      }


    }


  });

  selectedCells.forEach(function(selectedCell) {

    if(selectedCell.getAttribute("data-date") == cell.getAttribute("data-date") ){
      console.log("Valores Iguais")
      cell.classList.add("selected");
      cell.classList.add("selectedCellFocus");
    }
    
  });


});



        UpdateAvailability(availability,"",schedules) // atualizar visualização do calendario
  }
  
  function getMonthName(month) {
    var months = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    return months[month];
  }
  
  function getDayName(day) {
    var days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    return days[day];
  }

  //Função de botão de status da semana

  function makeStatusWeekButton(state,td) {

    switch (state) {
        case "available":
            td.classList.add("bg-dark-400", "text-white","hover:bg-dark-500","hover:text-white");
            break;
        case "unavailable":
            td.classList.add("bg-dark-100", "text-dark-400");
            break;
        case "onClick":
            td.classList.add("bg-blue-200", "text-white");
            td.addEventListener("click", function() {
                // Adicione aqui a ação que deve ser executada ao clicar no botão
                console.log("Botão clicado");
            });
            break;
        default:
            td.classList.add("bg-gray-500", "text-white");
            td.textContent = "Estado desconhecido";
            break;
    }
}
  
  //funções de disponibilidade

      
function UpdateAvailability(availability, type, schedules) {
        var cells = document.querySelectorAll("#calendar-body tr td div");
        if (availability.length === 0) {
            cells.forEach(function (td) {
                td.classList.add('unavailable');
            });
        }
        else if(availability == "all"){
            cells.forEach(function(td){
                var dataDate = moment(td.getAttribute('data-date')).format('YYYY-MM-DD');
                var dataAtual = moment().format('YYYY-MM-DD');
                if(dataDate < dataAtual){
                  td.classList.add("unavailable")
                  td.classList.add("pointer-events-none");
                }else{
                  td.classList.add("available")
                }
            })
        }
        else {
            availability.forEach(function (dates) {
                var dataAtual = moment().format('YYYY-MM-DD');
                if (type == "recurrentType"){
                    cells = document.querySelectorAll(`.room-${dates.room_id}`)
                    // para a tela do makeViewRoomDetail e makeViewRoom apenas
                    
                }
                if (dates.type == "recurrentType") {
                    cells.forEach(function (td) {
                        // var dayWeek = td.getAttribute('day-week')
                        // console.log("DAY WEEK " + dayWeek)
                        // var dayOfWeek = findDayOfWeek(td.getAttribute('day-week'));
                        var dayOfWeek = td.getAttribute('day-week')
                        var dataDate = moment(td.getAttribute('data-date')).format('YYYY-MM-DD');

                        var defaultDate = "2000-01-01";
                        console.log("cases of week" + dayOfWeek)
                        switch (dayOfWeek) {
                            case "Monday":
                              if (String(dataDate) < String(dataAtual)) {
                                td.classList.remove("avaiable")
                                td.classList.add("unavailable")
                                td.classList.remove("cursor-pointer")                        
                                td.classList.add("pointer-events-none")                               
                              }
                              else if (dates.timestart_monday < dates.timeend_monday && dates.timestart_monday != "" && dates.timeend_monday != "") {
                                  
                                    var start = moment(defaultDate + " " + dates.timestart_monday, "YYYY-MM-DD HH:mm");
                                    var end = moment(defaultDate + " " + dates.timeend_monday, "YYYY-MM-DD HH:mm");
                                    var totalHours = 0;
                                    totalHours += end.diff(start, 'hours');
                                    console.log("Horas disponivies " + totalHours + " em " + String(dataDate))

                                        
                                    if (type == "recurrentType"){
                                        td.classList.remove("unavailable")
                                        makeStatusWeekButton("available", td);
                                        
                                        
                                    }else{
                                        td.classList.remove("unavailable")
                                        td.classList.add('available');
                                    }
                                    // td.classList.add('parcialavailable');
                                
                                    
                              
                              } 
                              else {
                              if (type == "recurrentType"){
                                  
                                  makeStatusWeekButton("unavailable", td);
                                  td.classList.remove("cursor-pointer")  
                                  td.classList.add("pointer-events-none");
                                  
                                  
                              }else{
                                td.classList.remove("available")
                                td.classList.remove("cursor-pointer")   
                                td.classList.add("pointer-events-none");
                                td.classList.add("unavailable")
                              }
                                    
                              }
                                // console.log("Schedules:" +  schedules)
                                // schedules.forEach(function(dateS){
                                //     var dataSplit = dateS.data_start
                                //     var dataS = dataSplit.split("T")[0]  // ajuste para comparar as datas 
                                //     console.log("Data Split " + dataSplit)
                                //     console.log("Data S " + dataS)

                                //     if(dataDate == dataS ){
                                //         td.classList.remove('parcialavailable');
                                //         td.classList.add('unavailable')
                                //     }
                                // })
                                return
                            case "Tuesday":
                              if (String(dataDate) < String(dataAtual)) {
                                td.classList.remove("avaiable")
                                td.classList.add("unavailable")
                                td.classList.remove("cursor-pointer")                        
                                td.classList.add("pointer-events-none")                               
                              }
                              else if (dates.timestart_tuesday < dates.timeend_tuesday && dates.timestart_tuesday != "" && dates.timeend_tuesday != "") {
                                    var start = moment(defaultDate + " " + dates.timestart_tuesday, "YYYY-MM-DD HH:mm");
                                    var end = moment(defaultDate + " " + dates.timeend_tuesday, "YYYY-MM-DD HH:mm");
                                    var totalHours = 0;
                                    totalHours += end.diff(start, 'hours');
                                    console.log("Horas disponivies " + totalHours + " em " + String(dataDate))
                               
                                    if (type == "recurrentType"){
                                        td.classList.remove("unavailable")
                                        makeStatusWeekButton("available", td);
                                        
                                        
                                    }else{
                                        td.classList.remove("unavailable")
                                        td.classList.add('available');
                                    }
                                    // td.classList.add('parcialavailable');
                                
                                    
                              } 
                              else {
                                if (type == "recurrentType"){
                                  
                                  makeStatusWeekButton("unavailable", td);
                                  td.classList.remove("cursor-pointer")  
                                  td.classList.add("pointer-events-none");
                                  
                                  
                              }else{
                                td.classList.remove("available")
                                td.classList.remove("cursor-pointer")   
                                td.classList.add("pointer-events-none");
                                td.classList.add("unavailable")
                              }
                              }
                                //console.log("Schedules:" +  schedules)

                                // schedules.forEach(function(dateS){
                                //     var dataSplit = dateS.data_start
                                //     var dataS = dataSplit.split("T")[0]  // ajuste para comparar as datas 
                                //     //console.log("Data Split " + GetDeviceSchedulesResult)
                                //     console.log("Data S " + dataS)

                                //     if(dataDate == dataS ){
                                //         td.classList.remove('parcialavailable');
                                //         td.classList.add('unavailable')
                                //     }
                                // })
                                
                                return
                            case "Wednesday":
                              if (String(dataDate) < String(dataAtual)) {
                                td.classList.remove("avaiable")
                                td.classList.add("unavailable")
                                td.classList.remove("cursor-pointer")                        
                                td.classList.add("pointer-events-none")                               
                              }
                              else if (dates.timestart_wednesday < dates.timeend_wednesday && dates.timestart_wednesday != "" && dates.timeend_wednesday != "") {
                                    var start = moment(defaultDate + " " + dates.timestart_wednesday, "YYYY-MM-DD HH:mm");
                                    var end = moment(defaultDate + " " + dates.timeend_wednesday, "YYYY-MM-DD HH:mm");
                                    var totalHours = 0;
                                    totalHours += end.diff(start, 'hours');
                                    console.log("Horas disponivies " + totalHours + " em " + String(dataDate))

                                    if (type == "recurrentType"){
                                        td.classList.remove("unavailable")
                                        makeStatusWeekButton("available", td);
                                        
                                        
                                    }else{
                                        td.classList.remove("unavailable")
                                        td.classList.add('available');
                                    }
                                    // td.classList.add('parcialavailable');
                                
                                    
                                } else {
                                  if (type == "recurrentType"){
                                  
                                    makeStatusWeekButton("unavailable", td);
                                    td.classList.remove("cursor-pointer")  
                                    td.classList.add("pointer-events-none");
                                    
                                    
                                }else{
                                  td.classList.remove("available")
                                  td.classList.remove("cursor-pointer")   
                                  td.classList.add("pointer-events-none");
                                  td.classList.add("unavailable")
                                }
                                }
                                //console.log("Schedules:" +  schedules)

                                //schedules.forEach(function(dateS){
                                //    var dataSplit = dateS.data_start
                                //    var dataS = dataSplit.split("T")[0]  // ajuste para comparar as datas 
                                //    console.log("Data Split " + dataSplit)
                                //    console.log("Data S " + dataS)

                                //    if(dataDate == dataS ){
                                //        td.classList.remove('parcialavailable');
                                //        td.classList.add('unavailable')
                                //    }
                                //})

                                return
                            case "Thursday":
                              if (String(dataDate) < String(dataAtual)) {
                                td.classList.remove("avaiable")
                                td.classList.add("unavailable")
                                td.classList.remove("cursor-pointer")                        
                                td.classList.add("pointer-events-none")                               
                              }
                              else if (dates.timestart_thursday < dates.timeend_thursday && dates.timestart_thursday != "" && dates.timeend_thursday != "") {
                                    var start = moment(defaultDate + " " + dates.timestart_thursday, "YYYY-MM-DD HH:mm");
                                    var end = moment(defaultDate + " " + dates.timeend_thursday, "YYYY-MM-DD HH:mm");
                                    var totalHours = 0;
                                    totalHours += end.diff(start, 'hours');
                                    console.log("Horas disponivies " + totalHours + " em " + String(dataDate))

                             
                                    if (type == "recurrentType"){
                                        td.classList.remove("unavailable")
                                        makeStatusWeekButton("available", td);
                                        
                                        
                                    }else{
                                        td.classList.remove("unavailable")
                                        td.classList.add('available');
                                    }
                                    // td.classList.add('parcialavailable');
                                
                                    
                                } else {
                                  if (type == "recurrentType"){
                                  
                                    makeStatusWeekButton("unavailable", td);
                                    td.classList.remove("cursor-pointer")  
                                    td.classList.add("pointer-events-none");
                                    
                                    
                                }else{
                                  td.classList.remove("available")
                                  td.classList.remove("cursor-pointer")   
                                  td.classList.add("pointer-events-none");
                                  td.classList.add("unavailable")
                                }
                                }
                                //console.log("Schedules:" +  schedules)

                                //schedules.forEach(function(dateS){
                                //    var dataSplit = dateS.data_start
                                //    var dataS = dataSplit.split("T")[0]  // ajuste para comparar as datas 
                                //    console.log("Data Split " + dataSplit)
                                //    console.log("Data S " + dataS)

                                //    if(dataDate == dataS ){
                                //        td.classList.remove('parcialavailable');
                                //        td.classList.add('unavailable')
                                //    }
                                //})
                                return
                            case "Friday":
                              if (String(dataDate) < String(dataAtual)) {
                                td.classList.remove("avaiable")
                                td.classList.add("unavailable")
                                td.classList.remove("cursor-pointer")                        
                                td.classList.add("pointer-events-none")                               
                              }
                              else if (dates.timestart_friday < dates.timeend_friday && dates.timestart_friday != "" && dates.timeend_friday != "") {
                                    var start = moment(defaultDate + " " + dates.timestart_friday, "YYYY-MM-DD HH:mm");
                                    var end = moment(defaultDate + " " + dates.timeend_friday, "YYYY-MM-DD HH:mm");
                                    var totalHours = 0;
                                    totalHours += end.diff(start, 'hours');
                                    console.log("Horas disponivies " + totalHours + " em " + String(dataDate))

                                    if (type == "recurrentType"){
                                        td.classList.remove("unavailable")
                                        makeStatusWeekButton("available", td);
                                        
                                        
                                    }else{
                                        td.classList.remove("unavailable")
                                        td.classList.add('available');
                                    }
                                    // td.classList.add('parcialavailable');
                                
                                    
                                } else {
                                  if (type == "recurrentType"){
                                  
                                    makeStatusWeekButton("unavailable", td);
                                    td.classList.remove("cursor-pointer")  
                                    td.classList.add("pointer-events-none");
                                    
                                    
                                }else{
                                  td.classList.remove("available")
                                  td.classList.remove("cursor-pointer")   
                                  td.classList.add("pointer-events-none");
                                  td.classList.add("unavailable")
                                }
                                }
                                //console.log("Schedules:" +  schedules)
                                //schedules.forEach(function(dateS){
                                //    var dataSplit = dateS.data_start
                                //    var dataS = dataSplit.split("T")[0]  // ajuste para comparar as datas 
                                //    console.log("Data Split " + dataSplit)
                                //    console.log("Data S " + dataS)

                                //    if(dataDate == dataS ){
                                //        td.classList.remove('parcialavailable');
                                //        td.classList.add('unavailable')
                                //    }
                                //})
                                return
                            case "Saturday":
                              if (String(dataDate) < String(dataAtual)) {
                                td.classList.remove("avaiable")
                                td.classList.add("unavailable")
                                td.classList.remove("cursor-pointer")                        
                                td.classList.add("pointer-events-none")                               
                              }
                              else if (dates.timestart_saturday < dates.timeend_saturday && dates.timestart_saturday != "" && dates.timeend_saturday != "") {
                                    var start = moment(defaultDate + " " + dates.timestart_saturday, "YYYY-MM-DD HH:mm");
                                    var end = moment(defaultDate + " " + dates.timeend_saturday, "YYYY-MM-DD HH:mm");
                                    var totalHours = 0;
                                    totalHours += end.diff(start, 'hours');
                                    console.log("Horas disponivies " + totalHours + " em " + String(dataDate))
                                    if (type == "recurrentType"){
                                        td.classList.remove("unavailable")
                                        makeStatusWeekButton("available", td);
                                        
                                        
                                    }else{
                                        td.classList.remove("unavailable")
                                        td.classList.add('available');
                                    }
                                    // td.classList.add('parcialavailable');
                                
                                    
                                } else {
                                  if (type == "recurrentType"){
                                  
                                    makeStatusWeekButton("unavailable", td);
                                    td.classList.remove("cursor-pointer")  
                                    td.classList.add("pointer-events-none");
                                    
                                    
                                }else{
                                  td.classList.remove("available")
                                  td.classList.remove("cursor-pointer")   
                                  td.classList.add("pointer-events-none");
                                  td.classList.add("unavailable")
                                }
                                }
                                //console.log("Schedules:" +  schedules)

                                //schedules.forEach(function(dateS){
                                //    var dataSplit = dateS.data_start
                                //    var dataS = dataSplit.split("T")[0]  // ajuste para comparar as datas 
                                //    console.log("Data Split " + dataSplit)
                                //    console.log("Data S " + dataS)

                                //    if(dataDate == dataS ){
                                //        td.classList.remove('parcialavailable');
                                //        td.classList.add('unavailable')
                                //    }
                                //})
                                return
                            case "Sunday":
                              if (String(dataDate) < String(dataAtual)) {
                                td.classList.remove("avaiable")
                                td.classList.add("unavailable")
                                td.classList.remove("cursor-pointer")                        
                                td.classList.add("pointer-events-none")                               
                              }
                              else if (dates.timestart_sunday < dates.timeend_sunday && dates.timestart_sunday != "" && dates.timeend_sunday != "") {
                                    var start = moment(defaultDate + " " + dates.timestart_sunday, "YYYY-MM-DD HH:mm");
                                    var end = moment(defaultDate + " " + dates.timeend_sunday, "YYYY-MM-DD HH:mm");
                                    var totalHours = 0;
                                    totalHours += end.diff(start, 'hours');
                                    console.log("Horas disponivies " + totalHours + " em " + String(dataDate))
                                    
                                    if (type == "recurrentType"){
                                        td.classList.remove("unavailable")
                                        makeStatusWeekButton("available", td);
                                        
                                        
                                    }else{
                                        td.classList.remove("unavailable")
                                        td.classList.add('available');
                                    }
                                    // td.classList.add('parcialavailable');
                                
                                    
                                } else {
                                  if (type == "recurrentType"){
                                  
                                    makeStatusWeekButton("unavailable", td);
                                    td.classList.remove("cursor-pointer")  
                                    td.classList.add("pointer-events-none");
                                    
                                    
                                }else{
                                  td.classList.remove("available")
                                  td.classList.remove("cursor-pointer")   
                                  td.classList.add("pointer-events-none");
                                  td.classList.add("unavailable")
                                }
                                }
                                // console.log("Schedules:" +  schedules)
                               
                                // schedules.forEach(function(dateS){
                                //     var dataSplit = dateS.data_start
                                //     var dataS = dataSplit.split("T")[0]  // ajuste para comparar as datas 
                                //     console.log("Data Split " + dataSplit)
                                //     console.log("Data S " + dataS)

                                //     if(dataDate == dataS ){
                                //         td.classList.remove('parcialavailable');
                                //         td.classList.add('unavailable')
                                //     }
                                // })

                                return

                            default:
                                // td.classList.add('unavailable');
                               
                        }
                        td.classList.remove("recurrentText")

                        //var dataDate = moment(td.getAttribute('data-date')).format('YYYY-MM-DD')

                      });

                } else if (dates.type == "periodType"){
                    var datastart = moment(dates.data_start).format('YYYY-MM-DD');
                    var dataend = moment(dates.data_end).format('YYYY-MM-DD');
                    //var dataAtual = moment().format('YYYY-MM-DD');
                    cells.forEach(function (td) {
                        var dataDate = moment(td.getAttribute('data-date')).format('YYYY-MM-DD');
                        if (String(dataDate) >= String(dataAtual) && String(dataDate) <= String(dataend)) {
                            td.classList.remove("unavailable")
                            td.classList.add("available")
                        }
                        else {
                            td.classList.remove("available")
                            td.classList.add('unavailable');
                            td.classList.add("pointer-events-none");
                        }
                        console.log("SCHEDULES UPDATEAVAILABILITY " + JSON.stringify(schedules))

                        schedules.forEach(function(s){
                          var dataStartSchedule = moment(s.data_start).format('YYYY-MM-DD');
                          if(s.type == "dayModule" && dataDate == dataStartSchedule ){
                              td.classList.remove("available");
                              td.classList.add('scheduled')
                              td.classList.add("pointer-events-none");
                          }
                        //   var datastartDateHour = moment(dates.data_start).format('YYYY-MM-DD HH:mm');
                        //   var dataendDateHour = moment(dates.data_end).format('YYYY-MM-DD HH:mm');
                        //   // agendamentos com hora 
                          
                        //   var dataEndSchedule = moment(s.data_end).format('YYYY-MM-DD HH:mm');
                          
                        //   console.log("DATADATE " + dataDate)
                        //   if(String(dataStartSchedule) >= String(datastartDateHour) && String(dataEndSchedule) <= String(dataendDateHour)){
                                
                        //         td.classList.add('unavailable');
                        //         td.classList.add("pointer-events-none");
                        // }
                        })   
                    });
                }
            })
        }
        console.log("UpdateAvailability Result Success");

  }

    
//   function findDayOfWeek(classes) {
//       for (var j = 0; j < classes.length; j++) {
//           switch (classes) {
//               case "segunda-feira":
//                   return "monday";
//               case "terça-feira":
//                   return "tuesday";
//               case "quarta-feira":
//                   return "wednesday";
//               case "quinta-feira":
//                   return "thursday";
//               case "sexta-feira":
//                   return "friday";
//               case "sabado":
//                   return "saturday";
//               case "domingo":
//                   return "sunday";
//           }
              
          
//       }
//       return null; // Retorna null se não encontrar o nome do dia
//   }

  // Initialize moment.js with the desired locale

  
  