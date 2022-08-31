import { NextApiRequest, NextApiResponse } from 'next'
import { Weather } from '../../../db/models';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {

    // handling new entries
    if (req.method === 'POST') {
      //const { projectId, workDay} = req.body;
      console.dir(req.body.bulkData, {depth: null})
      await Weather.bulkCreate([ ...req.body.bulkData ]);
      //await Weather.create({projectId, workDay})
      res.status(201).json({msg: "created successfully"});    
    
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
