import { useEffect, useState } from 'react';
import { useRouter } from 'next/router'

import { useProjects } from '../../../context/projects';
import Layout from '../../../components/Layout'
import Table from '../../../components/DataSheet'
import MonthsDropDown from '../../../components/MonthsDropDown';
import { WeatherAttributes } from '../../../db/types';

const Weather = () => {

  const router = useRouter();
  const {
    projects, weather, isLoading, currentMonth,
    setCurrentMonth, getProjects, fetchProjectData, updateBulkData
  } = useProjects();
  const { id }  = router.query;

  const [data, setData] = useState<any>([]);

  const [fieldsNames, setFieldsNames] = useState<string[]>([]);
  const columns = [
    "اليوم",
    "درجة الحرارة الصغرى",
    "درجة الحرارة العظمى",
    "حالة الطقس"
  ];
  const Days = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]

  useEffect(() => {
    projects.length ? fetchProjectData(+id) : getProjects()
  }, [projects, id]);

  const getDate = (date: Date) : string => {
    return `${date.getDate()} - ${Days[date.getDay()]}`
  }

  useEffect(() => {
    //console.log(currentMonth);
    if(weather.length > 0){

      let month = +currentMonth.split("-")[1];
      let year = +currentMonth.split("-")[0];

      const filtered = weather
      .filter((w: WeatherAttributes) => (
        new Date(w.workDay).getMonth()+1) === month &&
        year === new Date(w.workDay).getFullYear()
      );

      setFieldsNames([...filtered.map((w: WeatherAttributes) => getDate(new Date(w.workDay)))]);
      setData((_ps: any) => filtered.map(
        (w: WeatherAttributes) => ([
          {value: w.minDegree, name: "minDegree", type: "number", id: w.id, edited: false},
          {value: w.maxDegree, name: "maxDegree", type: "number", id: w.id, edited: false},
          {
            value: w.status, name: "status", type: "select",
            options:[
              "مشمس"
              ,"غائم جزئيا"
              ,"غائم كليا"
              ,"أمطار خفيفة"
              ,"أمطار شديدة"
            ], id: w.id, edited: false
          }
        ])
      ))
    }
  }, [weather, currentMonth]);

  const save = async () => {
    const arr : any[] = [];
    data.forEach((p: any) => {
      const obj : any = {id: p[0].id, projectId: +id};
      let edited = false;
      p.map((i: any) => ((obj[i.name] = i.value) && (edited = edited || i.edited)));
      edited && arr.push(obj);
    })
    //console.log(arr);
    if(arr.length){
      await updateBulkData("weather", +id, arr, []);
    }
  }

  return(
    <Layout title="وكالة المياه" id={id!}>
      <MonthsDropDown
        project={projects.find(p => p.id === +id)!} currentMonth={currentMonth}
        setCurrentMonth={setCurrentMonth}
        save={save} isLoading={isLoading}
      >
        {fieldsNames.length > 0 &&
          <Table
          fields={data} fieldsNames={fieldsNames}
          setValues={setData}
          columns={columns} headers={null}
          />
        }
      </MonthsDropDown>
    </Layout>
  )
}

export default Weather;
