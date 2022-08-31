import React, {createContext, useReducer, useContext} from 'react';

import ProjectsReducer from './Reducer';
import {
  ProjectsAttributes, WorkersAttributes,
  TermsAttributes, DiariesAttributes, TermlyAttributes, MonthlyAttributes, WeatherAttributes
} from '../../db/types';

type ContextType = {
  projects: ProjectsAttributes[];
  workers: WorkersAttributes[];
  terms: TermsAttributes[];
  diaries: DiariesAttributes[];
  termly: TermlyAttributes[];
  monthly: MonthlyAttributes[];
  weather: WeatherAttributes[];
  currentMonth: string;
  error: boolean | unknown;
  isLoading: boolean;
  success: boolean;
  getProjects: () => void;
  createProject: (project: ProjectsAttributes) => Promise<boolean | number>;
  createTerms : (id: number, bulkData: any[], startDate: Date, endDate: Date) => void;
  deleteData: (apiName: "projects" , id: number) => void;
  updateData: (
    apiName: "monthly" | "projects", id: number, data: MonthlyAttributes | ProjectsAttributes
  ) => void;
  updateBulkData: (
    apiName: "workers" | "terms" | "termly" | "diaries" | "weather", 
    id: number, bulkData: any[], fields: string[]
  ) => void;
  fetchProjectData: (id: number) => void;
  setCurrentMonth: (month: string) => void;
  setTheRightMonth: (id: number) => void;
  setError: (error: string | {}) => void;
};

interface State<T> {
  isLoading: boolean;
  success: boolean;
  error: boolean | unknown;
  projects: ProjectsAttributes[];
  workers: WorkersAttributes[];
  terms: TermsAttributes[];
  diaries: DiariesAttributes[];
  termly: TermlyAttributes[];
  monthly: MonthlyAttributes[];
  weather: WeatherAttributes[];
  currentMonth: string;
  data: T;
}

export const ProjectsContext = createContext<ContextType | undefined>(undefined);

