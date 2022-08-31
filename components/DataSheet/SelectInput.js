import { useEffect, useRef } from "react"

const SelectInput = ({value, onKeyDown, onChange, cell}) => {

  const inputRef = useRef();

  useEffect(() => {
    inputRef.current.focus();
    if(!value) onChange(cell.options[0]);
  }, [])  

  function handleChange (e) {
    onChange(e.target.value)
  }

  return (
    <select
      ref={inputRef}
      className='data-editor'
      value={value}
      onChange={handleChange}
      onKeyDown={onKeyDown}
    >
      {cell.options.length > 0 && cell.options.map((c, index) => 
        <option key={`${cell.id}-${index}`} value={c}>{c}</option>  
      )}
    </select>
  )
}

export default SelectInput;