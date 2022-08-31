import { useState, useEffect, ReactNode } from 'react';
import { ProjectsAttributes } from '../db/types';
import { getMonthsArray } from '../utils/date';
import { useRouter } from 'next/router'

type AppProps = {
  children?: ReactNode;
  isLoading?: boolean;
  project: ProjectsAttributes;
  currentMonth: string;
  viewBottomButtons?: boolean;
  setCurrentMonth: (date: string) => void;
  save: () => void
};

const MonthsDropDown = ({
  children, project, currentMonth, viewBottomButtons = true, setCurrentMonth, save, isLoading
} : AppProps) => {

  //console.log(currentMonth);

  const [months, setMonths] = useState<{value: string, name: string}[] | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    if(project){
      setMonths([...getMonthsArray(
        new Date(project.startDate!),
        new Date(project.currentExpirationDate!)
      )]);
    }
  }, [project])

  const goBack = () => router.push(`/projects/${project.id}`);

  return(
  <div className="container-fluid px-0 text-right mt-3 mt-md-0">
    <div className="row no-gutters">
      <div className="col-12 mx-auto">
        <select className="mb-2 w-25" style={{height: '40px'}} id='select'
          value={currentMonth} onChange={(e) => setCurrentMonth(e.target.value)}
        >
          {months && months.map((m, index) =>
            <option value={m.value} key={index}> {m.name} </option>
          )}
        </select>
        {children}
        {viewBottomButtons &&
          <div className="d-flex justify-content-end my-2">
            <button className="btn btn-warning mb-3 mx-2 w-25" onClick={goBack}>بيانات المشروع الرئيسية</button>
            {!isLoading ?
            <button className="btn btn-success mb-3 w-25" onClick={save}>حفظ</button> :
            <button className="btn btn-success mb-3 w-25" type="button" disabled>
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              {" "}Loading...
            </button>}
          </div>
        }
      </div>
    </div>
  </div>
  );

}

export default MonthsDropDown;
