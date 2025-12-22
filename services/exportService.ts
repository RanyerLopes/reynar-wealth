/**
 * Export Service
 * 
 * Handles exporting data to PDF, Excel, and backup files.
 */

import { Transaction, Bill, Investment, Goal } from '../types';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';

// ============================================================================
// PDF EXPORT
// ============================================================================

export const exportToPDF = async (
    transactions: Transaction[],
    title: string = 'Relatório Financeiro'
): Promise<void> => {
    // Dynamically import jsPDF to reduce bundle size
    const { jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(99, 102, 241); // Primary color
    doc.text('Reynar Wealth', 14, 20);

    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(title, 14, 30);

    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 38);

    // Summary
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expenses;

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Resumo:', 14, 50);

    doc.setFontSize(10);
    doc.setTextColor(34, 197, 94); // Green
    doc.text(`Receitas: R$ ${income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 14, 58);

    doc.setTextColor(239, 68, 68); // Red
    doc.text(`Despesas: R$ ${expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 14, 66);

    doc.setTextColor(balance >= 0 ? 34 : 239, balance >= 0 ? 197 : 68, balance >= 0 ? 94 : 68);
    doc.text(`Saldo: R$ ${balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 14, 74);

    // Transactions table
    const tableData = transactions.map(t => [
        format(new Date(t.date), 'dd/MM/yyyy'),
        t.description,
        t.category,
        t.type === 'income' ? 'Receita' : 'Despesa',
        `R$ ${t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    ]);

    autoTable(doc, {
        startY: 85,
        head: [['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241] },
        styles: { fontSize: 9 },
        columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 50 },
            2: { cellWidth: 35 },
            3: { cellWidth: 25 },
            4: { cellWidth: 30 }
        }
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
            `Página ${i} de ${pageCount}`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
        );
    }

    // Save
    doc.save(`reynar-relatorio-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};

// ============================================================================
// EXCEL EXPORT
// ============================================================================

export const exportToExcel = (
    transactions: Transaction[],
    filename: string = `reynar-transacoes-${format(new Date(), 'yyyy-MM-dd')}`
): void => {
    const data = transactions.map(t => ({
        'Data': format(new Date(t.date), 'dd/MM/yyyy'),
        'Descrição': t.description,
        'Categoria': t.category,
        'Tipo': t.type === 'income' ? 'Receita' : 'Despesa',
        'Valor': t.amount,
        'Cartão': t.cardId || '-',
        'Parcelamento': t.installmentTotal ? `${t.installmentCurrent}/${t.installmentTotal}` : '-'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transações');

    // Auto-size columns
    const colWidths = [
        { wch: 12 },  // Data
        { wch: 40 },  // Descrição
        { wch: 15 },  // Categoria
        { wch: 10 },  // Tipo
        { wch: 15 },  // Valor
        { wch: 15 },  // Cartão
        { wch: 12 },  // Parcelamento
    ];
    ws['!cols'] = colWidths;

    XLSX.writeFile(wb, `${filename}.xlsx`);
};

// ============================================================================
// FULL BACKUP EXPORT
// ============================================================================

export interface BackupData {
    exportDate: string;
    version: string;
    transactions: Transaction[];
    bills: Bill[];
    investments: Investment[];
    goals: Goal[];
    budgets: any[];
    settings: any;
}

export const exportBackup = (data: Partial<BackupData>): void => {
    const backup: BackupData = {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        transactions: data.transactions || [],
        bills: data.bills || [],
        investments: data.investments || [],
        goals: data.goals || [],
        budgets: data.budgets || [],
        settings: data.settings || {},
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `reynar-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// ============================================================================
// BILLS EXPORT
// ============================================================================

export const exportBillsToExcel = (bills: Bill[], filename?: string): void => {
    const data = bills.map(b => ({
        'Descrição': b.description,
        'Valor': b.amount,
        'Vencimento': format(new Date(b.dueDate), 'dd/MM/yyyy'),
        'Status': b.isPaid ? 'Pago' : 'Pendente',
        'Categoria': b.category,
        'Recorrente': b.isRecurrent ? 'Sim' : 'Não',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Contas');

    XLSX.writeFile(wb, filename || `reynar-contas-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
};

// ============================================================================
// INVESTMENTS EXPORT
// ============================================================================

export const exportInvestmentsToExcel = (investments: Investment[], filename?: string): void => {
    const data = investments.map(i => ({
        'Ativo': i.assetName,
        'Tipo': i.type,
        'Valor Investido': i.amountInvested,
        'Valor Atual': i.currentValue,
        'Rendimento (%)': i.performance.toFixed(2),
        'Lucro/Prejuízo': i.currentValue - i.amountInvested,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Investimentos');

    XLSX.writeFile(wb, filename || `reynar-investimentos-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
};
