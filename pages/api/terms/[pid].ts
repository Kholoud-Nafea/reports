import { NextApiRequest, NextApiResponse } from 'next'
import { Terms } from '../../../db/models';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { pid } = req.query;

    // handling getting entries
    if (req.method === 'GET') {
      const terms = await Terms.findAll({
        where: { projectId: pid }
      });
      res.status(200).json({data: terms})    

    // handling updating entries
    }else if(req.method === "PUT"){
      console.log(req.body)
      await Terms.bulkCreate([
        ...req.body.bulkData
      ], {updateOnDuplicate: ["value", "percentage", "name"]});
      //console.log(data);
      const terms = await Terms.findAll({where: { projectId: pid }});
      //console.log(terms);
      res.status(200).json({data: terms});

    // handling deleting entries
    }else if(req.method === "DELETE"){
      await Terms.destroy({
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
