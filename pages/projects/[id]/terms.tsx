import { useEffect, useState } from 'react';
import { useRouter } from 'next/router'

import { useProjects } from '../../../context/projects';
import Layout from '../../../components/Layout'
import Table from '../../../components/DataSheet'

import { ProjectsAttributes, TermsAttributes } from '../../../db/types';

const Terms = () => {

  const router = useRouter();
  const { id }  = router.query;
  const {
    projects, terms, isLoading,
    getProjects, fetchProjectData, createTerms,
  } = useProjects();

  const [data, setData] = useState<any>([]);
  const columns = [
    "البند",
    "الوزن من كامل المشروع %",
    "قيمة البند بالريال السعودي"
  ];

  useEffect(() => {
    projects.length ? fetchProjectData(+id) : getProjects();
  }, [projects, id]);


  useEffect(() => {
    if(terms.length > 0){
      setData([...terms.filter((t: TermsAttributes) => t.projectId === +id).map(
        (t: TermsAttributes) => ([
          {value: t.name, name: "name", type: "string", readOnly: true, edited: false},
          {value: t.percentage, name: "percentage", type: "number", readOnly: false, edited: false},
          {value: t.value, name: "value", type: "number", readOnly: false, edited: false}
        ])
      )])
    }else{ fetchProjectData(+id) }
  }, [terms, id]);

  const save = async () => {
    const bulkData : any[] = [];
    data.forEach((r: any) => {
      const obj : any = {projectId: +id};
      let notEmpty = true;
      let edited = true;
      r.map((c: any) => {
        edited = edited || c.edited
        notEmpty = notEmpty && (c.value || c.value === 0)
        obj[c.name] = c.value
      })
      if(notEmpty && edited) bulkData.push(obj);
    })
    const { startDate, currentExpirationDate } = projects.find((p: ProjectsAttributes) => p.id === +id)!
    if(bulkData.length){
      await createTerms(+id, bulkData, startDate, currentExpirationDate!);
    }
  }

  const addNewBand = () => {
    setData((ps:any) => ([
      ...ps,
      [
        {value:"", name: "name", type: "string", readOnly: false, edited: false},
        {value:"", name: "percentage", type: "number", readOnly: false, edited: false},
        {value:"", name: "value", type: "number", readOnly: false, edited: false}
      ]
    ]))
  }

  const goBack = () => router.push(`/projects/${id}`);

  return(
    <Layout title="وكالة المياه" id={id!}>
      <div className="container-fluid px-0">
        <div className="row no-gutters">
          <div className="col-12">

            <Table
              fields={data} fieldsNames={null}
              setValues={setData}
              columns={columns} headers={null}
            />

            <div className="d-flex justify-content-end mt-3 mb-1">
              <button className="btn btn-primary mb-3 mx-1 w-25" onClick={addNewBand}>
                أضافة بند جديد
              </button>
              <button className="btn btn-warning mx-2 mb-3 w-25" onClick={goBack}>رجوع</button>
              {!isLoading ?
              <button className="btn btn-success mb-3 w-25" onClick={save}>حفظ</button> :
              <button className="btn btn-success mb-3 w-25" type="button" disabled>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                {" "}Loading...
              </button>}

            </div>

          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Terms;
