import { NextApiRequest, NextApiResponse } from 'next'
import { Termly } from '../../../db/models';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { pid } = req.query;

    // handling getting entries
    if (req.method === 'GET') {
      const termlyData = await Termly.findAll({
        where: { projectId: pid }
      });
      res.status(200).json({data: termlyData})    

    // handling updating entries
    }else if(req.method === "PUT"){
      console.log(req.body)
      await Termly.bulkCreate([
        ...req.body.bulkData
      ], {updateOnDuplicate: ["value"]});
      const termlyData = await Termly.findAll({where: { projectId: pid }});
      res.status(200).json({data: termlyData});

    // handling deleting entries
    }else if(req.method === "DELETE"){
      await Termly.destroy({
        where: { projectId: pid }
      });
      res.status(200).json({msg: "deleted successfully"});    
    
    }else{
      res.status(404).send("unknown request");    
    }

  // handling errors
  } catch (err) {
    console.error(err);
    res.status(500).json({ statusCode: 500, message: err.message })
  }
}

export default handler;
