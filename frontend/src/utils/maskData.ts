/**
 * Masks a user name for privacy, showing only first and last initials.
 * Example: "ANDERSHON SAUL RUIZ LANDEO" -> "A**** R****"
 * Example: "Henry Chavez" -> "H**** C****"
 */
export function maskName(name: string): string {
    if (!name) return 'Usuario';

    const parts = name.trim().split(/\s+/);

    if (parts.length === 1) {
        // Single name: show first letter + asterisks
        const first = parts[0];
        return first.charAt(0).toUpperCase() + '****';
    }

    // Multiple names: show first letter of first and last name
    const firstName = parts[0];
    const lastName = parts[parts.length - 1];

    return `${firstName.charAt(0).toUpperCase()}**** ${lastName.charAt(0).toUpperCase()}****`;
}

/**
 * Masks a phone number, showing only last 4 digits.
 * Example: "970400015" -> "****0015"
 */
export function maskPhone(phone: string): string {
    if (!phone || phone.length < 4) return phone;
    return '****' + phone.slice(-4);
}
