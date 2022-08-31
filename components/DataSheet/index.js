import {useState, useEffect} from 'react';
import ReactDataSheet from 'react-datasheet';

import { useProjects } from '../../context/projects';
import TextInput from './TextInput';
import DateInput from './DateInput';
import SelectInput from './SelectInput';

const Table = ({fields, setValues, fieldsNames, columns, headers}) => {

  const { setError } = useProjects();

  const validValue = (val, type) => {
    if(val === "") return "";
    // check value type
    switch(type){
      case "string":
        return (typeof val === type && !Number(val)) ? val : false;
      case "number":
        return Number(val) || +val === 0 ? +val : false;
      case "Date":
      case "select":
        return val;
      default:
        return false;
    }
  }

  const onCellsChange = (changes) => {
    changes.forEach(({ cell, row, col, value }) => {
      ////console.log({ cell, row, col, value });
      setValues(ps => ps.map((r, rIndex) => {
        if(rIndex === row){
          return r.map((c, cIndex) => {
            let val = validValue(value, cell.type);
            if(!val && val !== "") setError({table: "لقد أدخلت قيمة خاطئة"})
            //if(val === true) val = "";
            //console.log({val}, cIndex, col)
            if(cIndex === col && (val || val === 0 || val === "")){
              //console.log({...c, value: val, edited: true})
              return {...c, value: val, edited: true};
            }
            return c;
          })
        }
        return r;
      }))
    });
  }

  return(<>
    <ReactDataSheet
      data={fields}
      valueRenderer={(cell) => cell.value}
      onCellsChanged={onCellsChange}
      sheetRenderer={props => (
        <table className="styled-table" dir="rtl" lang="ar">
          {headers && headers}
          {columns && <thead className='table-header'>
            <tr>
              {columns.map((col, index) => (<th key={index}>{col}</th>))}
            </tr>
          </thead>}
          <tbody className='table-body'>
              {props.children}
          </tbody>
        </table>
      )}
      rowRenderer={props => (
        <tr>
          {fieldsNames &&
            <td className="field" key={`f-${props.row}`}>{fieldsNames[props.row]}</td>
          }
          {props.children}
        </tr>
      )}
      dataEditor={props => {
        return (props.cell.type === "Date" && props.col === 0) ?
        <DateInput {...props} oldVal={new Date()} /> :
        props.cell.type === "select" ?
        <SelectInput {...props}/> :
        <TextInput {...props}/>
      }}
    />
    <style jsx>{`

.styled-table {
  table-layout: fixed;
  // border-collapse: collapse;
  margin: auto;
  font-size: 0.9em;
  font-family: sans-serif;
  width: 100%;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
  border-radius: 5px;

}

.styled-table thead tr {
  background-color: #1eb05d;
  color: #ffffff;
  text-align: left;
}

.styled-table th{
  text-align: center;
  background-color: #1eb05d;

}

.styled-table th,
.styled-table td {
  padding: 12px 15px;
  border-left: 1px solid #dddddd;
}

.styled-table tbody tr {
  height: 30px;
  border-bottom: 1px solid #dddddd;
}

.styled-table tbody tr:nth-of-type(even) {
  background-color: #f3f3f3;
}

.styled-table tbody tr:last-of-type {
  border-bottom: 2px solid #1eb05d;
}

.styled-table tbody tr.active-row {
  font-weight: bold;
  color: #red;
}

    `}</style>
  </>);
}
export default Table;
