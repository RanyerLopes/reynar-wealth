
import React, { useState } from 'react';
import { Calculator, CheckCircle, Clock, FileText, ChevronRight, MessageSquare, CreditCard, Sparkles, X } from 'lucide-react';
import { Card, Button, Badge } from '../components/UI';
import { useNavigate } from 'react-router-dom';
import { AppRoutes } from '../types';

interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  proPrice: number;
  icon: React.ReactNode;
  tags: string[];
}

const Accounting: React.FC = () => {
  const navigate = useNavigate();
  const currentPlan = localStorage.getItem('finnova_plan') || 'basic';
  const isPro = currentPlan === 'pro';

  const [activeTab, setActiveTab] = useState<'services' | 'orders'>('services');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Mock Pedidos
  const [myOrders, setMyOrders] = useState([
      { id: '1', service: 'Consultoria Financeira', date: '10/10/2023', status: 'completed', price: 100 },
  ]);

  const services: Service[] = [
    {
      id: '1',
      title: 'Declaração IRPF Completa',
      description: 'Nossos contadores analisam seus dados e enviam sua declaração sem erros.',
      price: 150.00,
      proPrice: 120.00,
      icon: <FileText size={24} className="text-secondary" />,
      tags: ['Anual', 'Essencial']
    },
    {
      id: '2',
      title: 'Revisão Malha Fina',
      description: 'Caiu na malha fina? Resolvemos suas pendências com a Receita Federal.',
      price: 300.00,
      proPrice: 250.00,
      icon: <Calculator size={24} className="text-danger" />,
      tags: ['Regularização']
    },
    {
      id: '3',
      title: 'Abertura de MEI',
      description: 'Formalize seu negócio. Inclui cadastro, CNPJ e alvarás iniciais.',
      price: 0.00,
      proPrice: 0.00,
      icon: <CheckCircle size={24} className="text-primary" />,
      tags: ['Grátis']
    },
    {
      id: '4',
      title: 'Consultoria Financeira (1h)',
      description: 'Videoconferência com especialista para organizar suas dívidas ou investimentos.',
      price: 150.00,
      proPrice: 100.00,
      icon: <MessageSquare size={24} className="text-amber-500" />,
      tags: ['Online']
    }
  ];

  const handleHireClick = (service: Service) => {
      setSelectedService(service);
      setIsModalOpen(true);
  };

  const confirmHire = () => {
      if(!selectedService) return;
      setIsProcessing(true);
      setTimeout(() => {
          const newOrder = {
              id: Math.random().toString(),
              service: selectedService.title,
              date: new Date().toLocaleDateString('pt-BR'),
              status: 'processing',
              price: isPro ? selectedService.proPrice : selectedService.price
          };
          setMyOrders([newOrder, ...myOrders]);
          setIsProcessing(false);
          setIsModalOpen(false);
          setActiveTab('orders');
          alert('Solicitação enviada! Um de nossos contadores entrará em contato em breve.');
      }, 2000);
  };

  return (
    <div className="pb-24 md:pb-0 space-y-6 animate-fade-in relative">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h2 className="text-2xl font-bold text-textMain flex items-center gap-2">
                    <Calculator className="text-primary" />
                    Contabilidade Expert
                </h2>
                <p className="text-textMuted text-sm">Serviços profissionais sob demanda.</p>
            </div>
            
            {/* Toggle Tabs */}
            <div className="flex gap-2 bg-surfaceHighlight p-1 rounded-xl">
                 <button
                    onClick={() => setActiveTab('services')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'services' ? 'bg-surface shadow-sm text-textMain' : 'text-textMuted hover:text-white'}`}
                 >
                     Serviços Disponíveis
                 </button>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'orders' ? 'bg-surface shadow-sm text-textMain' : 'text-textMuted hover:text-white'}`}
                 >
                     Meus Pedidos
                 </button>
            </div>
        </header>

        {!isPro && (
            <button 
                onClick={() => navigate(AppRoutes.PRICING)} 
                className="w-full text-left bg-gradient-to-r from-indigo-900/50 to-primary/20 border border-primary/30 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-primary/10 transition-colors group"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary text-white rounded-lg group-hover:scale-105 transition-transform">
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <h4 className="text-white font-semibold text-sm">Desconto Exclusivo PRO</h4>
                        <p className="text-textMuted text-xs mt-0.5">Assinantes PRO pagam menos em todos os serviços contábeis.</p>
                    </div>
                </div>
                <ChevronRight className="text-primary/50 group-hover:text-primary group-hover:translate-x-1 transition-all" size={20} />
            </button>
        )}

        {/* Content Area */}
        {activeTab === 'services' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                    <Card key={service.id} className="flex flex-col h-full hover:border-surfaceHighlight/80 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-surfaceHighlight rounded-xl">
                                {service.icon}
                            </div>
                            <div className="flex gap-2">
                                {service.tags.map(tag => (
                                    <span key={tag} className="px-2 py-0.5 rounded-md bg-surfaceHighlight text-[10px] text-textMuted uppercase tracking-wide border border-zinc-700">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                        
                        <h3 className="font-bold text-lg text-white mb-2">{service.title}</h3>
                        <p className="text-textMuted text-sm mb-6 flex-1">{service.description}</p>
                        
                        <div className="mt-auto pt-4 border-t border-surfaceHighlight">
                            <div className="flex items-end justify-between mb-4">
                                <div>
                                    <p className="text-xs text-textMuted">A partir de</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className={`text-2xl font-bold ${isPro ? 'text-secondary' : 'text-white'}`}>
                                            R$ {isPro ? service.proPrice.toFixed(2) : service.price.toFixed(2)}
                                        </span>
                                        {!isPro && service.price > service.proPrice && (
                                            <span className="text-xs text-textMuted line-through">
                                                R$ {service.price.toFixed(2)}
                                            </span>
                                        )}
                                    </div>
                                    {isPro && service.price > service.proPrice && (
                                        <span className="text-[10px] text-secondary font-medium">Preço PRO aplicado</span>
                                    )}
                                </div>
                            </div>
                            <Button onClick={() => handleHireClick(service)}>
                                Contratar
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        ) : (
            <div className="space-y-4">
                {myOrders.length === 0 ? (
                    <div className="text-center py-20 text-textMuted bg-surface/30 rounded-2xl border border-dashed border-surfaceHighlight">
                        <FileText size={48} className="mx-auto mb-4 opacity-20" />
                        <p>Você ainda não contratou nenhum serviço.</p>
                    </div>
                ) : (
                    myOrders.map((order) => (
                        <button 
                            key={order.id} 
                            className="w-full flex items-center justify-between p-4 bg-surface border border-surfaceHighlight rounded-xl hover:bg-surfaceHighlight transition-colors group text-left"
                            onClick={() => alert(`Detalhes do pedido: ${order.service}`)} // Placeholder for detail view
                        >
                             <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${order.status === 'completed' ? 'bg-secondary/10 text-secondary' : 'bg-amber-500/10 text-amber-500'}`}>
                                    {order.status === 'completed' ? <CheckCircle size={20} /> : <Clock size={20} />}
                                </div>
                                <div>
                                    <p className="font-semibold text-textMain group-hover:text-white transition-colors">{order.service}</p>
                                    <p className="text-xs text-textMuted">Solicitado em {order.date}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <Badge type={order.status === 'completed' ? 'income' : 'neutral'}>
                                        {order.status === 'completed' ? 'Concluído' : 'Em Análise'}
                                    </Badge>
                                    <p className="text-xs text-textMuted mt-1">R$ {order.price.toFixed(2)}</p>
                                </div>
                                <ChevronRight size={18} className="text-textMuted group-hover:text-white" />
                            </div>
                        </button>
                    ))
                )}
            </div>
        )}

        {/* Payment Modal */}
        {isModalOpen && selectedService && (
            <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm p-0 md:p-4">
                <div className="bg-surface w-full max-w-md rounded-t-2xl md:rounded-2xl border border-surfaceHighlight shadow-2xl animate-slide-up">
                    <div className="p-6 border-b border-surfaceHighlight flex justify-between items-center">
                        <h3 className="text-lg font-bold text-white">Confirmar Contratação</h3>
                        <button onClick={() => setIsModalOpen(false)} className="text-textMuted hover:text-white"><X size={20}/></button>
                    </div>
                    
                    <div className="p-6 space-y-6">
                        <div className="bg-surfaceHighlight/50 p-4 rounded-xl flex items-start gap-4">
                            <div className="p-2 bg-surface rounded-lg border border-surfaceHighlight">
                                {selectedService.icon}
                            </div>
                            <div>
                                <h4 className="font-bold text-white">{selectedService.title}</h4>
                                <p className="text-xs text-textMuted">{selectedService.description}</p>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-medium text-textMuted uppercase mb-3">Forma de Pagamento</p>
                            <div className="space-y-2">
                                <label className="flex items-center gap-3 p-3 border border-primary bg-primary/10 rounded-xl cursor-pointer">
                                    <div className="w-4 h-4 rounded-full border-4 border-primary bg-white"></div>
                                    <span className="font-medium text-white flex-1">Pix (Instantâneo)</span>
                                    <Sparkles size={16} className="text-primary" />
                                </label>
                                <label className="flex items-center gap-3 p-3 border border-surfaceHighlight rounded-xl cursor-pointer opacity-60">
                                    <div className="w-4 h-4 rounded-full border border-textMuted"></div>
                                    <span className="font-medium text-textMuted flex-1">Cartão de Crédito</span>
                                    <CreditCard size={16} />
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-surfaceHighlight">
                            <span className="text-textMuted">Total a pagar</span>
                            <span className="text-2xl font-bold text-white">
                                R$ {isPro ? selectedService.proPrice.toFixed(2) : selectedService.price.toFixed(2)}
                            </span>
                        </div>

                        <Button onClick={confirmHire} isLoading={isProcessing}>
                            Pagar e Contratar
                        </Button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default Accounting;
