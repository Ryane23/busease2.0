import dbConnect from '../../lib/dbConnect';
import BusDriver from '../../models/BusDriver';

export default async function handler(req, res) {
  await dbConnect();
  if (req.method === 'GET') {
    const drivers = await BusDriver.find();
    return res.status(200).json(drivers);
  }
  if (req.method === 'POST') {
    const driver = await BusDriver.create(req.body);
    return res.status(201).json(driver);
  }
  if (req.method === 'PUT') {
    const { id, ...update } = req.body;
    const driver = await BusDriver.findByIdAndUpdate(id, update, { new: true });
    return res.status(200).json(driver);
  }
  if (req.method === 'DELETE') {
    const { id } = req.body;
    await BusDriver.findByIdAndDelete(id);
    return res.status(204).end();
  }
  res.status(405).end();
}
