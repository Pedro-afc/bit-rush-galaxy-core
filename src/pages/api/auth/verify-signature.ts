import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { address, signature, message } = req.body;

    if (!address || !signature || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // TODO: Implementar verificación real de firma TON
    // Por ahora, solo verificamos que la dirección esté en el mensaje
    if (!message.includes(address)) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Buscar o crear usuario
    let { data: user, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('telegram_id', address)
      .single();

    if (userError && userError.code !== 'PGRST116') {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      // Crear nuevo usuario
      const { data: newUser, error: createError } = await supabase
        .from('profiles')
        .insert({
          telegram_id: address,
          username: `User_${address.slice(-8)}`,
          referral_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
        })
        .select()
        .single();

      if (createError) {
        return res.status(500).json({ error: 'Failed to create user' });
      }

      user = newUser;
    }

    // Generar JWT token
    const token = jwt.sign(
      {
        sub: user.id,
        address: address,
        username: user.username,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({ token, user });
  } catch (error) {
    console.error('Signature verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 