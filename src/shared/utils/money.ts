/**
 * Utility functions to handle monetary values safely in integer paise.
 * 1 Rupee = 100 Paise.
 * Storing money as integer paise prevents floating-point rounding errors.
 */

export function rupeesToPaise(rupees: number): number {
    return Math.round(rupees * 100);
}

export function paiseToRupees(paise: number): number {
    return paise / 100;
}
