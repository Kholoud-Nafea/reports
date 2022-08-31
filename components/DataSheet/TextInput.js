import { useEffect, useRef } from "react"

const TextInput = ({value, onKeyDown, onChange}) => {
  const inputRef = useRef();

  useEffect(() => {
    inputRef.current.focus();
  }, [])  

  function handleChange (e) {
    onChange(e.target.value)
  }

  return (
    <input
      ref={inputRef}
      type='text'
      className='data-editor'
      value={value}
      onChange={handleChange}
      onKeyDown={onKeyDown}
    />
  )
}

export default TextInput;