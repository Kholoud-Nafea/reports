import { useEffect, useState } from 'react';
import { useRouter } from 'next/router'

import { useProjects } from '../../../context/projects';
import Layout from '../../../components/Layout'
import Table from '../../../components/DataSheet/'
import { tableField } from '../../../interfaces';
import { ProjectsAttributes } from '../../../db/types';

const Project = () => {

  const router = useRouter();
  const {
    projects, getProjects, fetchProjectData, deleteData, updateData
  } = useProjects();

  const [project, setProject] = useState<ProjectsAttributes | undefined>(undefined);
  const { id }  = router.query;

  const [data, setData] = useState<tableField[]>([
    [{value: "", name: "name", type: "string", readOnly: false, edited: false}],
    [{value: "", name: "officialName", type: "string", readOnly: false, edited: false}],
    [{value: "", name: "contractorName", type: "string", readOnly: false, edited: false}],
    [{value: "", name: "ownerName", type: "string", readOnly: false, edited: false}],
    [{value: "", name: "advisorName", type: "string", readOnly: false, edited: false}],
    [{value: "", name: "location", type: "string", readOnly: false, edited: false}],
    [{value: "", name: "contractValue", type: "number", readOnly: false, edited: false}],
    [{value: "", name: "beneficiariesCount", type: "number", readOnly: false, edited: false}],
    [{value: "", name: "originalPeriod", type: "number", readOnly: false, edited: false}],
    [{value: "", name: "modifiedPeriod", type: "number", readOnly: false, edited: false}],
    [{value: "", name: "expirationDate", type: "Date", readOnly: false, edited: false}],
    [{value: "", name: "currentExpirationDate", type: "Date", readOnly: false, edited: false}]
  ]);

  const fieldsNames = [
    "اسم المشروع (المختصر)",
    "اسم المشروع (الرسمي)",
    "اسم المقاول",
    "المالك والمشغل",
    "اسم الاستشارى",
    "الموقع (الحي - المدينة - المحافظة)",
    "قيمة العقد (بالريال السعودي)",
    "تقدير عدد المستفيدين",
    "فترة التنفيذ الأصلية بالأشهر",
    "فترة التنفيذ بعد التعديل بالأشهر",
    "تاريخ استلام الموقع",
    "التاريخ المخطط حالياً للانتهاء"
  ];

  useEffect(() => {
    if(projects.length){
      setProject(projects.find(p => p.id === +id));
      fetchProjectData(+id);
    }
    else getProjects();
  }, [projects, id]);

  useEffect(() => {
    if(project){
      let p : any = project;
      // set Fields values
      setData((ps: any) => ps.map(
        (i: any) => (i.map(
          (x: any) => {
            console.log(typeof p[x.name])
            return x.type === "Date" ?
              {...x, value: p[x.name].substring(0,10)} :
              {...x, value: p[x.name]}
          }
        ))
      ))
    }
  }, [project]);

  const save = async () => {
    const obj : any = {};
    data.map((p: any) => {
      p[0].edited && (obj[p[0].name] = p[0].value)
    })
    console.log(obj);
    await updateData("projects", +id, obj);
    if(obj.currentExpirationDate) router.reload();
  }

  const deleteProject = async () => {
    await deleteData("projects", +id);
    router.push('/')
  }

  return(
    <Layout title="وكالة المياه" id={id!}>

      <Table
        fields={data} fieldsNames={fieldsNames}
        setValues={setData}
        columns={null} headers={null}
      />
      <div className="d-flex justify-content-end mt-3 mb-1">
        <button className="btn btn-danger mb-3 mx-2 w-25" onClick={deleteProject}>حذف</button>
        <button className="btn btn-success mb-3 w-25" onClick={save}>تعديل</button>
      </div>

    </Layout>
  )
}

export default Project;
