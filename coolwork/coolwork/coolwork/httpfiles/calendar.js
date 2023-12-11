var Calendar = Calendar || {};

Calendar.createCalendar = function(id){

document.getElementById(id).innerHTML +=

`
<div class="flex items-center justify-center py-8 px-4 font-sans">
    
                <div class="max-w-sm w-full shadow-lg">
                    <div class="md:p-8 p-5 dark:bg-gray-800 bg-white rounded-t">
                        <div class="px-4 flex items-center justify-between" id = "month-year">
                            <span  tabindex="0" class="focus:outline-none  text-base font-bold dark:text-gray-100 text-gray-800">October 2020</span>
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
                        <!-- daqui p baixo tabela de dias do calendário-->
                            <table class="w-full font-sans" id = "calendar-body">
                                <thead>
                                    <tr>
                                        <th>
                                            <div class="w-full flex justify-center">
                                                <p class="text-base font-medium text-center text-gray-800 dark:text-gray-100">Mo</p>
                                            </div>
                                        </th>
                                        <th>
                                            <div class="w-full flex justify-center">
                                                <p class="text-base font-medium text-center text-gray-800 dark:text-gray-100">Tu</p>
                                            </div>
                                        </th>
                                        <th>
                                            <div class="w-full flex justify-center">
                                                <p class="text-base font-medium text-center text-gray-800 dark:text-gray-100">We</p>
                                            </div>
                                        </th>
                                        <th>
                                            <div class="w-full flex justify-center">
                                                <p class="text-base font-medium text-center text-gray-800 dark:text-gray-100">Th</p>
                                            </div>
                                        </th>
                                        <th>
                                            <div class="w-full flex justify-center">
                                                <p class="text-base font-medium text-center text-gray-800 dark:text-gray-100">Fr</p>
                                            </div>
                                        </th>
                                        <th>
                                            <div class="w-full flex justify-center">
                                                <p class="text-base font-medium text-center text-gray-800 dark:text-gray-100">Sa</p>
                                            </div>
                                        </th>
                                        <th>
                                            <div class="w-full flex justify-center">
                                                <p class="text-base font-medium text-center text-gray-800 dark:text-gray-100">Su</p>
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td class="pt-6">
                                            <div class="px-2 py-2 cursor-pointer flex w-full justify-center"></div>
                                        </td>
                                        <td class="pt-6">
                                            <div class="px-2 py-2 cursor-pointer flex w-full justify-center"></div>
                                        </td>
                                        <td>
                                            <div class="px-2 py-2 cursor-pointer flex w-full justify-center"></div>
                                        </td>
                                        <td class="pt-6">
                                            <div class="px-2 py-2 cursor-pointer flex w-full justify-center">
                                                <p class="text-base text-gray-500 dark:text-gray-100 font-medium">1</p>
                                            </div>
                                        </td>
                                        <td class="pt-6">
                                            <div class="px-2 py-2 cursor-pointer flex w-full justify-center">
                                                <p class="text-base text-gray-500 dark:text-gray-100 font-medium">2</p>
                                            </div>
                                        </td>
                                        <td class="pt-6">
                                            <div class="px-2 py-2 cursor-pointer flex w-full justify-center">
                                                <p class="text-base text-gray-500 dark:text-gray-100">3</p>
                                            </div>
                                        </td>
                                        <td class="pt-6">
                                            <div class="px-2 py-2 cursor-pointer flex w-full justify-center">
                                                <p class="text-base text-gray-500 dark:text-gray-100">4</p>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <div class="px-2 py-2 cursor-pointer flex w-full justify-center">
                                                <p class="text-base text-gray-500 dark:text-gray-100 font-medium">5</p>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="px-2 py-2 cursor-pointer flex w-full justify-center">
                                                <p class="text-base text-gray-500 dark:text-gray-100 font-medium">6</p>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="px-2 py-2 cursor-pointer flex w-full justify-center">
                                                <p class="text-base text-gray-500 dark:text-gray-100 font-medium">7</p>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="w-full h-full">
                                                <div class="flex items-center justify-center w-full rounded-full cursor-pointer">
                                                    <a  role="link" tabindex="0" class="focus:outline-none  focus:ring-2 focus:ring-offset-2 focus:ring-indigo-700 focus:bg-indigo-500 hover:bg-indigo-500 text-base w-8 h-8 flex items-center justify-center font-medium text-white bg-indigo-700 rounded-full">8</a>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="px-2 py-2 cursor-pointer flex w-full justify-center">
                                                <p class="text-base text-gray-500 dark:text-gray-100 font-medium">9</p>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="px-2 py-2 cursor-pointer flex w-full justify-center">
                                                <p class="text-base text-gray-500 dark:text-gray-100">10</p>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="px-2 py-2 cursor-pointer flex w-full justify-center">
                                                <p class="text-base text-gray-500 dark:text-gray-100">11</p>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <div class="px-2 py-2 cursor-pointer flex w-full justify-center">
                                                <p class="text-base text-gray-500 dark:text-gray-100 font-medium">12</p>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="px-2 py-2 cursor-pointer flex w-full justify-center">
                                                <p class="text-base text-gray-500 dark:text-gray-100 font-medium">13</p>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="px-2 py-2 cursor-pointer flex w-full justify-center">
                                                <p class="text-base text-gray-500 dark:text-gray-100 font-medium">14</p>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="px-2 py-2 cursor-pointer flex w-full justify-center">
                                                <p class="text-base text-gray-500 dark:text-gray-100 font-medium">15</p>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="px-2 py-2 cursor-pointer flex w-full justify-center">
                                                <p class="text-base text-gray-500 dark:text-gray-100 font-medium">16</p>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="px-2 py-2 cursor-pointer flex w-full justify-center">
                                                <p class="text-base text-gray-500 dark:text-gray-100">17</p>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="px-2 py-2 cursor-pointer flex w-full justify-center">
                                                <p class="text-base text-gray-500 dark:text-gray-100">18</p>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <div class="px-2 py-2 cursor-pointer flex w-full justify-center">
                                                <p class="text-base text-gray-500 dark:text-gray-100 font-medium">19</p>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="px-2 py-2 cursor-pointer flex w-full justify-center">
                                                <p class="text-base text-gray-500 dark:text-gray-100 font-medium">20</p>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="px-2 py-2 cursor-pointer flex w-full justify-center">
                                                <p class="text-base text-gray-500 dark:text-gray-100 font-medium">21</p>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="px-2 py-2 cursor-pointer flex w-full justify-center">
                                                <p class="text-base text-gray-500 dark:text-gray-100 font-medium">22</p>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="px-2 py-2 cursor-pointer flex w-full justify-center">
                                                <p class="text-base text-gray-500 dark:text-gray-100 font-medium">23</p>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="px-2 py-2 cursor-pointer flex w-full justify-center">
                                                <p class="text-base text-gray-500 dark:text-gray-100">24</p>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="px-2 py-2 cursor-pointer flex w-full justify-center">
                                                <p class="text-base text-gray-500 dark:text-gray-100">25</p>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <div class="px-2 py-2 cursor-pointer flex w-full justify-center">
                                                <p class="text-base text-gray-500 dark:text-gray-100 font-medium">26</p>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="px-2 py-2 cursor-pointer flex w-full justify-center">
                                                <p class="text-base text-gray-500 dark:text-gray-100 font-medium">27</p>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="px-2 py-2 cursor-pointer flex w-full justify-center">
                                                <p class="text-base text-gray-500 dark:text-gray-100 font-medium">28</p>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="px-2 py-2 cursor-pointer flex w-full justify-center">
                                                <p class="text-base text-gray-500 dark:text-gray-100 font-medium">29</p>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="px-2 py-2 cursor-pointer flex w-full justify-center">
                                                <p class="text-base text-gray-500 dark:text-gray-100 font-medium">30</p>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        
                    </div>
                </div>
</div>
`

}

