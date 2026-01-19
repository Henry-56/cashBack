/**
 * Masks a user name for privacy, showing full first name and initials of last names.
 * Example: "ANDERSHON SAUL RUIZ LANDEO" -> "ANDERSHON R. L."
 * Example: "Henry Chavez" -> "Henry C."
 * Example: "Maria Garcia Lopez" -> "Maria G. L."
 */
export function maskName(name: string): string {
    if (!name) return 'Usuario';

    const parts = name.trim().split(/\s+/);

    if (parts.length === 1) {
        // Single name: show it fully
        return parts[0];
    }

    if (parts.length === 2) {
        // First name + one last name: show first name + initial
        return `${parts[0]} ${parts[1].charAt(0).toUpperCase()}.`;
    }

    // Multiple names: First name + initials of last two parts (assumed to be apellidos)
    // "ANDERSHON SAUL RUIZ LANDEO" -> parts[0]=first, assume last 2 are apellidos
    const firstName = parts[0];
    const apellido1Initial = parts[parts.length - 2].charAt(0).toUpperCase();
    const apellido2Initial = parts[parts.length - 1].charAt(0).toUpperCase();

    return `${firstName} ${apellido1Initial}. ${apellido2Initial}.`;
}

/**
 * Masks a phone number, showing only last 4 digits.
 * Example: "970400015" -> "****0015"
 */
export function maskPhone(phone: string): string {
    if (!phone || phone.length < 4) return phone;
    return '****' + phone.slice(-4);
}
