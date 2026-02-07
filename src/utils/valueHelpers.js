// Função para normalizar valores: strings vazias viram NULL
export function normalizeValue(value) {
    if (value === '' || value === null || value === undefined) {
        return null;
    }
    return value;
}

// Função para normalizar valores numéricos: strings vazias ou inválidas viram NULL
export function normalizeNumeric(value) {
    if (value === '' || value === null || value === undefined) {
        return null;
    }
    // Se for string, tenta converter para número
    if (typeof value === 'string') {
        const num = parseFloat(value);
        return isNaN(num) ? null : num;
    }
    return value;
}

// Função para ordenar arrays de objetos alfabeticamente por uma propriedade específica
export function sortAlphabetically(array, property) {
    if (!Array.isArray(array)) {
        return array;
    }
    // Criar uma cópia do array para não mutar o original
    return [...array].sort((a, b) => {
        const valueA = a[property]?.toLowerCase() || '';
        const valueB = b[property]?.toLowerCase() || '';
        return valueA.localeCompare(valueB);
    });
}

