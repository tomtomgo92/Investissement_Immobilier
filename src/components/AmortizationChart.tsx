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
}

const AmortizationChart = memo(function AmortizationChart({ data }: AmortizationChartProps) {

  // Prepare chart data
  const chartData = useMemo(() => {
    const labels = data.map(d => `A${d.year}`);
    return {
      labels,
      datasets: [
        {
          label: 'Impôts',
          data: data.map(d => d.impots),
          backgroundColor: '#ef4444', 
          stack: 'Stack 0',
          borderRadius: 2,
        },
        {
          label: 'Intérêts',
          data: data.map(d => d.interests),
          backgroundColor: '#f59e0b', 
          stack: 'Stack 0',
          borderRadius: 2,
        },
        {
          label: 'Amortissement (Comptable)',
          data: data.map(d => d.amortTotal),
          backgroundColor: '#6366f1', 
          stack: 'Stack 0',
          borderRadius: { topLeft: 4, topRight: 4 },
        },
      ],
    };
  }, [data]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
            color: '#64748b',
            font: { size: 10, weight: 600, family: 'Inter, sans-serif' },
            usePointStyle: true,
            boxWidth: 6,
        }
      },
      tooltip: {
        backgroundColor: '#ffffff',
        titleColor: '#0f172a',
        bodyColor: '#475569',
        borderColor: '#e2e8f0',
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
        ticks: { color: '#94a3b8', font: { size: 10, family: 'Inter, sans-serif' } },
        border: { display: false }
      },
      y: {
        grid: { color: 'rgba(0,0,0,0.03)' },
        ticks: { color: '#94a3b8', font: { size: 10, family: 'Inter, sans-serif' }, callback: (v: any) => `${v/1000}k` },
        border: { display: false }
      },
    },
  }), []);

  return (
    <div className="w-full h-[300px] relative transition-all duration-300">
      <Bar data={chartData} options={options} />
    </div>
  );
});

export default AmortizationChart;
