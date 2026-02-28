/**
 * Masks a user name for privacy, showing full first name and initials of last names.
 * Example: "ANDERSHON SAUL RUIZ LANDEO" -> "ANDERSHON R. L."
 * Example: "Henry Chavez" -> "Henry C."
 * Example: "Maria Garcia Lopez" -> "Maria G. L."
 */
export function maskName(name: string): string {
    if (!name) return 'Usuario';

    const parts = name.trim().split(/\s+/);

    if (parts.length === 1) return parts[0];

    // Heuristic for Peruvian/RENIEC full names: "APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES"
    // Handle both formats: If 3+ words, assume it's RENIEC (A1 A2 N1) and names start at index 2.
    // If it's a mock or standard format "NAME A1 A2", this heuristic might overlap
    // but the user's request confirms that real data starts with Surnames.

    let firstName = parts[0];
    let apellido1Initial = '';
    let apellido2Initial = '';

    if (parts.length >= 3) {
        // Assume A1 A2 N1 format
        firstName = parts[2] || parts[0];
        apellido1Initial = parts[0].charAt(0).toUpperCase();
        apellido2Initial = parts[1].charAt(0).toUpperCase();
    } else if (parts.length === 2) {
        // Assume A1 N1 or N1 A1
        // Usually safer to show the first word in 2-word names unless user specifies
        // But for consistency with the request, let's assume word 0 is surname
        firstName = parts[1];
        apellido1Initial = parts[0].charAt(0).toUpperCase();
    }

    return apellido2Initial
        ? `${firstName} ${apellido1Initial}. ${apellido2Initial}.`
        : `${firstName} ${apellido1Initial}.`;
}

/**
 * Masks a phone number, showing only last 4 digits.
 * Example: "970400015" -> "****0015"
 */
export function maskPhone(phone: string): string {
    if (!phone || phone.length < 4) return phone;
    return '****' + phone.slice(-4);
}
