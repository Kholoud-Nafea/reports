import { NextApiRequest, NextApiResponse } from 'next'
import { Projects, Monthly } from '../../../db/models';
//import { MonthlyAttributes } from '../../../db/types';


function getDay(date: Date) : string{
  return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
}

function getMonthsArray(start: Date, end: Date) : {month: string}[] {
  let arr : {month: string}[] = [];
  // the following line fixes issues with date insertion .
  start.setDate(2); end.setDate(2);
  for(
    start; 
    end >= start; 
    start.setMonth(start.getMonth()+1)
  ){
    let month = getDay(start);
    arr.push({month})
  }
  return arr;
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {

    // handling new entries
    if (req.method === 'POST') {
      const { 
        name, officialName, contractorName, ownerName, advisorName, location,
        contractValue, beneficiariesCount, originalPeriod, modifiedPeriod,
        startDate, expirationDate, currentExpirationDate
      } = req.body;
      console.dir(req.body, {depth :null})
      const response = await Projects.create({
        name, officialName, contractorName, ownerName, advisorName, location,
        contractValue, beneficiariesCount, originalPeriod, modifiedPeriod,
        startDate, expirationDate, currentExpirationDate
      })
      console.log("created Id: ",response.id, startDate, currentExpirationDate)
      const months = getMonthsArray(new Date(startDate), new Date(currentExpirationDate));
      let arr : any[] =  [...months.map((b: {month: string}) => ({
        ...b, projectId: response.id!
      }))];
      console.log({arr})

      await Monthly.bulkCreate([...arr]);
      //console.log(monthly);
      res.status(201).json({data: response.dataValues});
    
      // handling getting entries
    }else if(req.method === 'GET'){
      const allProjects = await Projects.findAll();
      res.status(200).json(allProjects)
      
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
