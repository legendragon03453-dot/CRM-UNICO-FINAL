import React, { FC, useMemo } from 'react';
import { useRealtimeSalesData, SaleDataPoint } from '@/hooks/useRealtimeSalesData';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';
import { DollarSign, Repeat2, TrendingUp, Activity, BarChart, Clock, Target, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

// Helper for currency formatting
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

interface MetricCardProps {
  title: string;
  value: number;
  unit?: string;
  icon?: React.ReactNode;
  description?: string;
  valueClassName?: string;
}

const MetricCard: FC<MetricCardProps> = ({ title, value, unit = '', icon, description, valueClassName }) => (
  <Card className="flex-1 min-w-[250px] bg-[#1C1B16] border-[#2A2922] rounded-none shadow-2xl relative overflow-hidden group">
    <div className="absolute inset-x-0 bottom-0 h-1 bg-white opacity-0 group-hover:opacity-100 transition-opacity"></div>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-[10px] font-black text-zinc-600 tracking-[0.5em] uppercase">{title}</CardTitle>
      <div className="p-3 bg-white/5 border border-white/5 rounded-none text-zinc-500">{icon}</div>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className={cn("text-5xl font-black text-white italic tracking-tighter", valueClassName)}>
        {unit}{typeof value === 'number' ? value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00'}
      </div>
      {description && <p className="text-[9px] font-black text-zinc-700 tracking-widest uppercase">{description}</p>}
    </CardContent>
  </Card>
);

const RealtimeChart: FC<{ data: SaleDataPoint[]; title: string; dataKey: keyof SaleDataPoint; lineColor: string; legendName: string }> = ({ data, title, dataKey, lineColor, legendName }) => {
  const chartData = useMemo(() => data.slice(-15), [data]);
  
  return (
    <Card className="flex-1 min-w-[300px] bg-[#1C1B16] border-[#2A2922] rounded-none shadow-2xl p-6">
      <CardHeader className="p-0 mb-8 border-b border-[#2A2922] pb-6">
        <CardTitle className="text-[10px] font-black text-zinc-600 tracking-[0.5em] uppercase flex items-center gap-4">
          <BarChart className="h-5 w-5" />{title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div style={{ width: '100%', height: '350px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2922" vertical={false} />
              <XAxis 
                dataKey="time" 
                stroke="#444" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                tick={{ fontStyle: 'italic', fontWeight: 'bold' }}
              />
              <YAxis 
                stroke="#444" 
                fontSize={10} 
                tickLine={false} 
                tickFormatter={(v: any) => `R$ ${v.toLocaleString()}`}
                tick={{ fontStyle: 'italic', fontWeight: 'bold' }}
              />
              <RechartsTooltip 
                contentStyle={{ backgroundColor: '#14130E', border: '1px solid #2A2922', borderRadius: '0' }}
                itemStyle={{ color: '#fff', fontSize: '10px', textTransform: 'uppercase', fontStyle: 'italic', fontWeight: 'black' }}
                labelStyle={{ display: 'none' }}
              />
              <Line 
                type="monotone" 
                dataKey={dataKey} 
                stroke={lineColor} 
                strokeWidth={3} 
                dot={{ fill: lineColor, strokeWidth: 2, r: 4, stroke: '#14130E' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export const SalesDashboard: FC = () => {
  const {
    totalRevenue,
    cumulativeRevenueData,
    salesCount,
    averageSale,
    salesChartData,
    latestPayments,
  } = useRealtimeSalesData();

  return (
    <div className="w-full bg-[#14130E] text-white p-2 md:p-8 space-y-12 animate-fade-in-up uppercase">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-[#2A2922] pb-12">
        <div className="space-y-4">
           <div className="flex items-center gap-4">
              <span className="w-2 h-8 bg-white opacity-50"></span>
              <p className="text-[10px] font-black text-zinc-600 tracking-[0.8em] uppercase">HQ MONITORING ACTIVE</p>
           </div>
           <h1 className="text-8xl font-black italic tracking-tighter uppercase leading-none">CÉU DE DADOS</h1>
           <p className="text-zinc-700 text-xs font-bold tracking-[0.4em] uppercase">SISTEMA INTEGRADO DE PERFORMANCE UNICO STUDIO.</p>
        </div>
        <div className="flex items-center gap-8">
            <div className="text-right">
                <p className="text-[9px] font-black text-zinc-700 tracking-widest uppercase">STATUS DA REDE</p>
                <div className="flex items-center gap-3 justify-end mt-1">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                    </span>
                    <span className="text-[11px] font-black text-white italic tracking-tighter uppercase">ONLINE STUDIO</span>
                </div>
            </div>
            <div className="p-6 bg-white text-black font-black uppercase text-[10px] tracking-widest shadow-2xl active:scale-95 transition-all cursor-pointer">SINCRONIZAR RADAR</div>
        </div>
      </div>

      {/* Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <MetricCard
          title="Faturamento Total"
          value={totalRevenue || 0}
          unit="R$"
          icon={<DollarSign className="h-4 w-4" />}
          description="Equity acumulado na rede"
          valueClassName="text-white"
        />
        <MetricCard
          title="Transações"
          value={salesCount || 0}
          icon={<Repeat2 className="h-4 w-4" />}
          description="Volume de contratos liquidados"
        />
        <MetricCard
          title="Ticket Médio"
          value={averageSale || 0}
          unit="R$"
          icon={<TrendingUp className="h-4 w-4" />}
          description="Ticket médio de conversão"
        />
        <MetricCard
          title="Alvo de Metas"
          value={82.5}
          unit="%"
          icon={<Target className="h-4 w-4" />}
          description="Progresso da meta Alpha Elite"
          valueClassName="text-white opacity-50"
        />
      </div>

      {/* Charts Section */}
      <div className="flex flex-wrap gap-8">
        <RealtimeChart
          data={salesChartData}
          title="Performance Instantânea (Sales/s)"
          dataKey="sales"
          lineColor="#fff"
          legendName="Conversão Bruta"
        />
        <RealtimeChart
          data={cumulativeRevenueData}
          title="Tendência de Equity Acumulado"
          dataKey="sales"
          lineColor="#fff"
          legendName="Faturamento Estável"
        />
      </div>

      {/* Latest Payments Section */}
      <Card className="bg-[#1C1B16] border-[#2A2922] rounded-none shadow-2xl overflow-hidden p-8">
        <CardHeader className="p-0 border-b border-[#2A2922] pb-6 mb-10 flex flex-row items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="p-3 bg-white text-black"><Activity className="h-5 w-5" /></div>
            <div>
               <CardTitle className="text-[10px] font-black text-zinc-600 tracking-[0.5em] uppercase">ATIVIDADE DE REDE</CardTitle>
               <CardDescription className="text-[11px] font-black italic tracking-tighter uppercase text-white mt-1">ÚLTIMOS CONTRATOS SINCRONIZADOS</CardDescription>
            </div>
          </div>
          <ShieldCheck className="h-6 w-6 text-zinc-800" />
        </CardHeader>
        <CardContent className="p-0 max-h-[400px] overflow-hidden">
          <ScrollArea className="h-[350px]">
            <div className="space-y-4">
              {latestPayments.length === 0 ? (
                <p className="p-4 text-center text-muted-foreground font-black uppercase text-[10px] tracking-[1em] animate-pulse">LENDO DADOS DO STUDIO...</p>
              ) : (
                latestPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-6 bg-black/40 border border-[#2A2922] group hover:border-white hover:bg-black transition-all shadow-xl">
                    <div className="flex items-center gap-8 flex-1">
                      <div className="w-14 h-14 bg-zinc-900 border border-zinc-800 flex items-center justify-center font-black text-white italic text-xl uppercase">{payment.customer[0]}</div>
                      <div className="space-y-1">
                        <span className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">{formatCurrency(payment.amount || 0)}</span>
                        <p className="text-[10px] text-zinc-700 font-bold tracking-[0.4em] uppercase">{payment.product} — {payment.customer}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                       <span className="text-[9px] text-zinc-800 font-black tracking-widest uppercase">{payment.time}</span>
                       <Badge variant="outline" className="rounded-none border-zinc-800 text-[8px] font-black text-zinc-600 uppercase">LIQUIDADO HQ</Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      
      {/* FINAL SPACING FOR FLOATING NAV */}
      <div className="h-64"></div>
    </div>
  );
};
