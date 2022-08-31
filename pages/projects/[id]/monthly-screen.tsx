import { useEffect, useState } from 'react';
import { useRouter } from 'next/router'

import { useProjects } from '../../../context/projects';
import Layout from '../../../components/Layout'
import Table from '../../../components/DataSheet/'
import MonthsDropDown from '../../../components/MonthsDropDown';
import { MonthlyAttributes, ProjectsAttributes } from '../../../db/types';

const Project = () => {

  const router = useRouter();
  const {
    projects, monthly, isLoading, currentMonth,
    setCurrentMonth, getProjects, fetchProjectData, updateData
  } = useProjects();

  const [project, setProject] = useState<ProjectsAttributes | undefined>(undefined);
  const { id }  = router.query;

  const [data, setData] = useState<any>([]);

  const fieldsNames = [
    "الحالة الراهنة للمشروع",
    "النسب التراكمية في بداية الشهر - المخطط",
    "النسب التراكمية في بداية الشهر - الإنجاز",
    "النسب التراكمية في بداية الشهر - المعتمد",
    "النسب التراكمية في نهاية الشهر -  المخطط",
    "النسب التراكمية في نهاية الشهر -  الإنجاز",
    "النسب التراكمية في نهاية الشهر -  المعتمد",
    "إجمالي قيمة الأعمال المنفذة التراكمي حتى بداية الشهر",
    "إجمالي قيمة الأعمال المنفذة التراكمي حتى نهاية الشهر",
    "إجمالي قيمة المستخلصات التي تم صرفها للمقاول حتى بداية الشهر",
    "إجمالي قيمة المستخلصات التي تم صرفها للمقاول حتى نهاية الشهر",
    "عدد طلبات اعتماد المواد التراكمي المقدمة حتى بداية الشهر",
    "عدد طلبات اعتماد المواد المقدمة خلال الشهر",
    "عدد طلبات اعتماد المواد التراكمي المقدمة حتى نهاية الشهر",
    "عدد طلبات اعتماد المواد التراكمي المعتمدة حتى بداية الشهر",
    "عدد طلبات اعتماد المواد المعتمدة خلال الشهر",
    "عدد طلبات اعتماد المواد التراكمي المعتمدة حتى نهاية الشهر",
    "الفترة المنقضية بالايام",
    "الفترة المتبقية بالايام",
    "الفترة الكلية بالايام",
    "نسبة الفترة المنقضية بالايام",
    "نسبة الفترة المتبقية بالايام",
    "معامل الانجازية"
  ];

  useEffect(() => {
    // get current project
    if(projects.length){
      setProject(projects.find(p => p.id === +id));
      fetchProjectData(+id);
    }
    else getProjects();
  }, [projects, id]);

  function getDaysDetails(a: Date, b: Date) {
    // a: startDate, b: endDate
    // Discard the time and time-zone information.
    const _MS_PER_DAY = 1000 * 60 * 60 * 24;
    // get the last day of the month
    const lastDay = (b.getMonth()+1 > +currentMonth.split("-")[1]) ? 0 : b.getDate();
    //c: return the date (with last day) of the current choosed month
    const c = new Date(+currentMonth.split("-")[0], +currentMonth.split("-")[1], lastDay);
    const utc1 = Date.UTC(a.getFullYear(), a.getUTCMonth(), a.getDate());
    const utc2 = Date.UTC(b.getFullYear(), b.getUTCMonth(), b.getDate());
    const utc3 = Date.UTC(c.getFullYear(), c.getUTCMonth(), c.getDate());

    const allDays =  Math.floor((utc2 - utc1) / _MS_PER_DAY);
    const elapsedDays =  c >= a ?
      c <= b ? Math.floor((utc3 - utc1) / _MS_PER_DAY) : allDays
      : 0

    const remainingDays =  c >= a ?
      c <= b ? Math.floor((utc2 - utc3) / _MS_PER_DAY) : 0
      : allDays

    const elapsedRatio =  ((elapsedDays / allDays) * 100).toFixed(1) + " %";
    const remainingRatio =  ((remainingDays / allDays) * 100).toFixed(1) + " %";

    return {
      elapsedDays, remainingDays, allDays,
      elapsedRatio, remainingRatio
    };
  }

  useEffect(() => {
    if(project && monthly.length){

      let month = +currentMonth.split("-")[1];
      let year = +currentMonth.split("-")[0];

      const {
        elapsedDays, remainingDays, allDays, elapsedRatio, remainingRatio
      } = getDaysDetails(new Date(project.startDate!), new Date(project.currentExpirationDate!))

      let accumulative = {requestedOrders: 0, certifiedOrders: 0}
      monthly
        .filter((m: MonthlyAttributes) => (
          month > new Date(m.month).getMonth()+1 &&
          year >= new Date(m.month).getFullYear()
        ))
        .map((m: MonthlyAttributes) => {
          accumulative.requestedOrders += m.requestedOrders! ;
          accumulative.certifiedOrders += m.certifiedOrders! ;
        })
      let previous : MonthlyAttributes = monthly
        .find((m: MonthlyAttributes) => (
          new Date(m.month).getMonth()+1 === month-1 &&
          year === new Date(m.month).getFullYear()
        ))!

      let current : MonthlyAttributes = monthly
        .find((m: MonthlyAttributes) => (
          new Date(m.month).getMonth()+1 === month &&
          year === new Date(m.month).getFullYear()
        ))!

      const achievementFactor = ((current.achievedRatios! / current.plannedRatios!)*100).toFixed(1);

      setData([
        [{value: current.status , name: "status", type: "select", id: current.id,
          options:["منتظم", "متأخر","متأخر جداً", "متوقف"], readOnly: false, edited: false}],
        [{value: previous?.plannedRatios || 0, name: "p-plannedRatios", type: "number", readOnly: true, edited: false}],
        [{value: previous?.achievedRatios || 0, name: "p-achievedRatios", type: "number", readOnly: true, edited: false}],
        [{value: previous?.certifiedRatios || 0, name: "p-certifiedRatios", type: "number", readOnly: true, edited: false}],
        [{value: current.plannedRatios , name: "plannedRatios", type: "number", readOnly: false, edited: false}],
        [{value: current.achievedRatios, name: "achievedRatios", type: "number", readOnly: false, edited: false}],
        [{value: current.certifiedRatios, name: "certifiedRatios", type: "number", readOnly: false, edited: false}],
        [{value: previous?.executedDeads || 0, name: "p-executedDeads", type: "number", readOnly: true, edited: false}],
        [{value: current.executedDeads, name: "executedDeads", type: "number", readOnly: false, edited: false}],
        [{value: previous?.paidToContractor || 0, name: "p-paidToContractor", type: "number", readOnly: true, edited: false}],
        [{value: current.paidToContractor, name: "paidToContractor", type: "number", readOnly: false, edited: false}],
        [{value: accumulative.requestedOrders, name: "p-requestedOrders", type: "number", readOnly: true, edited: false}],
        [{value: current.requestedOrders, name: "requestedOrders", type: "number", readOnly: false, edited: false}],
        [{value: accumulative.requestedOrders + current.requestedOrders!,
          name: "c-requestedOrders", type: "number", readOnly: true, edited: false}],
        [{value: accumulative.certifiedOrders, name: "p-certifiedOrders", type: "number", readOnly: true, edited: false}],
        [{value: current.certifiedOrders, name: "certifiedOrders", type: "number", readOnly: false, edited: false}],
        [{value: accumulative.certifiedOrders + current.certifiedOrders!,
          name: "c-certifiedOrders", type: "number", readOnly: true, edited: false}],
        [{value: elapsedDays, name: "elapsedDays", type: "number", readOnly: true, edited: false}],
        [{value: remainingDays, name: "remainingDays", type: "number", readOnly: true, edited: false}],
        [{value: allDays, name: "allDays", type: "number", readOnly: true, edited: false}],
        [{value: elapsedRatio, name: "elapsedRatio", type: "number", readOnly: true, edited: false}],
        [{value: remainingRatio, name: "remainingRatio", type: "number", readOnly: true, edited: false}],
        [{value: achievementFactor !== "NaN" ? achievementFactor : 0, name: "achievementFactor", type: "number", readOnly: true, edited: false}]
      ])
    }
  }, [project, monthly, currentMonth]);

  const save = async () => {
    const obj : any = {id: data[0][0].id};
    data.map((p: any) => ( p[0].edited && (obj[p[0].name] = p[0].value) ));
    //console.log(obj);
    await updateData("monthly", +id, obj);
    //router.push(`/projects/${id}`)
  }

  return(
    <Layout title="وكالة المياه" id={id!}>
      <MonthsDropDown
        project={project!} currentMonth={currentMonth}
        setCurrentMonth={setCurrentMonth} save={save} isLoading={isLoading}
      >
        <Table
          fields={data} fieldsNames={fieldsNames}
          setValues={setData}
          columns={null} headers={null}
        />
      </MonthsDropDown>
    </Layout>
  )
}

export default Project;
