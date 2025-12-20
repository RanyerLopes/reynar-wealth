/**
 * Import Preview Modal
 * 
 * Modal component for reviewing and confirming imported transactions
 * before saving them to the database.
 */

import React, { useState, useMemo } from 'react';
import { X, Check, AlertTriangle, Trash2, Edit2, FileSpreadsheet, ArrowUpRight, ArrowDownRight, Sparkles, Loader2, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { Button } from './UI';
import { ParsedTransaction, ParseResult, CURRENCY_CONFIG } from '../services/statementParserService';
import { format } from 'date-fns';

interface ImportPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    parseResult: ParseResult;
    onConfirmImport: (transactions: ParsedTransaction[]) => Promise<void>;
    isLoading?: boolean;
    onCategorize?: (transactions: ParsedTransaction[]) => Promise<ParsedTransaction[]>;
}

const CATEGORY_OPTIONS = [
    'Alimentação',
    'Transporte',
    'Moradia',
    'Saúde',
    'Lazer',
    'Educação',
    'Vestuário',
    'Transferência',
    'Salário',
    'Investimentos',
    'Contas',
    'Compras',
    'Serviços',
    'Outros',
];

export const ImportPreviewModal: React.FC<ImportPreviewModalProps> = ({
    isOpen,
    onClose,
    parseResult,
    onConfirmImport,
    isLoading = false,
    onCategorize,
}) => {
    const [selectedIds, setSelectedIds] = useState<Set<number>>(
        new Set(parseResult.transactions.map((t, i) => t.confidence === 0 ? -1 : i).filter(i => i !== -1))
    );
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editedTransactions, setEditedTransactions] = useState<ParsedTransaction[]>(
        parseResult.transactions
    );
    const [isCategorizing, setIsCategorizing] = useState(false);
    const [isImporting, setIsImporting] = useState(false);

    // Currency config
    const currencyConfig = CURRENCY_CONFIG[parseResult.currency || 'BRL'] || CURRENCY_CONFIG.BRL;

    // Calculate totals
    const summary = useMemo(() => {
        const selected = editedTransactions.filter((_, i) => selectedIds.has(i));
        const income = selected.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const expense = selected.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

        // Count total duplicates in the ENTIRE list, regardless of selection
        const totalDuplicates = editedTransactions.filter(t => t.confidence === 0).length;

        return {
            total: selected.length,
            income,
            expense,
            duplicates: totalDuplicates, // Use total duplicates for the alert
        };
    }, [editedTransactions, selectedIds]);

    const toggleSelect = (index: number) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(index)) {
            newSelected.delete(index);
        } else {
            newSelected.add(index);
        }
        setSelectedIds(newSelected);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === editedTransactions.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(editedTransactions.map((_, i) => i)));
        }
    };

    const updateTransaction = (index: number, updates: Partial<ParsedTransaction>) => {
        setEditedTransactions(prev =>
            prev.map((t, i) => i === index ? { ...t, ...updates } : t)
        );
        setEditingId(null);
    };

    const handleCategorize = async () => {
        if (!onCategorize) return;

        setIsCategorizing(true);
        try {
            const categorized = await onCategorize(editedTransactions);
            setEditedTransactions(categorized);
        } catch (error) {
            console.error('Categorization failed:', error);
        } finally {
            setIsCategorizing(false);
        }
    };

    const handleConfirm = async () => {
        const selected = editedTransactions.filter((_, i) => selectedIds.has(i));
        if (selected.length === 0) return;

        setIsImporting(true);
        try {
            await onConfirmImport(selected);
        } finally {
            setIsImporting(false);
        }
    };

    const formatAmount = (amount: number, type: 'income' | 'expense') => {
        const formatted = amount.toLocaleString(currencyConfig.locale, {
            minimumFractionDigits: currencyConfig.decimalPlaces,
            maximumFractionDigits: currencyConfig.decimalPlaces,
        });
        return `${type === 'income' ? '+' : '-'} ${currencyConfig.symbol} ${formatted}`;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-surface w-full max-w-4xl max-h-[90vh] rounded-2xl border border-surfaceHighlight shadow-2xl animate-slide-up flex flex-col overflow-hidden">

                {/* Header */}
                <div className="p-6 border-b border-surfaceHighlight flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                            <FileSpreadsheet className="text-primary" size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Pré-visualização de Importação</h3>
                            <p className="text-sm text-textMuted">
                                {parseResult.bankName && <span className="text-primary">{parseResult.bankName}</span>}
                                {parseResult.bankName && ' • '}
                                {parseResult.transactions.length} transações encontradas
                                {parseResult.period && (
                                    <span className="text-textMuted">
                                        {' '} ({format(parseResult.period.start, 'dd/MM')} - {format(parseResult.period.end, 'dd/MM/yyyy')})
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-textMuted hover:text-white p-2">
                        <X size={20} />
                    </button>
                </div>

                {/* Warnings and Errors */}
                {(parseResult.errors.length > 0 || parseResult.warnings.length > 0) && (
                    <div className="px-6 py-3 border-b border-surfaceHighlight bg-surfaceHighlight/30 shrink-0">
                        {parseResult.errors.map((error, i) => (
                            <div key={`error-${i}`} className="flex items-center gap-2 text-danger text-sm mb-1">
                                <XCircle size={14} />
                                {error}
                            </div>
                        ))}
                        {parseResult.warnings.map((warning, i) => (
                            <div key={`warning-${i}`} className="flex items-center gap-2 text-amber-400 text-sm mb-1">
                                <AlertTriangle size={14} />
                                {warning}
                            </div>
                        ))}
                    </div>
                )}

                {/* Duplicates Alert */}
                {summary.duplicates > 0 && (
                    <div className="px-6 py-4 border-b border-surfaceHighlight bg-amber-500/10 shrink-0">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-amber-500/20 rounded-lg text-amber-500 shrink-0">
                                <AlertTriangle size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-amber-500 text-sm mb-1">Atenção: Transações Duplicadas</h4>
                                <p className="text-xs text-textMuted leading-relaxed">
                                    Detectamos <strong className="text-white">{summary.duplicates} transações</strong> que parecem já existir no seu histórico.
                                    Elas foram destacadas em amarelo e desmarcadas automaticamente para evitar duplicidade.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Summary Bar */}
                <div className="px-6 py-4 border-b border-surfaceHighlight bg-background/50 shrink-0">
                    <div className="flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="text-center px-4">
                                <p className="text-xs text-textMuted uppercase">Selecionadas</p>
                                <p className="text-xl font-bold text-white">{summary.total}</p>
                            </div>
                            <div className="w-px h-10 bg-surfaceHighlight"></div>
                            <div className="text-center px-4">
                                <p className="text-xs text-textMuted uppercase">Entradas</p>
                                <p className="text-lg font-bold text-secondary">
                                    {currencyConfig.symbol} {summary.income.toLocaleString(currencyConfig.locale)}
                                </p>
                            </div>
                            <div className="text-center px-4">
                                <p className="text-xs text-textMuted uppercase">Saídas</p>
                                <p className="text-lg font-bold text-danger">
                                    {currencyConfig.symbol} {summary.expense.toLocaleString(currencyConfig.locale)}
                                </p>
                            </div>
                            {summary.duplicates > 0 && (
                                <>
                                    <div className="w-px h-10 bg-surfaceHighlight"></div>
                                    <div className="text-center px-4">
                                        <p className="text-xs text-amber-400 uppercase">Duplicatas</p>
                                        <p className="text-lg font-bold text-amber-400">{summary.duplicates}</p>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex gap-2">
                            {onCategorize && (
                                <Button
                                    variant="secondary"
                                    className="!w-auto px-4"
                                    onClick={handleCategorize}
                                    isLoading={isCategorizing}
                                >
                                    <Sparkles size={16} />
                                    Categorizar com IA
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Transaction List */}
                <div className="flex-1 overflow-auto p-6">
                    {/* Select All Header */}
                    <div className="flex items-center gap-3 mb-4 pb-2 border-b border-surfaceHighlight sticky top-0 bg-surface z-10">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selectedIds.size === editedTransactions.length}
                                onChange={toggleSelectAll}
                                className="w-4 h-4 rounded border-surfaceHighlight bg-surfaceHighlight text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-textMuted">
                                {selectedIds.size === editedTransactions.length ? 'Desmarcar todas' : 'Selecionar todas'}
                            </span>
                        </label>
                    </div>

                    {/* Transaction Items */}
                    <div className="space-y-2">
                        {editedTransactions.map((tx, index) => (
                            <div
                                key={index}
                                className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${selectedIds.has(index)
                                    ? 'bg-surface border-surfaceHighlight'
                                    : 'bg-surfaceHighlight/30 border-transparent opacity-60'
                                    } ${tx.confidence === 0 ? 'border-amber-500/50' : ''}`}
                            >
                                {/* Checkbox */}
                                <input
                                    type="checkbox"
                                    checked={selectedIds.has(index)}
                                    onChange={() => toggleSelect(index)}
                                    className="w-4 h-4 rounded border-surfaceHighlight bg-surfaceHighlight text-primary focus:ring-primary shrink-0"
                                />

                                {/* Type Icon */}
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${tx.type === 'income'
                                    ? 'bg-secondary/10 text-secondary'
                                    : 'bg-surfaceHighlight text-textMuted'
                                    }`}>
                                    {tx.type === 'income' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                                </div>

                                {/* Description & Date */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium text-textMain truncate">
                                            {tx.description}
                                        </p>
                                        {tx.confidence === 0 && (
                                            <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full shrink-0">
                                                Duplicata?
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-textMuted">
                                        {format(tx.date, 'dd/MM/yyyy')}
                                        {tx.category && (
                                            <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-[10px]">
                                                {tx.category}
                                                {tx.confidence && tx.confidence > 0 && tx.confidence < 100 && (
                                                    <span className="ml-1 opacity-60">({tx.confidence}%)</span>
                                                )}
                                            </span>
                                        )}
                                    </p>
                                </div>

                                {/* Amount */}
                                <p className={`font-semibold shrink-0 ${tx.type === 'income' ? 'text-secondary' : 'text-textMain'
                                    }`}>
                                    {formatAmount(tx.amount, tx.type)}
                                </p>

                                {/* Category Edit */}
                                {editingId === index ? (
                                    <select
                                        value={tx.category || ''}
                                        onChange={(e) => updateTransaction(index, { category: e.target.value })}
                                        onBlur={() => setEditingId(null)}
                                        autoFocus
                                        className="bg-surfaceHighlight border border-primary rounded-lg px-2 py-1 text-sm text-textMain focus:outline-none"
                                    >
                                        <option value="">Selecionar...</option>
                                        {CATEGORY_OPTIONS.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <button
                                        onClick={() => setEditingId(index)}
                                        className="p-2 text-textMuted hover:text-white hover:bg-surfaceHighlight rounded-lg transition-colors shrink-0"
                                        title="Editar categoria"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                )}

                                {/* Remove */}
                                <button
                                    onClick={() => toggleSelect(index)}
                                    className={`p-2 rounded-lg transition-colors shrink-0 ${selectedIds.has(index)
                                        ? 'text-textMuted hover:text-danger hover:bg-danger/10'
                                        : 'text-danger'
                                        }`}
                                    title={selectedIds.has(index) ? 'Remover da importação' : 'Adicionar à importação'}
                                >
                                    {selectedIds.has(index) ? <Trash2 size={16} /> : <RefreshCw size={16} />}
                                </button>
                            </div>
                        ))}
                    </div>

                    {editedTransactions.length === 0 && (
                        <div className="text-center py-12 text-textMuted">
                            <FileSpreadsheet size={48} className="mx-auto mb-4 opacity-30" />
                            <p>Nenhuma transação encontrada no arquivo.</p>
                            <p className="text-sm mt-2">Verifique se o formato do arquivo está correto.</p>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-surfaceHighlight bg-background/50 shrink-0">
                    <div className="flex justify-between items-center gap-4">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 text-textMuted hover:text-white transition-colors"
                        >
                            Cancelar
                        </button>

                        <Button
                            onClick={handleConfirm}
                            disabled={summary.total === 0 || isImporting}
                            isLoading={isImporting}
                            className="!w-auto px-8"
                        >
                            <CheckCircle2 size={18} />
                            Importar {summary.total} {summary.total === 1 ? 'Transação' : 'Transações'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImportPreviewModal;
