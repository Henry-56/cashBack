import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { ReniecService } from '../services/reniec.service';
import { cleanError } from '../utils/error.utils';

const authService = new AuthService();
const reniecService = new ReniecService();

export const validateDni = async (req: Request, res: Response) => {
    try {
        const { dni } = req.query;
        if (!dni || typeof dni !== 'string') {
            return res.status(400).json({ error: 'DNI es requerido' });
        }
        const result = await reniecService.validateDni(dni);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ error: cleanError(error) });
    }
};

export const register = async (req: Request, res: Response) => {
    try {
        const result = await authService.register(req.body);
        res.status(201).json(result);
    } catch (error: any) {
        res.status(400).json({ error: cleanError(error) });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const result = await authService.login(req.body);
        res.json(result);
    } catch (error: any) {
        res.status(401).json({ error: cleanError(error) });
    }
};
