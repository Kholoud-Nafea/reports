import { Diaries, Monthly, Projects, Termly, Terms, Weather, Workers } from '../../../db/models';
import {
  DiariesAttributes, MonthlyAttributes, TermlyAttributes, WeatherAttributes, WorkersAttributes
} from '../../../db/types';

function getDaysDetails(a: Date, b: Date, month: number, year: number) {
  // Discard the time and time-zone information.
  const _MS_PER_DAY = 1000 * 60 * 60 * 24;

  const lastDay = (b.getMonth()+1 > month) ? 0 : b.getDate();                  
  //c: return the date (with last day) of the current choosed month
  const c = new Date(year, month, lastDay);     
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

  const elapsedRatio =  ((elapsedDays / allDays) * 100).toFixed(1);
  const remainingRatio =  ((remainingDays / allDays) * 100).toFixed(1);

  return {
    elapsedDays, remainingDays, allDays, 
    elapsedRatio, remainingRatio
  };
}

export const GetChartsData = async(id: number, day: Date) => {
  try{
    const [project, terms, monthly, termly, workers, diaries, weather] = await Promise.all([
      Projects.findOne({ where: { id: id }}),
      Terms.findAll({ where: { projectId: id }}),
      Monthly.findAll({ where: { projectId: id }}),
      Termly.findAll({ where: { projectId: id }}),
      Workers.findAll({ where: { projectId: id }}),
      Diaries.findAll({ where: { projectId: id }}),
      Weather.findAll({ where: { projectId: id }})
    ])

    const colors = ["cyan", "lightblue", "yellow", "purple", "grey", "black"];
    const termsChart = terms.map((t, index) => {
      return {percentage: t.percentage, color: colors[index], name: t.name};
    })
    
    const month : number = day.getMonth()+1;  
    const year : number = day.getFullYear();

    // 4-1	 - الوقت المنقضي و الوقت المتبقى
    const {elapsedRatio, remainingRatio} = getDaysDetails(
      new Date(project?.startDate!), 
      new Date(project?.currentExpirationDate!),
      month, year
    );

    // Handling Diaries data
    const diariesData = diaries
    .filter((d: DiariesAttributes) => {
      return(
        new Date(d.workDay).getMonth()+1 === month &&
        new Date(d.workDay).getFullYear() === year 
      )
    })
    let workingDays = diariesData.length;
    let monthlyExecutedValues = 0;
    const executedValues : { name: string, data: number }[] = [];
    //diariesData.map(d => ({name: d.workDay.getDate(), data: [d.businessValue]}));
    const updatingStatus : { name: string, data?: string }[] = []; 
    const achievementStatus : { name: string, data?: number[] }[] = []; 
    //diariesData.map(d => ({name: d.workDay.getDate(), data: [d.updatingStatus]}));
    diariesData.map(d => {
      monthlyExecutedValues += d.businessValue!;
      executedValues.push({
        name: new Date(d.workDay).getDate().toString(), 
        data: d.businessValue || 0
      });
      updatingStatus.push({
        name: new Date(d.workDay).getDate().toString(), 
        data: d.updatingStatus
      });
      achievementStatus.push({
        name: new Date(d.workDay).getDate().toString(), 
        data: [d.certified!, d.achieved! - d.certified!, d.planned! - d.achieved!]
      });
    });
    const averageExecutedValues = +(monthlyExecutedValues / workingDays).toFixed(0);
    
    let totalExecutedValues = 0;
    diaries.filter((d: DiariesAttributes) => (
      new Date(d.workDay).getMonth()+1 <= month &&
      new Date(d.workDay).getFullYear() <= year
    )).map(d => (totalExecutedValues += d.businessValue!))

    // Handling Monthly Data
    let paidToContractor = 0;
    monthly.filter((m: MonthlyAttributes) => (
      new Date(m.month).getMonth()+1 <= month &&
      new Date(m.month).getFullYear() <= year 
    )).map(m => (paidToContractor += m.paidToContractor!))

    let pMonth : any = monthly        // previuos month data
      .find((m: MonthlyAttributes) => (
        new Date(m.month).getMonth()+1 === month-1 &&
        new Date(m.month).getFullYear() === year 
      )) || {plannedRatios: 0, achievedRatios: 0, certifiedRatios: 0}

    let cMonth : MonthlyAttributes = monthly    //current month data
      .find((m: MonthlyAttributes) => (
        new Date(m.month).getMonth()+1 === month &&
        new Date(m.month).getFullYear() === year 
      ))!

    const RatiosSection = [
      { name: "الإنجاز المخطط", data: [
          pMonth?.plannedRatios || 0, 
          cMonth.plannedRatios! - pMonth?.plannedRatios || 0,
        ] 
      },
      { name: "الإنجاز المحقق", data: [
          pMonth?.achievedRatios || 0, 
          cMonth.achievedRatios! - pMonth?.achievedRatios || 0,
        ] 
      },
      { name: "الإنجاز المعتمد", data: [
          pMonth?.certifiedRatios || 0, 
          cMonth.certifiedRatios! - pMonth?.certifiedRatios || 0,
        ] 
      },
    ]
  

    // Handling Termly data
    let current_month : any = {"planned": {}, "achieved": {}, "certified": {}};
    termly
    .filter((m: TermlyAttributes) => 
      new Date(m.month).getMonth()+1 === month &&
      new Date(m.month).getFullYear() === year 
    ).map((m : TermlyAttributes) => {
      current_month[m.type][m.termId] = m.value ;
    });
    const termsData = terms.map(t => (
      {name: t.name, data: [
        current_month["achieved"][t.id!],
        current_month["planned"][t.id!]
      ]}
    ))

    // Handling Workers data
    const workersAverage : any = {}
      workersAverage["مهندسين"] = 0;
      workersAverage["مراقبين"] = 0;
      workersAverage["عمالة مدربة"] = 0;
      workersAverage["عمالة عادية"] = 0;
    const workersData = workers
    .filter((w: WorkersAttributes) => (
      new Date(w.workDay).getMonth()+1) === month &&
      new Date(w.workDay).getFullYear() === year 
    ).map(w => {
      workersAverage["مهندسين"] += w.engineers;
      workersAverage["مراقبين"] += w.observers;
      workersAverage["عمالة مدربة"] += w.trainedLabor;
      workersAverage["عمالة عادية"] += w.labor;
      return {name: new Date(w.workDay).getDate().toString(), data: [
        w.engineers || 0, w.observers || 0, 
        w.trainedLabor || 0, w.labor || 0
      ]}
    });
    workersAverage["مهندسين"] = +(workersAverage["مهندسين"] / workingDays).toFixed(2) || 0;
    workersAverage["مراقبين"] = +(workersAverage["مراقبين"] / workingDays).toFixed(2) || 0;
    workersAverage["عمالة مدربة"] = +(workersAverage["عمالة مدربة"] / workingDays).toFixed(2) || 0;
    workersAverage["عمالة عادية"] = +(workersAverage["عمالة عادية"] / workingDays).toFixed(2) || 0;
    /*let totalWorkersAverage: number = 0
    for (let prop in workersAverage) {
        totalWorkersAverage += workersAverage[prop];
    }*/

    // Handling Weather data
    let weatherStatus : any = {
      "مشمس" : 0,
      "غائم جزئيا" : 0,
      "غائم كليا" : 0,
      "أمطار خفيفة" : 0,
      "أمطار شديدة" : 0
    };
    const weatherData = weather
    .filter((w: WeatherAttributes) => (
      new Date(w.workDay).getMonth()+1) === month &&
      new Date(w.workDay).getFullYear() === year 
    ).map(w => {
      weatherStatus[w.status!] += 1;
      return {name: new Date(w.workDay).getDate().toString(), data: [
        w.minDegree, w.maxDegree!
      ] as [number,number]}
    });


    console.log({termsChart, elapsedRatio, remainingRatio});
    console.dir(RatiosSection, {depth: null});
    console.log(cMonth.status)
    console.log(cMonth.plannedRatios, cMonth.achievedRatios, cMonth.certifiedRatios)
    console.dir(termsData, {depth: null})
    console.log({paidToContractor, totalExecutedValues})
    console.dir(achievementStatus, {depth: null});
    console.dir(workersData, {depth: null});
    //console.log({totalWorkersAverage})
    console.dir(workersAverage, {depth: null});
    console.log({averageExecutedValues, monthlyExecutedValues})
    console.dir(executedValues, {depth: null});
    console.dir(updatingStatus, {depth: null});
    console.dir(weatherData, {depth: null});
    console.dir(weatherStatus, {depth: null});

    return {
      project: project!,
      projectName: project!.officialName,
      projectStatus: cMonth.status,
      termsChart, // مكونات المشروع
      startDate: new Date(project!.startDate),
      plannedEndDate: new Date(project!.currentExpirationDate!),
      elapsedRatio, remainingRatio, // الوقت المنقضي - 
      RatiosSection, // 4-2	نسب الإنجاز التراكمي المتحقق مقارنة بالمخطط له
      plannedRatio: cMonth.plannedRatios!, // الإنجاز المخطط
      achievedRatio: cMonth.achievedRatios!, // نسبة الإنجاز المتحقق
      certifiedRatio: cMonth.certifiedRatios!, // الإنجاز المعتمد
      termsData, // 4-3	نسب الإنجاز على مستوى المجموعات الرئيسية
      projectCost: Math.round(project?.contractValue || 0), // تكلفة المشروع
      paidToContractor, // إجمالي المنصرف للمقاول
      totalExecutedValues, //  قيمة الأعمال المنفذة 
      achievementStatus, // 5-1	تطور نسب الإنجاز اليومي خلال الشهر
      //totalWorkersAverage, // المتوسط اليومي للعمالة
      workersAverage, // 5-3	المتوسط اليومي لأعداد عمالة المقاول المتواجدة بالموقع
      workersData, // 5-4	أعداد عمالة المقاول المتواجدة يومياً بالموقع
      averageExecutedValues, //  متوسط قيمة الأعمال المنفذة يومياً بالريال السعودي  
      monthlyExecutedValues, // إجمالي قيمة الأعمال المنفذة خلال الشهر بالريال السعودي 
      executedValues, // قيمة الاعمال المنفذة يوميا
      updatingStatus, // 5-6	التزام المقاول بتحديث البيانات اليومية
      weatherData, // 5-7	حالة الطقس خلال الشهر
      weatherStatus, // حالة الطقس خلال الشهر (العدد يمثل الأيام)
    };
  }catch(err){
    console.log(err)
    return false;
  }  
}
