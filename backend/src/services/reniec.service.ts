import axios from 'axios';

export interface ReniecData {
    first_name: string;
    first_last_name: string;
    second_last_name: string;
    full_name: string;
    document_number: string;
}

export class ReniecService {
    private readonly baseUrl = 'https://api.decolecta.com/v1/reniec/dni';
    private readonly token = process.env.DECOLECTA_TOKEN;

    async validateDni(dni: string): Promise<ReniecData> {
        if (!this.token) {
            throw new Error('DECOLECTA_TOKEN no configurado en el servidor');
        }

        try {
            const response = await axios.get(`${this.baseUrl}?numero=${dni}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data;
        } catch (error: any) {
            if (error.response && error.response.status === 404) {
                throw new Error('DNI no encontrado en RENIEC');
            }
            throw new Error('Error al validar DNI con RENIEC: ' + error.message);
        }
    }

    private mockResponse(dni: string): ReniecData {
        return {
            first_name: "USUARIO",
            first_last_name: "PRUEBA",
            second_last_name: "DECOLECTA",
            full_name: "USUARIO PRUEBA DECOLECTA",
            document_number: dni
        };
    }
}
