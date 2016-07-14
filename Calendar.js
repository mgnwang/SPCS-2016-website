<HTML>
<HEAD>
<TITLE>JavaScripted Dynamic HTML Table</TITLE>
<STYLE TYPE="text/css">
TD, TH {text-align:center}
</STYLE>
<SCRIPT LANGUAGE="JavaScript">
/*******************
  UTILITY FUNCTIONS
********************/
// day of week of month's first day
function getFirstDay(theYear, theMonth){
    var firstDate = new Date(theYear,theMonth,1)
    return firstDate.getDay()
}
// number of days in the month
function getMonthLen(theYear, theMonth) {
    var oneDay = 1000 * 60 * 60 * 24
    var thisMonth = new Date(theYear, theMonth, 1)
    var nextMonth = new Date(theYear, theMonth + 1, 1)
    var len = Math.ceil((nextMonth.getTime() - 
        thisMonth.getTime())/oneDay)
    return len
}
// create array of English month names
var theMonths = ["January","February","March","April","May","June","July","August",
"September","October","November","December"]
// return IE4+ or W3C DOM reference for an ID
function getObject(obj) {
    var theObj
    if (document.all) {
        if (typeof obj == "string") {
            return document.all(obj)
        } else {
            return obj.style
        }
    }
    if (document.getElementById) {
        if (typeof obj == "string") {
            return document.getElementById(obj)
        } else {
            return obj.style
        }
    }
    return null
}

/************************
  DRAW CALENDAR CONTENTS
*************************/
// clear and re-populate table based on form's selections
function populateTable(form) {
    var theMonth = form.chooseMonth.selectedIndex
    var theYear = parseInt(form.chooseYear.options[form.chooseYear.selectedIndex].text)
    // initialize date-dependent variables
    var firstDay = getFirstDay(theYear, theMonth)
    var howMany = getMonthLen(theYear, theMonth)
    
    // fill in month/year in table header
    getObject("tableHeader").innerHTML = theMonths[theMonth] + 
    " " + theYear
    
    // initialize vars for table creation
    var dayCounter = 1
    var TBody = getObject("tableBody")
    // clear any existing rows
    while (TBody.rows.length > 0) {
        TBody.deleteRow(0)
    }
    var newR, newC
    var done=false
    while (!done) {
        // create new row at end
        newR = TBody.insertRow(TBody.rows.length)
        for (var i = 0; i < 7; i++) {
            // create new cell at end of row
            newC = newR.insertCell(newR.cells.length)
            if (TBody.rows.length == 1 && i < firstDay) {
                // no content for boxes before first day
                newC.innerHTML = ""    
                continue
            }
            if (dayCounter == howMany) {
                // no more rows after this one
                done = true
            }
            // plug in date (or empty for boxes after last day)
            newC.innerHTML = (dayCounter <= howMany) ? 
                dayCounter++ : ""
        }
        
    }
}

/*******************
  INITIALIZATIONS
********************/
// create dynamic list of year choices
function fillYears() {
    var today = new Date()
    var thisYear = today.getFullYear()
    var yearChooser = document.dateChooser.chooseYear
    for (i = thisYear; i < thisYear + 5; i++) {
        yearChooser.options[yearChooser.options.length] = new Option(i, i)
    }
    setCurrMonth(today)
}
// set month choice to current month
function setCurrMonth(today) {
    document.dateChooser.chooseMonth.selectedIndex = today.getMonth()
}
</SCRIPT>
</HEAD>

<BODY onLoad="fillYears(); populateTable(document.dateChooser)">
<H1>Month at a Glance (Dynamic HTML)</H1>
<HR>
<TABLE ID="calendarTable" BORDER=1 ALIGN="center">
<TR>
    <TH ID="tableHeader" COLSPAN=7></TH>
</TR>
<TR><TH>Sun</TH><TH>Mon</TH><TH>Tue</TH><TH>Wed</TH>
<TH>Thu</TH><TH>Fri</TH><TH>Sat</TH></TR>
<TBODY ID="tableBody"></TBODY>
<TR>
    <TD COLSPAN=7>
    <P>
    <FORM NAME="dateChooser">
        <SELECT NAME="chooseMonth" 
        onChange="populateTable(this.form)">
            <OPTION SELECTED>January<OPTION>February
            <OPTION>March<OPTION>April<OPTION>May
            <OPTION>June<OPTION>July<OPTION>August
            <OPTION>September<OPTION>October
            <OPTION>November<OPTION>December
    </SELECT>
    <SELECT NAME="chooseYear" onChange="populateTable(this.form)">
    </SELECT>
    </FORM>
    </P></TD>
</TR>
</TABLE>
</BODY>
</HTML>