type Props = { children: React.ReactNode; };

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const ProjectsProvider = ({ children }: Props) => {

  const initialState: State<unknown> = {
    isLoading: false,
    success: false,
    error: false,
    projects: [],
    workers: [],
    terms: [],
    diaries: [],
    termly: [],
    monthly: [],
    weather: [],
    currentMonth: `${new Date().getFullYear()}-${new Date().getMonth()}`,
    data: {}
  }

  const MainReducer = ProjectsReducer<unknown>();
  const [state, dispatch] = useReducer(MainReducer, initialState);

  function getDay(date: Date) : string{
    return `${date.getFullYear()}-${date.getUTCMonth()+1}-${date.getDate()}`;
  }

  function getDaysArray(start: Date, end: Date, id: number) {
    let arr : {projectId: number, workDay: string}[] = [];
    // the following line adds a day to the end to fix -1 day result
    end.setDate(end.getDate()+1) 
    for(
      start; 
      end >= start; 
      start.setDate(start.getDate()+1)
    ){
      arr.push({projectId: id, workDay: getDay(start)})
    }
    return arr;
  };

  async function fetchProjectData(id: number){
    try {
      dispatch({type: "PENDING"})
      let sessionId: string | null = sessionStorage.getItem("projectId"); 
      let cMonth: string | null = sessionStorage.getItem("cMonth"); 
      if(sessionId && +sessionId === id)  
        (cMonth) ? setCurrentMonth(cMonth) : setTheRightMonth(id)
      let workersData : {data: WorkersAttributes[]} = {data: []}; 
      let termsData : {data: TermsAttributes[]} = {data: []}; 
      let termlyData : {data: TermlyAttributes[]} = {data: []}; 
      let diariesData : {data: DiariesAttributes[]} = {data: []} ;
      let monthlyData : {data: MonthlyAttributes[]} = {data: []} ;
      let weatherData : {data: WeatherAttributes[]} = {data: []} ;
      let [workers, terms, termly, monthly, diaries, weather] = await Promise.all([
        fetch(`/api/workers/${id}`),
        fetch(`/api/terms/${id}`),
        fetch(`/api/termly/${id}`),
        fetch(`/api/monthly/${id}`),
        fetch(`/api/diaries/${id}`),
        fetch(`/api/weather/${id}`)
      ]);
      if(!workers.ok || !terms.ok || !termly.ok || !monthly.ok || !diaries.ok || !weather.ok) 
        throw new Error("Bad Request");
      [workersData, termsData, termlyData, monthlyData, diariesData, weatherData] = 
        await Promise.all([
          workers.json(), terms.json(), termly.json(), monthly.json(), diaries.json(), weather.json()
        ]);
      dispatch({ 
        type: 'SET_DATA', 
        workersData, termsData, termlyData, monthlyData, diariesData, weatherData 
      });
      dispatch({type: "SUCCESS"})
    }catch(err){ 
      dispatch({type: 'FAIL', payload: err}) 
    }
  }

  async function deleteData(apiName: "projects" , id: number){
    try {
      dispatch({type: "PENDING"})
      const res = await fetch(`/api/${apiName}/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if(!res.ok) throw new Error(res.statusText)
      await res.json();
      dispatch({ type: 'DELETE_DATA', id, apiName });
      dispatch({type: "SUCCESS"})
    }catch(err){ 
      dispatch({type: 'FAIL', payload: err}) 
    }
  }

  async function updateData(
    apiName: "monthly" | "projects", id: number, data: MonthlyAttributes | ProjectsAttributes
  ){
    try {
      dispatch({type: "PENDING"})
      const res = await fetch(`/api/${apiName}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data })
      });
      if(!res.ok) throw new Error(res.statusText)
      await res.json();
      await dispatch({ type: 'UPDATE_DATA', id: data.id!, apiName, data });
      dispatch({type: "SUCCESS"})
    }catch(err){ 
      dispatch({type: 'FAIL', payload: err}) 
    }
  }

  async function updateBulkData(
    apiName: "workers" | "terms" | "termly" | "diaries" | "weather", 
    id: number, bulkData: any[], fields: string[] = []
  ){
    try {
      dispatch({type: "PENDING"})
      const res = await fetch(`/api/${apiName}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bulkData, fields: [...fields] })
      });
      if(!res.ok) throw new Error(res.statusText)
      const data = await res.json();
      dispatch({ type: 'UPDATE_BULK_DATA', id, apiName, data: data.msg ? {data: bulkData} : data });
      dispatch({type: "SUCCESS"})
    }catch(err){ 
      dispatch({type: 'FAIL', payload: err}) 
    }
  }

  async function createTerms(id: number, bulkData: any[], startDate: Date, endDate: Date){
    try {
      dispatch({type: "PENDING"})
      const res = await fetch(`/api/terms/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bulkData, startDate, endDate })
      });
      if(!res.ok) throw new Error(res.statusText)
      const {terms, termly} = await res.json();
      dispatch({ type: 'SET_TERMS', id, terms, termly });
      dispatch({type: "SUCCESS"})

    }catch(err){ 
      dispatch({type: 'FAIL', payload: err}) 
    }
  }

  async function getProjects(){
    try {
      dispatch({type: "PENDING"})
      const res = await fetch(`/api/projects`)
      if(!res.ok) throw new Error(res.statusText)
      const data : ProjectsAttributes[] = await res.json();
      dispatch({ type: 'SET_PROJECTS', payload: data });
      dispatch({type: "SUCCESS"})
    }catch(err){ 
      dispatch({type: 'FAIL', payload: err}) 
    }
  }

  async function createProject(project: ProjectsAttributes){
    try {
      dispatch({type: "PENDING"})
      const res = await fetch(`/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...project })
      })
      if(!res.ok) throw new Error(res.statusText)
      const data : {data: ProjectsAttributes} = await res.json();
      // generate array of days to populate Daily tables
      let bulkData = getDaysArray(
        new Date(data.data.startDate), 
        new Date(data.data.currentExpirationDate!), 
        data.data.id!
      );
      await Promise.all([
        fetch(`/api/workers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bulkData })
        }),
        fetch(`/api/diaries`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bulkData })
        }),
        fetch(`/api/weather`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bulkData })
        })
      ])
      dispatch({ type: 'ADD_PROJECT', payload: data.data });
      dispatch({type: "SUCCESS"})
      return +data.data.id!;
    }catch(err){ 
      dispatch({type: 'FAIL', payload: err}) 
      return false;
    }
  }

  async function setError(error: string | {}){
    await dispatch({type: 'FAIL', payload: error}) 
    dispatch({type: 'FAIL', payload: false}) 
  }

  function setCurrentMonth(month: string){
    dispatch({type: 'SET_CURRENT_MONTH', payload: month}) 
  }

  //setting the correct date if the project is in the present, past or future
  function setTheRightMonth(id: number){
    const {startDate, currentExpirationDate} = state.projects.find(p => p.id === id)!;
    const start = new Date(startDate)
    const end = new Date(currentExpirationDate!)
    let lastMonth = (new Date(new Date().setDate(0)));
    if(lastMonth < start) lastMonth = start; 
    if(lastMonth > end) lastMonth = end; 
    dispatch({
      type: 'SET_CURRENT_MONTH',
      payload: `${lastMonth.getFullYear()}-${lastMonth.getMonth()+1}`
    });
  }

  return (
    <ProjectsContext.Provider value={{ 
      projects: state.projects,
      workers: state.workers,
      terms: state.terms,
      diaries: state.diaries,
      termly: state.termly,
      monthly: state.monthly,
      weather: state.weather,
      currentMonth: state.currentMonth,
      error: state.error,
      isLoading: state.isLoading,
      success: state.success,
      getProjects, createProject, createTerms, fetchProjectData, 
      updateData, updateBulkData, deleteData, setError, 
      setCurrentMonth, setTheRightMonth
    }}>
      {children}
    </ProjectsContext.Provider>
  );
};


export function useProjects() {
  const context = useContext(ProjectsContext);
  if (!context) throw new Error("You need to wrap ProjectsProvider.");
  return context;
}

export default ProjectsProvider;