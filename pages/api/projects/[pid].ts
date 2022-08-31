import { NextApiRequest, NextApiResponse } from 'next'
import { Projects } from '../../../db/models';
import {extendProjectTime, shrinkProjectTime} from './editProjectTimeline';


function convertDateToUTC(date: Date) { 
  return new Date(date.setDate(date.getDate()+1))
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const {pid} = req.query;

    // handling getting entries
    if (req.method === 'GET') {
      const project = await Projects.findOne({
        where: { id: pid }
      });
      res.status(200).json({project})    

    // handling updating entries
    }else if(req.method === "PUT"){
      // if the end date has changed
      let currentEndDate = req.body.data.currentExpirationDate;
      if(currentEndDate){
        // get current startDate, endDate
        const {startDate, currentExpirationDate} = await Projects.findOne({
          where: { id: pid }
        }) || {};
        if(!startDate || !currentExpirationDate) throw "Project does not exist!";
        // compare old endDate with current endDate
        if(new Date(currentEndDate) > new Date(currentExpirationDate)) {
          // if bigger we will popoulate more rows in all other depending tables
          console.log("Should extend tables")
          await extendProjectTime(+pid, `${currentExpirationDate}`, currentEndDate)
        }else{
          // if smaller we will remove rows from all other depending tables
          console.log("Should shrink tables")
          await shrinkProjectTime(+pid, convertDateToUTC(new Date(currentEndDate)))
        }
      }
      await Projects.update(
        { ...req.body.data }, { where: { id: pid } }
      )
      res.status(200).json({ msg: "updated successfully" });

    // handling deleting entries
    }else if(req.method === "DELETE"){
      await Projects.destroy({where: { id: pid }});    
      res.status(200).json({msg: "deleted successfully"});
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
