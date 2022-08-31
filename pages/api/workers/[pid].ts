import { NextApiRequest, NextApiResponse } from 'next'
import { Workers } from '../../../db/models';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { pid } = req.query;

    // handling getting entries
    if (req.method === 'GET') {
      const workers = await Workers.findAll({
        where: { projectId: pid }
      });
      res.status(200).json({data: workers})    

    // handling updating entries
    }else if(req.method === "PUT"){
      const data = await Workers.bulkCreate(
        [ ...req.body.bulkData ],
        {updateOnDuplicate: ["engineers", "observers", "trainedLabor", "labor"]}
      );
      res.status(200).json({data});

    // handling deleting entries
    }else if(req.method === "DELETE"){
      await Workers.destroy({
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
