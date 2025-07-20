import dbConnect from '../../lib/dbConnect';
import Notification from '../../models/Notification';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const notifications = await Notification.find().sort({ createdAt: -1 });
      return res.status(200).json(notifications);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  }

  if (req.method === 'POST') {
    try {
      // Handle both single notification and array of notifications
      const notificationData = req.body;
      
      if (Array.isArray(notificationData)) {
        // Create multiple notifications
        const notifications = await Notification.insertMany(notificationData);
        return res.status(201).json(notifications);
      } else {
        // Create single notification
        const notification = await Notification.create(notificationData);
        return res.status(201).json(notification);
      }
    } catch (error) {
      return res.status(500).json({ error: 'Failed to create notification' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.body;
      await Notification.findByIdAndDelete(id);
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ error: 'Failed to delete notification' });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
