import dbConnect from '@/lib/dbConnect';
import Bus from '@/models/Bus';

export async function GET(req) {
  await dbConnect();
  try {
    const buses = await Bus.find();
    return Response.json(buses);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}