function buildCalendar(availability,schedule,divCalendar,device,room) {

  var date = new Date();
  currentMonth = date.getMonth();
  year = date.getFullYear();

  document.getElementById("prevMonth").addEventListener("click", function() {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      year--;
    }
    rebuildCalendar(availability,schedule,device,room);
  });

  document.getElementById("nextMonth").addEventListener("click", function() {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      year++;
    }
    rebuildCalendar(availability,schedule,room,device);
  });

  rebuildCalendar(availability,schedule,room,device);
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

function rebuildCalendar(availability,schedule,room,device) {
  var calendarBody = document.getElementById("calendar-body");
  calendarBody.innerHTML = "";

  var date = new Date([year, currentMonth, 1]);
  var currentMonthFirstDay = date.getDay()
  var daysInMonth = new Date(year, currentMonth + 1, 0).getDate();

  var prevMonth = new Date(year, currentMonth, 0);
  var daysInPrevMonth = prevMonth.getDate();
  var prevMonthStartDay = prevMonth.getDay();

  var day = 1;
  var row;

  var monthYearHeader = document.getElementById("month-year");
  monthYearHeader.innerHTML = getMonthName(currentMonth) + " " + year;

  row = calendarBody.insertRow();

  for (var i = 0; i < currentMonthFirstDay; i++) {
    var cell = row.insertCell();
    var dayToShow = daysInPrevMonth - currentMonthFirstDay + i + 1;
    cell.innerHTML = dayToShow;
    cell.classList.add("prev-month");
  }

  for (var i = 0; i < daysInMonth; i++) {
    if (row.cells.length === 7) {
      row = calendarBody.insertRow();
    }
    var cell = row.insertCell();
    cell.innerHTML = day;
    cell.addEventListener("click", function() {
    //   buildDailySchedule(parseInt(this.innerHTML));
    });
    day++;
  }

  var nextMonthDay = 1;
  while (row.cells.length < 7) {
    var cell = row.insertCell();
    cell.innerHTML = nextMonthDay;
    cell.classList.add("next-month");
    nextMonthDay++;
  }
  var cells = document.querySelectorAll("#calendar-body td");
  cells.forEach(function(cell) {

    // UpdateAvailability(availability,schedule,room,device)
    var selectedDate = moment([year, currentMonth, cell.innerHTML]);
    var diaDaSemana = selectedDate.format('dddd'); // 'dddd' retorna o nome completo do dia
    cell.setAttribute("day-week", diaDaSemana); 

    var selectedDay = parseInt(cell.innerHTML);
    var formattedDate = moment(selectedDay + "-" + (currentMonth + 1) + "-" + year, "D-M-YYYY").format("YYYY-MM-DD");
    cell.setAttribute("data-date", formattedDate )

    cell.addEventListener("click",function(){
        console.log("Data inicio:" + formattedDate + "00:00")
        console.log("Data Fim:" + formattedDate + "23:59")
        // makeDivConfirmPhoneRecurrentSchedule()
    })

    // cell.addEventListener("click", function() {
    //     schedule.forEach(function(s){
    //         console.log("Data de agendamento Inicio:" + formattedDate + s.data_start )
    //         console.log("Data de agendamento Fim:" + formattedDate + s.data_end )
    //     })
        
        // makeDivConfirmPhoneRecurrentSchedule()
    //   buildDailySchedule(selectedDay);
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
