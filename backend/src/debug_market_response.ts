
import { LoanService } from './services/loan.service';

async function main() {
    const service = new LoanService();
    try {
        const loans = await service.getPendingLoans();
        console.log("Loans found:", JSON.stringify(loans, null, 2));
    } catch (error) {
        console.error("Error fetching loans:", error);
    }
    process.exit(0);
}

main();
