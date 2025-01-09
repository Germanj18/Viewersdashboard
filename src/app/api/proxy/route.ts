import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { service_id, count, link } = req.query;

  const response = await fetch(`https://top4smm.com/api.php?key=r6oPvhkIA5Pkbt4p&act=new_order&service_id=${service_id}&count=${count}&link=${link}`);
  const data = await response.json();

  res.status(200).json(data);
}