import { verifyToken } from '../utils/jwt.js';

export function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ erro: 'Token não fornecido' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ erro: 'Token inválido' });
    }

    const decoded = verifyToken(token);
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (err) {
    return res.status(401).json({ erro: 'Token inválido ou expirado' });
  }
}
