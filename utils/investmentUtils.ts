export const INVESTMENT_COLORS: { [key: string]: string } = {
    'Ações': '#a78bfa',      // Violet-400
    'Cripto': '#f59e0b',     // Amber-500
    'Renda Fixa': '#34d399', // Green-400
    'FIIs': '#60a5fa',       // Blue-400
    'Outros': '#f472b6',     // Pink-400
    'Default': '#9ca3af'     // Zinc-400
};

export const getColorForInvestmentType = (type: string | undefined | null): string => {
    if (!type) return INVESTMENT_COLORS['Default'];
    const normalizedType = Object.keys(INVESTMENT_COLORS).find(key =>
        key.toLowerCase() === type.trim().toLowerCase()
    );
    return normalizedType ? INVESTMENT_COLORS[normalizedType] : INVESTMENT_COLORS['Default'];
};
