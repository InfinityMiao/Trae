import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { unauthorized, forbidden } from '../utils/response';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    employee_no: string;
    employee_type: 'admin' | 'employee';
  };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json(unauthorized());
    return;
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as any;
    req.user = {
      id: decoded.id,
      employee_no: decoded.employee_no,
      employee_type: decoded.employee_type,
    };
    next();
  } catch (err) {
    res.status(401).json(unauthorized());
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    if (req.user?.employee_type !== 'admin') {
      res.status(403).json(forbidden('需要管理员权限'));
      return;
    }
    next();
  });
}

export function requireEmployee(req: AuthRequest, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    if (req.user?.employee_type !== 'employee') {
      res.status(403).json(forbidden('需要员工权限'));
      return;
    }
    next();
  });
}
