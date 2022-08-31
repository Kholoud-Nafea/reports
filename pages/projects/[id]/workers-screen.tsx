import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Table from '../../../components/DataSheet';
import Layout from '../../../components/Layout';
import MonthsDropDown from '../../../components/MonthsDropDown';
import { useProjects } from '../../../context/projects';
import { WorkersAttributes } from '../../../db/types';


const Workers = () => {

  const router = useRouter();
  const {
    projects, workers, isLoading, currentMonth,
    setCurrentMonth, getProjects, fetchProjectData, updateBulkData
  } = useProjects();
  const { id }  = router.query;

  const [data, setData] = useState<any>([]);

  const [fieldsNames, setFieldsNames] = useState<string[]>([]);
  const columns = [
    "اليوم",
    "عدد المهندسين",
    "عدد المراقبين",
    "عدد العمالة المدربة",
    "عدد العمالة العادية"
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
    if(workers.length > 0){

      let month = +currentMonth.split("-")[1];
      let year = +currentMonth.split("-")[0];

      const filtered = workers
      .filter((w: WorkersAttributes) => (
        new Date(w.workDay).getMonth()+1) === month &&
        year === new Date(w.workDay).getFullYear()
      );

      setFieldsNames([...filtered.map((w: WorkersAttributes) => getDate(new Date(w.workDay)))]);
      setData((_ps: any) => filtered.map(
        (w: WorkersAttributes) => ([
          {value: w.engineers, name: "engineers", type: "number", id: w.id, edited: false},
          {value: w.observers, name: "observers", type: "number", id: w.id, edited: false},
          {value: w.trainedLabor, name: "trainedLabor", type: "number", id: w.id, edited: false},
          {value: w.labor, name: "labor", type: "number", id: w.id, edited: false}
        ])
      ))
    }
  }, [workers, currentMonth]);

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
      await updateBulkData("workers", +id, arr, []);
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

export default Workers;
