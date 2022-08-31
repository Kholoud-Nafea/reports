import { NextApiRequest, NextApiResponse } from 'next'
import { Monthly } from '../../../db/models';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { pid } = req.query;

    // handling getting entries
    if (req.method === 'GET') {
      const monthlyData = await Monthly.findAll({
        where: { projectId: pid }
      });
      res.status(200).json({data: monthlyData})    

    // handling updating entries
    }else if(req.method === "PUT"){
      const id = req.body.data.id;
      delete req.body.data.id;
      console.log(req.body.data)
      await Monthly.update(
        { ...req.body.data }, 
        { where: { id } }
      );
      res.status(200).json({msg: "updated successfully"});

    // handling deleting entries
    }else if(req.method === "DELETE"){
      await Monthly.destroy({
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
