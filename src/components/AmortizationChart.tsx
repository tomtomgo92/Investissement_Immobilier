import React, { useMemo, memo } from 'react';
import { Bar } from 'react-chartjs-2';
import { formatE } from '../utils/formatters';

export interface AmortizationChartProps {
  data: Array<{
    year: number;
    impots: number;
    interests: number;
    amortTotal: number;
    [key: string]: any;
  }>;
  isDarkMode: boolean;
}

const AmortizationChart = memo(function AmortizationChart({ data, isDarkMode }: AmortizationChartProps) {

  // Prepare chart data
  const chartData = useMemo(() => {
    const labels = data.map(d => `A${d.year}`);
    return {
      labels,
      datasets: [
        {
          label: 'Impôts',
          data: data.map(d => d.impots),
          backgroundColor: isDarkMode ? '#f87171' : '#ef4444', 
          stack: 'Stack 0',
          borderRadius: 2,
        },
        {
          label: 'Intérêts',
          data: data.map(d => d.interests),
          backgroundColor: isDarkMode ? '#fbbf24' : '#f59e0b', 
          stack: 'Stack 0',
          borderRadius: 2,
        },
        {
          label: 'Amortissement (Comptable)',
          data: data.map(d => d.amortTotal),
          backgroundColor: isDarkMode ? '#818cf8' : '#6366f1', 
          stack: 'Stack 0',
          borderRadius: { topLeft: 4, topRight: 4 },
        },
      ],
    };
  }, [data, isDarkMode]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
            color: isDarkMode ? '#94a3b8' : '#64748b',
            font: { size: 10, weight: 600, family: 'Inter, sans-serif' },
            usePointStyle: true,
            boxWidth: 6,
        }
      },
      tooltip: {
        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
        titleColor: isDarkMode ? '#f8fafc' : '#0f172a',
        bodyColor: isDarkMode ? '#cbd5e1' : '#475569',
        borderColor: isDarkMode ? '#334155' : '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 12,
        titleFont: { size: 11, weight: 600, family: 'Inter, sans-serif' },
        bodyFont: { size: 12, family: 'Inter, sans-serif' },
        callbacks: {
            label: (ctx: any) => `${ctx.dataset.label}: ${formatE(ctx.raw)}`
        }
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: isDarkMode ? '#64748b' : '#94a3b8', font: { size: 10, family: 'Inter, sans-serif' } },
        border: { display: false }
      },
      y: {
        grid: { color: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' },
        ticks: { color: isDarkMode ? '#64748b' : '#94a3b8', font: { size: 10, family: 'Inter, sans-serif' }, callback: (v: any) => `${v/1000}k` },
        border: { display: false }
      },
    },
  }), [isDarkMode]);

  return (
    <div className="w-full h-[300px] relative transition-all duration-300">
      <Bar data={chartData} options={options} />
    </div>
  );
});

export default AmortizationChart;
