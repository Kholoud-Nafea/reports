import { useEffect, useState } from 'react';
import { useRouter } from 'next/router'

import { useProjects } from '../../../context/projects';
import Layout from '../../../components/Layout'
import Table from '../../../components/DataSheet'
import MonthsDropDown from '../../../components/MonthsDropDown';

import { TermlyAttributes, TermsAttributes } from '../../../db/types';

const Terms = () => {

  const router = useRouter();
  const { id }  = router.query;
  const {
    termly, projects, terms, isLoading, currentMonth,
    setCurrentMonth, fetchProjectData, updateBulkData, getProjects
  } = useProjects();

  const [data, setData] = useState<any>([]);

  const headers =
    <thead>
      <tr>
        <th rowSpan={2}>البند</th>
        <th colSpan={2}>نسبة الإنجاز التراكمي المتحقق</th>
        <th colSpan={2}>نسبة الإنجاز التراكمي المخطط</th>
        <th colSpan={2}>نسبة الإنجاز التراكمي المعتمد</th>
      </tr>
      <tr>
        <th> في بداية الشهر</th>
        <th> في نهاية الشهر</th>
        <th> في بداية الشهر</th>
        <th> في نهاية الشهر</th>
        <th> في بداية الشهر</th>
        <th> في نهاية الشهر</th>
      </tr>
    </thead>

  useEffect(() => {
    projects.length ? fetchProjectData(+id) : getProjects()
  }, [projects, id]);

  useEffect(() => {

    //console.log(currentMonth);
    if(termly.length > 0 && terms.length > 0){

      let month = +currentMonth.split("-")[1];
      let year = +currentMonth.split("-")[0];

      let previous_month : any = {"planned": {}, "achieved": {}, "certified": {}};
      let current_month : any = {"planned": {}, "achieved": {}, "certified": {}};
      termly
        .filter((m: TermlyAttributes) => (
          new Date(m.month).getMonth()+1) === month-1 &&
          year === new Date(m.month).getFullYear()
        ).map((m : TermlyAttributes) => previous_month[m.type][m.termId] =  {val: m.value});

      termly
        .filter((m: TermlyAttributes) => (
          new Date(m.month).getMonth()+1) === month &&
          year === new Date(m.month).getFullYear()
        ).map((m : TermlyAttributes) => {
          current_month[m.type][m.termId] = {val :m.value, id: m.id} ;
        });

      //console.log(previous_month, current_month);

      setData([...terms.map(
        (t: TermsAttributes) => {
          //monthlyData.map()
          return [
            {value: t.name, name: "name", termId: t.id, type: "string", readOnly: true, edited: false},
            {value: previous_month["achieved"][t.id!]?.val || 0, name: "p-achieved", type: "number", readOnly: true, edited: false},
            {
              value: current_month["achieved"][t.id!]?.val,
              id: current_month["achieved"][t.id!]?.id,
              name: "achieved", type: "number", readOnly: false, edited: false
            },
            {value: previous_month["planned"][t.id!]?.val || 0, name: "p-planned", type: "number", readOnly: true, edited: false},
            {
              value: current_month["planned"][t.id!]?.val,
              id: current_month["planned"][t.id!]?.id,
              name: "planned", type: "number", readOnly: false, edited: false
            },
            {value: previous_month["certified"][t.id!]?.val || 0, name: "p-certified", type: "number", readOnly: true, edited: false},
            {
              value: current_month["certified"][t.id!]?.val,
              id: current_month["certified"][t.id!]?.id,
              name: "certified", type: "number", readOnly: false, edited: false
            }
          ]
        }
      )])
    }else{ fetchProjectData(+id) }
  }, [terms, termly, id, currentMonth]);

  const save = async () => {
    //console.log(data);
    const bulkData : any[] = [];
    data.forEach((r: any) => {
      r.map((c: any) => {
        if(c.edited) {
          bulkData.push({
            projectId: +id, termId: r[0].termId,
            id: c.id, value: c.value
          });
        }
      })
    })
    if(bulkData.length){
      await updateBulkData("termly", +id, bulkData, []);
    }
  }

  return(
    <Layout title="وكالة المياه" id={id!}>
      <MonthsDropDown
        project={projects.find(p => p.id === +id)!} currentMonth={currentMonth}
        setCurrentMonth={setCurrentMonth} save={save} isLoading={isLoading}
      >
        <Table
          fields={data} fieldsNames={null}
          setValues={setData}
          columns={null} headers={headers}
        />
      </MonthsDropDown>
    </Layout>
  )
}

export default Terms;
