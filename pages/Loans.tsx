

import React, { useState, useEffect } from 'react';
import { Plus, User, Calendar, CheckCircle, HandCoins, Trash2, X } from 'lucide-react';
import { Card, Button, Input } from '../components/UI';
import { Loan } from '../types';
import { format } from 'date-fns';
import { useLoans } from '../hooks/useDatabase';

const Loans: React.FC = () => {
    const { loans: dbLoans, loading: loansLoading, addLoan: addLoanToDb, toggleLoanPaid } = useLoans();
    const [loans, setLoans] = useState<Loan[]>([]);

    // Sync database loans with local state
    useEffect(() => {
        setLoans(dbLoans);
    }, [dbLoans]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'active' | 'paid'>('active');

    // Form State
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const activeLoans = loans.filter(l => !l.isPaid);
    const paidLoans = loans.filter(l => l.isPaid);
    const totalReceivable = activeLoans.reduce((acc, l) => acc + l.amount, 0);

    const handleTogglePaid = (id: string) => {
        setLoans(loans.map(l => l.id === id ? { ...l, isPaid: !l.isPaid } : l));
    };

    const handleDelete = (id: string) => {
        if (confirm('Tem certeza que deseja apagar este registro?')) {
            setLoans(loans.filter(l => l.id !== id));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newLoan: Loan = {
            id: Math.random().toString(),
            borrowerName: name,
            description: desc,
            amount: parseFloat(amount),
            dateLent: new Date(date),
            isPaid: false
        };
        setLoans([...loans, newLoan]);
        setIsModalOpen(false);
        // Reset
        setName(''); setDesc(''); setAmount('');
    };

    const LoanItem: React.FC<{ loan: Loan }> = ({ loan }) => (
        <div className={`flex items-center justify-between p-4 bg-surface border border-surfaceHighlight rounded-xl mb-3 animate-fade-in-up transition-all hover:bg-surfaceHighlight/50`}>
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${loan.isPaid ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'}`}>
                    {loan.borrowerName.charAt(0)}
                </div>
                <div>
                    <p className={`font-semibold ${loan.isPaid ? 'text-textMuted line-through' : 'text-textMain'}`}>{loan.borrowerName}</p>
                    <p className="text-xs text-textMuted">{loan.description} • {format(loan.dateLent, 'dd/MM/yy')}</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <div className="text-right mr-2">
                    <p className={`font-bold ${loan.isPaid ? 'text-textMuted' : 'text-white'}`}>R$ {loan.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    <p className="text-[10px] text-textMuted">{loan.isPaid ? 'Recebido' : 'A receber'}</p>
                </div>

                {!loan.isPaid ? (
                    <button
                        onClick={() => handleTogglePaid(loan.id)}
                        className="p-2 rounded-lg bg-surfaceHighlight hover:bg-secondary/20 hover:text-secondary text-textMuted transition-colors"
                        title="Marcar como Pago"
                    >
                        <CheckCircle size={18} />
                    </button>
                ) : (
                    <button
                        onClick={() => handleDelete(loan.id)}
                        className="p-2 rounded-lg bg-surfaceHighlight hover:bg-danger/20 hover:text-danger text-textMuted transition-colors"
                        title="Remover"
                    >
                        <Trash2 size={18} />
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in relative">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-textMain">Me Devem</h2>
                    <p className="text-textMuted text-sm">Controle quem te deve dinheiro</p>
                </div>
                <Button className="!w-auto px-4 py-2" onClick={() => setIsModalOpen(true)}>
                    <Plus size={20} />
                    <span className="hidden sm:inline">Novo Empréstimo</span>
                </Button>
            </header>

            {/* Hero Card */}
            <Card className="bg-gradient-to-br from-indigo-900 via-surface to-black border-primary/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10">
                    <HandCoins size={100} className="text-primary" />
                </div>
                <div className="relative z-10">
                    <p className="text-primary/80 text-xs font-medium uppercase tracking-wider mb-1">Total a Receber</p>
                    <h3 className="text-3xl font-bold text-white mb-2">R$ {totalReceivable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                    <p className="text-textMuted text-xs">Não deixe seu dinheiro parado. Cobre seus amigos!</p>
                </div>
            </Card>

            {/* Tabs */}
            <div className="flex gap-2 bg-surfaceHighlight p-1 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('active')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'active' ? 'bg-surface shadow-sm text-textMain' : 'text-textMuted hover:text-white'}`}
                >
                    A Receber ({activeLoans.length})
                </button>
                <button
                    onClick={() => setActiveTab('paid')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'paid' ? 'bg-surface shadow-sm text-textMain' : 'text-textMuted hover:text-white'}`}
                >
                    Já Pagaram
                </button>
            </div>

            {/* List */}
            <div className="min-h-[200px]">
                {activeTab === 'active' ? (
                    <>
                        {activeLoans.length === 0 ? (
                            <div className="text-center py-20 text-textMuted bg-surface/30 rounded-2xl border border-dashed border-surfaceHighlight">
                                <HandCoins size={48} className="mx-auto mb-4 opacity-20" />
                                <p>Ninguém te deve nada. <br />Que sorte (ou azar)!</p>
                            </div>
                        ) : (
                            activeLoans.map(l => <LoanItem key={l.id} loan={l} />)
                        )}
                    </>
                ) : (
                    <>
                        {paidLoans.length === 0 ? (
                            <div className="text-center py-10 text-textMuted">
                                <p>Nenhum histórico de pagamentos.</p>
                            </div>
                        ) : (
                            paidLoans.map(l => <LoanItem key={l.id} loan={l} />)
                        )}
                    </>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm p-0 md:p-4">
                    <div className="bg-surface w-full max-w-md rounded-t-2xl md:rounded-2xl border border-surfaceHighlight shadow-2xl animate-slide-up">
                        <div className="p-6 border-b border-surfaceHighlight flex justify-between items-center">
                            <h3 className="text-lg font-bold text-white">Adicionar Dívida</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-textMuted hover:text-white"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <Input
                                label="Quem deve? (Nome)"
                                placeholder="Ex: Carlos"
                                required
                                icon={<User size={16} />}
                                value={name}
                                onChange={e => setName(e.target.value)}
                            />
                            <Input
                                label="Valor (R$)"
                                type="number"
                                placeholder="0,00"
                                required
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                            />
                            <Input
                                label="Motivo / Descrição"
                                placeholder="Ex: Empréstimo Uber"
                                required
                                value={desc}
                                onChange={e => setDesc(e.target.value)}
                            />
                            <Input
                                label="Data do Empréstimo"
                                type="date"
                                required
                                icon={<Calendar size={16} />}
                                value={date}
                                onChange={e => setDate(e.target.value)}
                            />

                            <Button type="submit" className="mt-4">Salvar</Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Loans;