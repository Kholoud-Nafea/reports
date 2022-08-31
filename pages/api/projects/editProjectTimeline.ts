import { Sequelize, Op, fn, col, LogicType } from "sequelize";
import { Workers, Diaries, Weather, Termly, Monthly, Terms } from '../../../db/models';

function getDay(date: Date) : string{
  return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
}

function getEndDay(date: Date) : string{
  date.setDate(date.getDate()+1)
  return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
}

function getMonthsArray(
  start: Date, end: Date, projectId: number
){
  let arr : {projectId: number, month: string}[] = [];
  // the following line fixes issues with date insertion .
  start.setDate(2);
  start.setMonth(start.getMonth()+1);
  end.setDate(3);
  //console.log(start, end, end >= start)
  for(
    start; 
    end >= start; 
    start.setMonth(start.getMonth()+1)
  ){
    let month = getDay(start);
    arr.push({projectId, month})
  }
  return arr;
};

function getDaysArray(start: Date, end: Date, id: number) {
  let arr : {projectId: number, workDay: string}[] = [];
  // the following line adds a day to the end to fix -1 day result
  start.setDate(start.getDate()+1)
  end.setDate(end.getDate()+1) 
  for(
    start; 
    end >= start; 
    start.setDate(start.getDate()+1)
  ){
    arr.push({projectId: id, workDay: getDay(start)})
  }
  return arr;
};

export const extendProjectTime = async (
  projectId: number, start: string, end: string
) => {
  let startMonth = new Date(start);
  let endMonth = new Date(getEndDay(new Date(end)));
  //console.log({start, end});
  const termsData = await Terms.findAll({ where: {projectId}});
  let dailyData : any = getDaysArray(new Date(start), new Date(end), projectId);
  //console.log({startMonth, endMonth});
  let monthlyData : any = getMonthsArray(startMonth, endMonth, projectId);
  let termlyData : any[] = [];
  termsData.map((d:any) => {
    monthlyData.map((b: {month: string, projectId: number}) => {
      termlyData.push(
        {...b, termId: d.id, type: "planned"},
        {...b, termId: d.id, type: "achieved"},
        {...b, termId: d.id, type: "certified"}
      ) 
    })
  })

  //console.dir(dailyData, {depth: null})
  //console.dir(termlyData, {depth: null})
  //console.dir(monthlyData, {depth: null})

  await Workers.bulkCreate([ ...dailyData ]);
  await Diaries.bulkCreate([ ...dailyData ]);
  await Weather.bulkCreate([ ...dailyData ]);
  await Termly.bulkCreate([ ...termlyData ]);
  await Monthly.bulkCreate([ ...monthlyData ]);

}

export const shrinkProjectTime = async (projectId: number, currentExpirationDate: Date) => {

  let previousMonth = new Date(currentExpirationDate);
  previousMonth.setUTCDate(1);
  previousMonth.setUTCMonth(previousMonth.getUTCMonth()+1);
  //console.log({currentExpirationDate, previousMonth})
  //const [a, b, c, d, e] = await Promise.all([
  await Promise.all([
    Weather.destroy({where: {
      projectId,
      [Op.and]: [Sequelize.where(fn('date', col('workDay')), '>=', currentExpirationDate as LogicType)]
    }}),
    Workers.destroy({where: {
      projectId,
      [Op.and]: [Sequelize.where(fn('date', col('workDay')), '>=', currentExpirationDate as LogicType)]
    }}),
    Diaries.destroy({where: {
      projectId,
      [Op.and]: [Sequelize.where(fn('date', col('workDay')), '>=', currentExpirationDate as LogicType)]
    }}),
    Termly.destroy({where: {
      projectId,
      [Op.and]: [Sequelize.where(fn('date', col('month')), '>', new Date(previousMonth) as LogicType)]
    }}),
    Monthly.destroy({where: {
      projectId,
      [Op.and]: [Sequelize.where(fn('date', col('month')), '>', new Date(previousMonth) as LogicType)]
    }})
  ])
  //console.log(a, d)
}