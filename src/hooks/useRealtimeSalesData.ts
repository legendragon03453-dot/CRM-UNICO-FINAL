import { useState, useEffect } from 'react';

export interface SaleDataPoint {
  time: string;
  sales: number;
}

export interface LatestPayment {
  id: string;
  amount: number;
  customer: string;
  product: string;
  time: string;
}

export const useRealtimeSalesData = () => {
  const [totalRevenue, setTotalRevenue] = useState(128450.00);
  const [salesCount, setSalesCount] = useState(1240);
  const [averageSale, setAverageSale] = useState(103.58);
  const [salesChartData, setSalesChartData] = useState<SaleDataPoint[]>([]);
  const [cumulativeRevenueData, setCumulativeRevenueData] = useState<SaleDataPoint[]>([]);
  const [latestPayments, setLatestPayments] = useState<LatestPayment[]>([]);

  useEffect(() => {
    // Generate initial history
    const initialData: SaleDataPoint[] = [];
    const initialCumulative: SaleDataPoint[] = [];
    let currentTotal = 128450;
    
    for (let i = 60; i >= 0; i--) {
        const time = new Date(Date.now() - i * 5000);
        const sales = Math.random() * 500 + 100;
        currentTotal += sales;
        const timeStr = time.toLocaleTimeString();
        initialData.push({ time: timeStr, sales });
        initialCumulative.push({ time: timeStr, sales: currentTotal });
    }
    setSalesChartData(initialData);
    setCumulativeRevenueData(initialCumulative);

    setLatestPayments([
        { id: '1', amount: 1200, customer: 'Filippo Designer', product: 'Branding Elite', time: '1m ago' },
        { id: '2', amount: 450, customer: 'Studio Alpha', product: 'VFX Motion', time: '5m ago' },
        { id: '3', amount: 3000, customer: 'Legend Agency', product: 'CRM Custom', time: '12m ago' },
        { id: '4', amount: 800, customer: 'Tech Flow', product: 'UX Review', time: '15m ago' },
    ]);

    // Simulate real-time updates
    const interval = setInterval(() => {
      const now = new Date();
      const newSales = Math.random() * 800 + 100;
      const timeStr = now.toLocaleTimeString();
      
      setTotalRevenue(prev => prev + newSales);
      setSalesCount(prev => prev + 1);
      setAverageSale(prev => (prev * (salesCount) + newSales) / (salesCount + 1));
      
      setSalesChartData(prev => [...prev.slice(-20), { time: timeStr, sales: newSales }]);
      setCumulativeRevenueData(prev => [...prev.slice(-20), { time: timeStr, sales: totalRevenue + newSales }]);
      
      // Randomly add new payment
      if (Math.random() > 0.7) {
          const names = ['Kauan Code', 'Enzo Creative', 'Pietro Dev', 'Marco Sales'];
          const products = ['Landing Page', 'Social Pack', 'Ads Strategy', 'Consultoria'];
          const newPayment = {
              id: Date.now().toString(),
              amount: Math.floor(Math.random() * 2000) + 500,
              customer: names[Math.floor(Math.random() * names.length)],
              product: products[Math.floor(Math.random() * products.length)],
              time: 'Just now'
          };
          setLatestPayments(prev => [newPayment, ...prev.slice(0, 9)]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [salesCount, totalRevenue]);

  return {
    totalRevenue,
    cumulativeRevenueData,
    salesCount,
    averageSale,
    salesChartData,
    latestPayments,
  };
};
