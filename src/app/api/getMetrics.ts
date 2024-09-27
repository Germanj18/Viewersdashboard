import { NextApiRequest, NextApiResponse } from 'next';
import pool from '../db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { date } = req.query;

    try {
      const client = await pool.connect();
      const result = await client.query(
        'SELECT * FROM metrics WHERE created_date = $1',
        [date]
      );
      client.release();
      res.status(200).json(result.rows);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener los datos' });
    }
  } else {
    res.status(405).json({ message: 'Método no permitido' });
  }
}