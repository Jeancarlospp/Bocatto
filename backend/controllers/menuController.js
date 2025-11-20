import Menu from '../models/Menu.js';

export const getAllMenu = async (req, res) => {
  try {
    const items = await Menu.find();
    res.json({ success: true, count: items.length, data: items });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
