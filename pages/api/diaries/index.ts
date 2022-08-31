import { NextApiRequest, NextApiResponse } from 'next'
import { Diaries } from '../../../db/models';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {

    // handling new entries
    if (req.method === 'POST') {
      //const { projectId } = req.body;
      await Diaries.bulkCreate([ ...req.body.bulkData ]);
      //await Diaries.create({projectId})
      res.status(201).json({msg: "created successfully"});    

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
