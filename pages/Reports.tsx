
import React, { useState } from 'react';
import { FileText, Download, Share2, ShieldCheck, HeartPulse, GraduationCap, Building, Crown, Image, Calendar, Search, X, ZoomIn, FileCheck, CheckCircle, FileSpreadsheet, Database } from 'lucide-react';
import { Card, Button, Input, triggerCoinExplosion } from '../components/UI';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { AppRoutes } from '../types';
import { useTransactions, useInvestments, useBills, useGoals } from '../hooks/useDatabase';
import * as exportService from '../services/exportService';
import { useLanguage } from '../context/LanguageContext';

const Reports: React.FC = () => {
    const navigate = useNavigate();
    const { t, formatCurrency } = useLanguage();
    const [activeTab, setActiveTab] = useState<'tax' | 'archive' | 'export'>('tax');
    const [selectedYear, setSelectedYear] = useState('2024');
    const [isExporting, setIsExporting] = useState(false);
    const [isExportingPDF, setIsExportingPDF] = useState(false);
    const [isExportingExcel, setIsExportingExcel] = useState(false);
    const [isExportingBackup, setIsExportingBackup] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    // Image Viewer State
    const [viewImage, setViewImage] = useState<string | null>(null);

    // Get real data from database
    const { transactions } = useTransactions();
    const { investments } = useInvestments();
    const { bills } = useBills();
    const { goals } = useGoals();

    // Check User Plan
    const currentPlan = localStorage.getItem('reynar_plan') || 'basic';
    const isLocked = currentPlan === 'basic';

    // --- LOGIC FOR TAX REPORT ---
    const deductibleCategories = ['Saúde', 'Educação', 'Previdência', 'Dependentes'];
    const deductibleTransactions = transactions.filter(t =>
        t.type === 'expense' &&
        deductibleCategories.some(cat => t.category.toLowerCase().includes(cat.toLowerCase()))
    );
    const totalDeductible = deductibleTransactions.reduce((acc, t) => acc + t.amount, 0);
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const totalInvested = investments.reduce((acc, i) => acc + i.currentValue, 0);

    // --- LOGIC FOR DIGITAL ARCHIVE ---
    // Combine transactions with receipts AND bills with attachments
    const documents = [
        ...transactions.filter(t => t.receiptUrl).map(t => ({
            id: t.id,
            date: t.date,
            description: t.description,
            amount: t.amount,
            type: 'Transação',
            url: t.receiptUrl!,
            category: t.category
        })),
        ...bills.filter(b => b.attachmentUrl).map(b => ({
            id: b.id,
            date: b.dueDate,
            description: b.description,
            amount: b.amount,
            type: 'Conta/Boleto',
            url: b.attachmentUrl!,
            category: b.category
        }))
    ].sort((a, b) => b.date.getTime() - a.date.getTime()); // Newest first

    const filteredDocuments = documents.filter(doc =>
        doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Export Handlers
    const handleExportPDF = async () => {
        setIsExportingPDF(true);
        try {
            await exportService.exportToPDF(transactions, 'Relatório de Transações');
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (err) {
            console.error('Error exporting PDF:', err);
            alert('Erro ao gerar PDF. Tente novamente.');
        } finally {
            setIsExportingPDF(false);
        }
    };

    const handleExportExcel = () => {
        setIsExportingExcel(true);
        try {
            exportService.exportToExcel(transactions);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (err) {
            console.error('Error exporting Excel:', err);
            alert('Erro ao gerar Excel. Tente novamente.');
        } finally {
            setIsExportingExcel(false);
        }
    };

    const handleExportBackup = () => {
        setIsExportingBackup(true);
        try {
            const budgets = JSON.parse(localStorage.getItem('reynar_budgets') || '[]');
            exportService.exportBackup({
                transactions,
                bills,
                investments,
                goals,
                budgets,
            });
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (err) {
            console.error('Error exporting backup:', err);
            alert('Erro ao gerar backup. Tente novamente.');
        } finally {
            setIsExportingBackup(false);
        }
    };

    const handleExport = () => {
        setIsExporting(true);
        setTimeout(() => {
            setIsExporting(false);
            handleExportExcel();
        }, 500);
    };

    const handleEmail = () => {
        const email = prompt("Para qual email deseja enviar o relatório?", "usuario@email.com");
        if (email) alert(`Relatório enviado para ${email}!`);
    };

    return (
        <div className="pb-24 md:pb-0 space-y-6 animate-fade-in max-w-5xl mx-auto relative">
            {/* PAYWALL OVERLAY FOR TAX REPORT ONLY */}
            {isLocked && activeTab === 'tax' && (
                <div className="absolute inset-0 z-50 backdrop-blur-md bg-background/60 flex flex-col items-center justify-center text-center p-6 h-full rounded-3xl mt-16">
                    <div className="bg-surface border border-surfaceHighlight p-8 rounded-3xl shadow-2xl max-w-md w-full animate-scale-up">
                        <div className="w-16 h-16 bg-gradient-to-tr from-primary to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/30">
                            <Crown className="text-white" size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Recurso Exclusivo PRO</h2>
                        <p className="text-textMuted mb-6">
                            O módulo de Imposto de Renda mastigado, com separação de dedutíveis e bens, é exclusivo para assinantes.
                        </p>
                        <div className="space-y-3">
                            <Button onClick={() => navigate(AppRoutes.PRICING)}>
                                Assinar PRO e Desbloquear
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-textMain flex items-center gap-2">
                        <FileText className="text-primary" />
                        {t('reports.title')}
                    </h2>
                    <p className="text-textMuted text-sm">{t('reports.subtitle')}</p>
                </div>

                <div className="flex gap-2 bg-surface border border-surfaceHighlight p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('tax')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'tax' ? 'bg-primary text-white shadow-lg' : 'text-textMuted hover:text-white'}`}
                    >
                        <ShieldCheck size={16} /> IRPF
                    </button>
                    <button
                        onClick={() => setActiveTab('archive')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'archive' ? 'bg-surface shadow-sm text-white' : 'text-textMuted hover:text-white'}`}
                    >
                        <Image size={16} /> Arquivo Digital
                    </button>
                </div>
            </header>

            {/* --- TAB: TAX REPORT --- */}
            {activeTab === 'tax' && (
                <div className={`space-y-6 animate-slide-up ${isLocked ? 'blur-sm select-none' : ''}`}>
                    <div className="flex justify-end">
                        <div className="flex gap-2 bg-surfaceHighlight p-1 rounded-lg">
                            {['2022', '2023', '2024'].map(year => (
                                <button
                                    key={year}
                                    onClick={() => setSelectedYear(year)}
                                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${selectedYear === year ? 'bg-zinc-700 text-white' : 'text-textMuted hover:text-white'}`}
                                >
                                    {year}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="bg-gradient-to-br from-surface to-surfaceHighlight border-l-4 border-l-secondary">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg text-white mb-2">Kit Contador</h3>
                                    <p className="text-textMuted text-sm mb-4">
                                        Gera um arquivo completo (CSV) contendo rendimentos, despesas médicas e posição de bens.
                                    </p>
                                </div>
                                <FileText size={48} className="text-secondary opacity-20" />
                            </div>
                            <div className="flex gap-3">
                                <Button onClick={handleExport} isLoading={isExporting} disabled={isLocked}>
                                    <Download size={18} /> {t('reports.download')}
                                </Button>
                                <Button variant="secondary" onClick={handleEmail} disabled={isLocked}>
                                    <Share2 size={18} /> {t('reports.share')}
                                </Button>
                            </div>
                        </Card>

                        <Card>
                            <h3 className="font-bold text-lg text-white mb-4">Resumo Anual ({selectedYear})</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center border-b border-surfaceHighlight pb-2">
                                    <span className="text-textMuted text-sm">Rendimentos Tributáveis</span>
                                    <span className="font-mono text-secondary font-medium">{formatCurrency(totalIncome)}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-surfaceHighlight pb-2">
                                    <span className="text-textMuted text-sm">Despesas Dedutíveis</span>
                                    <span className="font-mono text-danger font-medium">- {formatCurrency(totalDeductible)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-textMuted text-sm">Bens e Direitos</span>
                                    <span className="font-mono text-white font-medium">{formatCurrency(totalInvested)}</span>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-textMain flex items-center gap-2">
                            <HeartPulse className="text-danger" size={20} />
                            Despesas Dedutíveis (Detalhado)
                        </h3>
                        <div className="bg-surface border border-surfaceHighlight rounded-xl overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-surfaceHighlight text-textMuted uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-3">Data</th>
                                        <th className="px-6 py-3">Descrição</th>
                                        <th className="px-6 py-3">Categoria</th>
                                        <th className="px-6 py-3 text-right">Valor</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-surfaceHighlight">
                                    {deductibleTransactions.length > 0 ? (
                                        deductibleTransactions.map(t => (
                                            <tr key={t.id} className="hover:bg-surfaceHighlight/50">
                                                <td className="px-6 py-4 text-textMuted">{format(t.date, 'dd/MM/yyyy')}</td>
                                                <td className="px-6 py-4 font-medium text-white">{t.description}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium 
                                                    ${t.category === 'Saúde' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                                        {t.category === 'Saúde' ? <HeartPulse size={12} /> : <GraduationCap size={12} />}
                                                        {t.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right font-mono text-textMain">{formatCurrency(t.amount)}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan={4} className="px-6 py-8 text-center text-textMuted">Nenhuma despesa dedutível.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4">
                        <h3 className="text-lg font-bold text-textMain flex items-center gap-2">
                            <Building className="text-primary" size={20} />
                            Bens e Direitos
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {investments.map(inv => (
                                <div key={inv.id} className="bg-surface border border-surfaceHighlight p-4 rounded-xl flex justify-between items-center">
                                    <div>
                                        <p className="text-textMain font-medium">{inv.assetName}</p>
                                        <p className="text-xs text-textMuted">{inv.type}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-textMuted text-xs">Custo de Aquisição</p>
                                        <p className="font-mono text-white">{formatCurrency(inv.amountInvested)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* --- TAB: DIGITAL ARCHIVE --- */}
            {activeTab === 'archive' && (
                <div className="animate-slide-up space-y-6">
                    {/* Search & Filters */}
                    <div className="flex gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar comprovante por nome ou categoria..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-surface border border-surfaceHighlight rounded-xl py-3 pl-12 pr-4 text-textMain placeholder-zinc-600 focus:outline-none focus:border-primary transition-all"
                            />
                        </div>
                    </div>

                    {filteredDocuments.length === 0 ? (
                        <div className="text-center py-20 text-textMuted bg-surface/30 rounded-2xl border border-dashed border-surfaceHighlight">
                            <FileCheck size={48} className="mx-auto mb-4 opacity-20" />
                            <h3 className="text-lg font-bold text-white mb-2">Nenhum documento encontrado</h3>
                            <p className="max-w-xs mx-auto">Use a câmera ao criar uma Transação ou Conta para salvar seus comprovantes aqui.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {filteredDocuments.map((doc) => (
                                <div
                                    key={doc.id}
                                    onClick={() => setViewImage(doc.url)}
                                    className="group bg-surface border border-surfaceHighlight rounded-xl overflow-hidden hover:border-primary transition-all cursor-pointer relative"
                                >
                                    <div className="aspect-square relative overflow-hidden bg-black/50">
                                        <img src={doc.url} alt="Comprovante" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                                            <ZoomIn className="text-white" size={24} />
                                        </div>
                                        <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-md">
                                            {format(doc.date, 'dd/MM/yy')}
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <p className="font-bold text-textMain text-sm truncate">{doc.description}</p>
                                        <div className="flex justify-between items-center mt-1">
                                            <span className="text-[10px] text-textMuted uppercase tracking-wider">{doc.category}</span>
                                            <span className="text-xs font-mono text-white">R$ {doc.amount.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</span>
                                        </div>
                                        <div className="mt-2 text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded w-fit">
                                            {doc.type}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* IMAGE VIEWER MODAL */}
            {viewImage && (
                <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center animate-fade-in p-4" onClick={() => setViewImage(null)}>
                    <button className="absolute top-6 right-6 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors z-50">
                        <X size={24} />
                    </button>
                    <img
                        src={viewImage}
                        alt="Comprovante Full"
                        className="max-w-full max-h-[90vh] rounded-lg shadow-2xl animate-scale-up object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
};

export default Reports;
