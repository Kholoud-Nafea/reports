import { NextApiRequest, NextApiResponse } from 'next'
import { Terms, Termly } from '../../../db/models';


function getDay(date: Date) : string{
  return `${date.getFullYear()}-${date.getUTCMonth()+1}-${date.getDate()}`;
}

function getMonthsArray(start: Date, end: Date) : {month: string}[] {
  let arr : {month: string, type: string}[] = [];
  // the following line adds a day to the end to fix -1 day result
  end.setMonth(end.getMonth()+1) 
  for(
    start; 
    end >= start; 
    start.setMonth(start.getMonth()+1)
  ){
    let month = getDay(start);
    arr.push(
      {month, type: "planned"},
      {month, type: "achieved"},
      {month, type: "certified"}
    )
  }
  return arr;
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {

    // handling new entries
    if (req.method === 'POST') {

      const {bulkData, startDate, endDate} = req.body;
      await Terms.destroy({where: {projectId: bulkData[0].projectId}});
      await Termly.destroy({where: {projectId: bulkData[0].projectId}});
      const termsData = await Terms.bulkCreate([...bulkData]);

      const months = getMonthsArray(new Date(startDate), new Date(endDate));
      let arr : any[] = [];
      termsData.map((d:any) => {
        arr =  [...arr, ...months.map((b: {month: string}) => ({
          ...b, projectId: d.projectId, termId: d.id
        }))]
      })

      const termlyData = await Termly.bulkCreate([...arr]);
      res.status(201).json({terms: termsData, termly: termlyData});    
    
    }else{
      res.status(404).send("unknown request");    
    }

  // handling errors
  } catch (err) {
    console.error(err)
    res.status(500).json({ statusCode: 500, message: err.message })
  }
}

export default handler;
