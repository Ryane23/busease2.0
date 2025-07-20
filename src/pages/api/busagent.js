import dbConnect from '../../lib/dbConnect';
import BusAgent from '../../models/BusAgent';

export default async function handler(req, res) {
  await dbConnect();
  if (req.method === 'GET') {
    const agents = await BusAgent.find();
    return res.status(200).json(agents);
  }
  if (req.method === 'POST') {
    const agent = await BusAgent.create(req.body);
    return res.status(201).json(agent);
  }
  if (req.method === 'PUT') {
    const { id, ...update } = req.body;
    const agent = await BusAgent.findByIdAndUpdate(id, update, { new: true });
    return res.status(200).json(agent);
  }
  if (req.method === 'DELETE') {
    const { id } = req.body;
    await BusAgent.findByIdAndDelete(id);
    return res.status(204).end();
  }
  res.status(405).end();
}
