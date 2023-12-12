var Calendar = Calendar || {};

Calendar.createCalendar = function(id,availability,schedule,divCalendar,device,room){

document.getElementById(id).innerHTML +=

`
<div class="flex items-center justify-center py-8 px-4 font-sans">
    
                <div class="max-w-sm w-full shadow-lg">
                    <div class="md:p-8 p-5 dark:bg-gray-800 bg-white rounded-t">
                        <div class="px-4 flex items-center justify-between">
                            <span  tabindex="0" class="focus:outline-none  text-base font-bold dark:text-gray-100 text-gray-800" id = "month-year" >October 2020</span>
                            <div class="flex items-center">
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
                </div>
</div>
`
buildCalendar(availability,schedule,divCalendar,device,room)
}

Calendar.createCalendar("mainDiv")

var year;
var currentMonth;


function buildCalendar(availability, schedule, divCalendar, device, room) {
    var date = new Date();
    currentMonth = date.getMonth();
     year = date.getFullYear();
  
    document.getElementById("prevMonth").addEventListener("click", function () {
      currentMonth--;
      if (currentMonth < 0) {
        currentMonth = 11;
        year--;
      }
      rebuildCalendar(availability, schedule, device, room);
    });
  
    document.getElementById("nextMonth").addEventListener("click", function () {
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        year++;
      }
      rebuildCalendar(availability, schedule, room, device);
    });
  
    rebuildCalendar(availability, schedule, room, device);
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
    const weekdays = moment.weekdaysShort(); // Use moment.js to get localized weekdays
    const thead = document.createElement("thead");
    const tr = document.createElement("tr");
  
    weekdays.forEach((weekday) => {
      const th = document.createElement("th");
      const div = document.createElement("div");
      const p = document.createElement("p");
  
      div.classList.add("w-full", "flex", "justify-center");
      p.classList.add("text-base", "font-medium", "text-center", "text-gray-800", "dark:text-gray-100");
      p.textContent = weekday;
  
      div.appendChild(p);
      th.appendChild(div);
      tr.appendChild(th);
    });
  
    thead.appendChild(tr);
    return thead;
  }
  
  function rebuildCalendar(availability, schedule, room, device) {
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

    for (var i = prevMonthStartDay; i >= 0; i--) {
        var cell = row.insertCell();
        var dayToShow = daysInPrevMonth - i;
      
        var cellDiv = document.createElement("div");
        cellDiv.classList.add("px-2", "py-2", "cursor-pointer", "flex", "w-full", "justify-center", "divCell");
        cell.appendChild(cellDiv);
        cellDiv.innerHTML = dayToShow;
      
        cell.classList.add("prev-month", "pt-6");
      }
  
    for (var i = 0; i < daysInMonth; i++) {
      if (row.cells.length === 7) {
        row = calendarBody.insertRow();
      }
      var cell = row.insertCell();

      var cellDiv = document.createElement("div")
      cellDiv.classList.add("px-2", "py-2", "cursor-pointer", "flex", "w-full", "justify-center", "divCell");
      cell.appendChild(cellDiv)
      var pDiv = document.createElement("p")
      pDiv.classList.add("text-base","text-gray-500","dark:text-gray-100","pCell")
      cellDiv.appendChild(pDiv)
      pDiv.innerHTML = day;

      cell.classList.add("pt-6")

      cell.addEventListener("click", function () {
        // buildDailySchedule(parseInt(this.innerHTML));
      });
      day++;
    }
  
    var nextMonthDay = 1;
    while (row.cells.length < 7) {
      var cell = row.insertCell();

      var cellDiv = document.createElement("div")
      cellDiv.classList.add("px-2", "py-2", "cursor-pointer", "flex", "w-full", "justify-center", "divCell");
      cell.appendChild(cellDiv)
      cellDiv.innerHTML = nextMonthDay;
      
      cell.classList.add("next-month","pt-6");
      nextMonthDay++;
    }
    
    var cells = document.querySelectorAll("#calendar-body td div");
    cells.forEach(function (cell) {
      // UpdateAvailability(availability, schedule, room, device)
      var selectedDate = moment([year, currentMonth, cell.textContent ]);
      var diaDaSemana = selectedDate.format('dddd');
      cell.setAttribute("day-week", diaDaSemana);
  
      var selectedDay = parseInt(cell.textContent);
      var formattedDate = moment(selectedDay + "-" + (currentMonth + 1) + "-" + year, "D-M-YYYY").format("YYYY-MM-DD");
      cell.setAttribute("data-date", formattedDate);
  
      cell.addEventListener("click", function () {
        console.log("Data inicio:" + formattedDate + "00:00");
        console.log("Data Fim:" + formattedDate + "23:59");
        // makeDivConfirmPhoneRecurrentSchedule()
      });
    });
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
  
  // Initialize moment.js with the desired locale
  moment.locale('pt-br');
  
  