/**
 * Extracted the first name from a full name string.
 * Handles both "First Last" and "Last1 Last2 First" (RENIEC) formats.
 */
export function extractFirstName(fullName: string | null | undefined): string {
    if (!fullName) return 'Usuario';

    const parts = fullName.trim().split(/\s+/);

    if (parts.length === 0) return 'Usuario';
    if (parts.length === 1) return parts[0];

    // Heuristic for Peruvian/RENIEC full names: "APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES"
    // If there are 3 or more words, the first name is usually the 3rd word.
    // Example: "ARROYO CANCHARI HENRY" -> "HENRY"
    // Example: "GARCIA LOPEZ JUAN PEDRO" -> "JUAN"
    if (parts.length >= 3) {
        return parts[2];
    }

    // Example: "ARROYO HENRY" -> "HENRY"
    if (parts.length === 2) {
        return parts[1];
    }

    return parts[0];
}
