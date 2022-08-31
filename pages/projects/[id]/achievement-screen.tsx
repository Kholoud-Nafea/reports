import { useEffect, useState } from 'react';
import { useRouter } from 'next/router'

import { useProjects } from '../../../context/projects';
import Layout from '../../../components/Layout'
import Table from '../../../components/DataSheet'
import { DiariesAttributes } from '../../../db/types';
import MonthsDropDown from '../../../components/MonthsDropDown';

const AchievementScreen = () => {

  const router = useRouter();
  const {
    projects, diaries, isLoading, currentMonth,
    setCurrentMonth, getProjects, fetchProjectData, updateBulkData,
  } = useProjects();
  const { id }  = router.query;

  const [data, setData] = useState<any>([]);

  const [fieldsNames, setFieldsNames] = useState<string[]>([]);
  const columns = [
    "اليوم",
    "الإنجاز المخطط",
    "الإنجاز المتحقق",
    "الإنجاز المعتمد"
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
    if(diaries.length > 0){

      let month = +currentMonth.split("-")[1];
      let year = +currentMonth.split("-")[0];

      const filtered = diaries
        .filter((d: DiariesAttributes) => (
          new Date(d.workDay).getMonth()+1) === month &&
          year === new Date(d.workDay).getFullYear()
        );

      setFieldsNames([...filtered.map((d: DiariesAttributes) => getDate(new Date(d.workDay)))]);
      setData((_ps: any) => filtered.map(
        (d: DiariesAttributes) => ([
          {value: d.planned, name: "planned", type: "number", id: d.id, edited: false},
          {value: d.achieved, name: "achieved", type: "number", id: d.id, edited: false},
          {value: d.certified, name: "certified", type: "number", id: d.id, edited: false},
        ])
      ))
    }
  }, [diaries, currentMonth]);

  const save = async () => {
    const arr : any[] = [];
    data.forEach((p: any) => {
      const obj : any = {id: p[0].id, projectId: +id};
      let edited = false;
      p.map((i: any) => ((obj[i.name] = i.value) && (edited = edited || i.edited)));
      edited && arr.push(obj);
    })
    if(arr.length) {
      await updateBulkData("diaries", +id, arr, ["planned", "achieved", "certified"]);
    }
  }

  return(
    <Layout title="وكالة المياه" id={id!}>
      <MonthsDropDown
        project={projects.find(p => p.id === +id)!} currentMonth={currentMonth}
        setCurrentMonth={setCurrentMonth} save={save} isLoading={isLoading}
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

export default AchievementScreen;
