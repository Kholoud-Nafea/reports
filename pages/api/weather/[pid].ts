import { NextApiRequest, NextApiResponse } from 'next'
import { Weather } from '../../../db/models';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { pid } = req.query;

    // handling getting entries
    if (req.method === 'GET') {
      const weather = await Weather.findAll({
        where: { projectId: pid }
      });
      res.status(200).json({data: weather})    

    // handling updating entries
    }else if(req.method === "PUT"){
      await Weather.bulkCreate(
        [ ...req.body.bulkData ],
        {updateOnDuplicate: ["minDegree", "maxDegree", "status"]}
      );
      //res.status(200).json({data});
      res.status(200).json({msg: "updated successfully"});

    // handling deleting entries
    }else if(req.method === "DELETE"){
      await Weather.destroy({
        where: { projectId: pid }
      });
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
