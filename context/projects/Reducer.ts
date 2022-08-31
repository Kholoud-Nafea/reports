import {
  ProjectsAttributes, WorkersAttributes,
  TermsAttributes, DiariesAttributes, TermlyAttributes, MonthlyAttributes, WeatherAttributes
} from '../../db/types';

type Action<T> = 
  { type: 'PENDING' } | 
  { type: 'SUCCESS' } |
  { type: 'SET_PROJECTS'; payload: ProjectsAttributes[] } | 
  { type: 'ADD_PROJECT'; payload: ProjectsAttributes } | 
  { type: 'ADD_TERM'; payload: TermsAttributes } | 
  { type: 'SET_WORKERS'; payload: WorkersAttributes[] } | 
  { type: 'SET_DIARIES'; payload: DiariesAttributes[] } | 
  { 
    type: 'SET_DATA'; 
    workersData: {data: WorkersAttributes[]}; 
    termsData: {data: TermsAttributes[]};
    termlyData: {data: TermlyAttributes[]};
    monthlyData: {data: MonthlyAttributes[]};
    diariesData: {data: DiariesAttributes[]};
    weatherData: {data: WeatherAttributes[]};
  } |
  { 
    type: 'SET_TERMS'; 
    id: number; 
    terms: TermsAttributes[]; 
    termly: TermlyAttributes[];
  } |
  { type: 'DELETE_DATA'; id: number; apiName: "projects"; } | 
  { 
    type: 'UPDATE_DATA'; id: number; 
    apiName: "monthly" | "projects"; data: MonthlyAttributes | ProjectsAttributes
  } |  
  { 
    type: 'UPDATE_BULK_DATA'; 
    id: number;
    apiName: "workers" | "terms" | "termly" | "diaries" | "weather";
    data: {data: any}
  } | 
  { type: 'SET_CURRENT_MONTH', payload: string } |
  { type: 'FAIL', payload: unknown } |
  { type: 'SET_GENERIC_TYPE', payload: T };

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

const Reducer = <T>() => (state: State<T>, action: Action<T>): State<T> => {
  switch (action.type) {
    case 'PENDING':
      return {
        ...state,
        isLoading: true,
        error: false,
        success: false
      };
    case 'SUCCESS': 
      return {
        ...state,
        isLoading: false,
        success: false,
        error: false
      };
    case 'FAIL':
      console.error("Error: ", action.payload);
      return {
        ...state,
        isLoading: false,
        error: action.payload,
        success: false
      };
    case 'SET_CURRENT_MONTH': 
      sessionStorage.setItem("cMonth", action.payload)
      return {
        ...state,
        currentMonth: action.payload,
      };
    case 'SET_PROJECTS': 
      return {
        ...state,
        projects: [...action.payload],
      };
    case 'ADD_PROJECT': 
      return {
        ...state,
        projects: [...state.projects, action.payload]
      };
    case 'ADD_TERM': 
      return {
        ...state,
        success: true,
        terms: state.terms ? [...state.terms, action.payload] : []
      };    
    case 'SET_DATA': 
      return {
        ...state,
        workers: action.workersData.data.length ? [...action.workersData.data] : state.workers,
        terms: action.termsData.data.length ? [...action.termsData.data] : state.terms,
        termly: action.termlyData.data.length ? [...action.termlyData.data] : state.termly,
        monthly: action.monthlyData.data.length ? [...action.monthlyData.data] : state.monthly,
        diaries: action.diariesData.data.length ? [...action.diariesData.data] : state.diaries,
        weather: action.weatherData.data.length ? [...action.weatherData.data] : state.weather
      };
    case 'SET_TERMS': 
      return {
        ...state,
        success: true,
        terms: [...state.terms.filter(t => t.projectId !== action.id), ...action.terms],
        termly: [
          ...state.termly.filter(t => t.projectId !== action.id), 
          ...action.termly
        ]
      };
    case 'UPDATE_DATA': 
      let api = action.apiName;
      return {
        ...state,
        success: true,
        [api]: api === "monthly" ? 
          [...state.monthly.map((m: MonthlyAttributes) => {
            return m.id === action.id ? {...m, ...action.data} : m;
          })] 
        : api === "projects" ? 
          [...state.projects.map((m: ProjectsAttributes) => {
            return m.id === action.id ? {...m, ...action.data} : m;
          })]
        : [...state[action.apiName]]
      };
    case 'DELETE_DATA': 
      return {
        ...state,
        projects: state.projects.filter(p => p.id !== action.id)
      }
    case 'UPDATE_BULK_DATA': 
      let up_api = action.apiName;
      return {
        ...state,
        success: true,
        [up_api]: up_api === "terms" ? 
            [...action.data.data, ...state[up_api]
              .filter((t: TermsAttributes) => t.projectId !== action.id)]
          : up_api === "termly" ? 
            [...action.data.data, ...state[up_api]
              .filter((t: TermlyAttributes) => t.projectId !== action.id)]
          : up_api === "workers" ?
            [...state[up_api]
              .filter((w: WorkersAttributes) => w.projectId === action.id)
              .map((w: WorkersAttributes) => {
                let obj;
                action.data.data.forEach((r: any) => {
                  if(r.id === w.id) return obj = {...w, ...r}; 
                });
                return obj ? obj : w;
              })
            ]
          : up_api === "diaries" ? 
            [...state[up_api]
              .filter((d: DiariesAttributes) => d.projectId === action.id)
              .map((d: DiariesAttributes) => {
                let obj;
                action.data.data?.forEach((r: any) => {
                  if(r.id === d.id) return obj = {...d, ...r}; 
                });
                return obj ? obj : d;
              })
            ]
          : up_api === "weather" ? 
            [...state[up_api]
              .filter((d: WeatherAttributes) => d.projectId === action.id)
              .map((d: WeatherAttributes) => {
                let obj;
                action.data.data?.forEach((r: any) => {
                  if(r.id === d.id) return obj = {...d, ...r}; 
                });
                return obj ? obj : d;
              })
            ]
          : [...state[action.apiName]]
      }
    case 'SET_WORKERS': 
      return {
        ...state,
        success: true,
        workers: [...action.payload],
      };

    default:
      throw new Error('Action not supported');
  }
};
export default Reducer;