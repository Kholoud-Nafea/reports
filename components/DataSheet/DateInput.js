import { useEffect, useState } from "react"
import DatePicker from 'react-datepicker';

const DateEditor = ({value, onChange, oldVal}) => {

  const [selectedDate, setSelectedDate] = useState(new Date());

  function handleChange (date) {
    setSelectedDate(date);
    onChange(date.toDateString())
  }

  return (
    <DatePicker className="form-control" 
      onChange={date => handleChange(date)}
      peekNextMonth showMonthDropdown showYearDropdown dropdownMode="select"
      name="project_date"
      selected={selectedDate}  
      placeholderText={oldVal}
    />  
  )
}

export default DateEditor;
