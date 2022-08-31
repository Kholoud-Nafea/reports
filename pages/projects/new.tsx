import { useState } from 'react';
import { useRouter } from 'next/router'

import { useProjects } from '../../context/projects';
import Layout from '../../components/Layout'
import Table from '../../components/DataSheet/'
import { tableField } from '../../interfaces';

const Project = () => {

  const router = useRouter();
  const { createProject, setError, isLoading } = useProjects();

  const [data, setData] = useState<tableField[]>([
    [{value:  "", name: "name", type: "string", readOnly: false}],
    [{value:  "", name: "officialName", type: "string"}],
    [{value:  "", name: "contractorName", type: "string"}],
    [{value:  "", name: "ownerName", type: "string"}],
    [{value:  "", name: "advisorName", type: "string"}],
    [{value:  "", name: "location", type: "string"}],
    [{value:  "", name: "contractValue", type: "number"}],
    [{value:  "", name: "beneficiariesCount", type: "number"}],
    [{value:  "", name: "originalPeriod", type: "number"}],
    [{value:  "", name: "modifiedPeriod", type: "number"}],
    [{value:  "", name: "startDate", type: "Date"}],
    [{value:  "", name: "expirationDate", type: "Date"}],
    [{value:  "", name: "currentExpirationDate", type: "Date"}]
  ]);

  const save = async () => {
    const obj : any = {};
    let valid = true;
    data.map(p => {
      if(p[0].value === "") valid = false;
      obj[p[0].name] = p[0].value
    });
    //console.log(obj);
    if(valid){
      const res = await createProject(obj);
      if(res) router.push(`/projects/${res}`)
    }else{
      setError({table: "من فضلك أدخل بيانات المشروع كاملة"})
    }
  }

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
    "تاريخ ابتداء المشروع",
    "تاريخ استلام الموقع",
    "التاريخ المخطط حالياً للانتهاء"
  ];

  return(
    <Layout title="وكالة المياه" withMenu={false}>
      <Table
        fields={data} fieldsNames={fieldsNames}
        setValues={setData}
        columns={[]} headers={null}
      />
      <div className="d-flex justify-content-end mt-3 mb-1">
        {!isLoading ?
        <button className="btn btn-success mb-3 w-25" onClick={save}>انشاء</button> :
        <button className="btn btn-success mb-3 w-25" type="button" disabled>
          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          {" "}Loading...
        </button>}
      </div>
    </Layout>
  )
}

export default Project;
