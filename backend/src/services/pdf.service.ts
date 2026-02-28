import PDFDocument from 'pdfkit';
import { Buffer } from 'buffer';

export interface ContractData {
    borrowerName: string;
    borrowerDni: string;
    lenderName?: string;
    lenderDni?: string;
    amount: number;
    termWeeks: number;
    totalToPay: number;
    borrowerSignatureBase64: string; // Base64 string
    lenderSignatureBase64?: string; // Optional lender signature
}

export class PDFService {
    async generateLoanContract(data: ContractData): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50 });
            const chunks: any[] = [];

            doc.on('data', (chunk: any) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', (err: Error) => reject(err));

            // Header
            doc.fontSize(20).text('CONTRATO DE PRÉSTAMO DIGITAL', { align: 'center' });
            doc.moveDown();

            // Date
            const now = new Date();
            doc.fontSize(12).text(`Fecha: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`, { align: 'right' });
            doc.moveDown();

            // Parties
            doc.fontSize(14).text('PARTES CONTRATANTES:', { underline: true });
            doc.fontSize(12).text(`EL PRESTATARIO: ${data.borrowerName.toUpperCase()}, identificado con DNI N° ${data.borrowerDni}.`);
            doc.text(`EL PRESTAMISTA: Marketplace Cashback (o prestamista asignado tras financiamiento).`);
            doc.moveDown();

            // Terms
            doc.fontSize(14).text('CLÁUSULAS DEL PRÉSTAMO:', { underline: true });
            doc.fontSize(12).text(`1. MONTO SOLICITADO: S/. ${data.amount.toFixed(2)}`);
            doc.text(`2. PLAZO DE DEVOLUCIÓN: ${data.termWeeks} semana(s).`);
            doc.text(`3. MONTO TOTAL A DEVOLVER: S/. ${data.totalToPay.toFixed(2)}`);
            doc.moveDown();

            doc.text('Las partes declaran haber leído y aceptado los términos y condiciones del préstamo a través de la plataforma Cashback.');
            doc.moveDown(2);

            // Signature Section
            const startY = doc.y;
            const signatureWidth = 200;

            // Borrower Signature
            doc.fontSize(12).text('EL PRESTATARIO:', 50, startY, { underline: true });
            try {
                const bSigData = data.borrowerSignatureBase64.replace(/^data:image\/\w+;base64,/, "");
                const bSigBuffer = Buffer.from(bSigData, 'base64');
                doc.image(bSigBuffer, 50, startY + 20, { fit: [180, 80] as [number, number] });
            } catch (error) {
                doc.text("[Firma Digital Prestatario]", 50, startY + 40);
            }
            doc.fontSize(10).text(`${data.borrowerName.toUpperCase()}`, 50, startY + 110);
            doc.text(`DNI: ${data.borrowerDni}`, 50, startY + 125);

            // Lender Signature (if provided)
            if (data.lenderSignatureBase64) {
                doc.fontSize(12).text('EL PRESTAMISTA:', 320, startY, { underline: true });
                try {
                    const lSigData = data.lenderSignatureBase64.replace(/^data:image\/\w+;base64,/, "");
                    const lSigBuffer = Buffer.from(lSigData, 'base64');
                    doc.image(lSigBuffer, 320, startY + 20, { fit: [180, 80] as [number, number] });
                } catch (error) {
                    doc.text("[Firma Digital Prestamista]", 320, startY + 40);
                }
                if (data.lenderName) {
                    doc.fontSize(10).text(`${data.lenderName.toUpperCase()}`, 320, startY + 110);
                    doc.text(`DNI: ${data.lenderDni || 'N/A'}`, 320, startY + 125);
                }
            } else {
                doc.fontSize(12).text('EL PRESTAMISTA:', 320, startY, { underline: true });
                doc.fontSize(10).text('(Pendiente de firma)', 320, startY + 40);
            }

            doc.end();
        });
    }
}
