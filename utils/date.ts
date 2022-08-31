const months = [
  "يناير",
  "فبراير",
  "مارس",
  "ابريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

function getDay(date: Date) : {value: string, name: string} {
  console.log(date)
  return {
    value: `${date.getFullYear()}-${date.getMonth()+1}`,
    name: `${date.getFullYear()} - ${months[date.getMonth()]}`
  }
}

export function getMonthsArray(start: Date, end: Date) {
  let arr : {value: string, name: string}[] = [];
  // the following line fixes issues with date insertion .
  start.setDate(1); end.setDate(1);
  for(
    start; 
    end >= start; 
    start.setMonth(start.getMonth()+1)
  ){
    let month = getDay(start);
    arr.push(month)
  }
  return arr;
};