export const cleanError = (error: any): string => {
    // Handle Zod Validation Errors
    if (error.name === "ZodError" && error.errors) {
        return error.errors.map((e: any) => {
            const path = e.path.join('.');
            return path ? `${path}: ${e.message}` : e.message;
        }).join(", ");
    }

    const message = error.message || "";

    // Specific business error mapping
    if (message.includes("duplicate key")) {
        if (message.includes("email")) return "El correo ya está registrado.";
        if (message.includes("document_number")) return "El DNI ya está registrado.";
        return "Ya existe un registro con estos datos.";
    }

    if (message.includes("violates foreign key constraint") || message.includes("not present in table")) {
        return "Tu sesión ha expirado o el recurso ya no existe. Por favor, cierra sesión y vuelve a entrar.";
    }

    // Auth specific
    if (message === "Invalid credentials") return "Credenciales inválidas. Verifica tu correo y contraseña.";

    // Database generic errors (Show briefly for debugging if in dev, but keep it clean)
    if (message.includes("Failed query") || message.includes("relation") || message.includes("column")) {
        console.error("DEBUG_DB_ERROR:", message);
        return "Error interno del servidor (Base de Datos). Por favor, intenta de nuevo más tarde.";
    }

    return message || "Ocurrió un error inesperado.";
};
