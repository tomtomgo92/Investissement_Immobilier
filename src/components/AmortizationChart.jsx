import React from 'react';
import { Bar } from 'react-chartjs-2';
import { formatE } from '../utils/formatters';

export default function AmortizationChart({ data, isDarkMode }) {

  // Prepare chart data
  const labels = data.map(d => `A${d.year}`);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Impôts',
        data: data.map(d => d.impots),
        backgroundColor: '#ef4444', // Red for taxes
        stack: 'Stack 0',
      },
      {
        label: 'Intérêts',
        data: data.map(d => d.interests),
        backgroundColor: '#f59e0b', // Amber for interests
        stack: 'Stack 0',
      },
      {
        label: 'Amortissement (Comptable)',
        data: data.map(d => d.amortTotal),
        backgroundColor: '#6366f1', // Indigo for amortization
        stack: 'Stack 0',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
            color: isDarkMode ? '#cbd5e1' : '#475569',
            font: { size: 10, weight: 'bold' }
        }
      },
      tooltip: {
        backgroundColor: '#1e293b',
        padding: 12,
        cornerRadius: 8,
        titleFont: { size: 10, weight: 'bold' },
        bodyFont: { size: 12 },
        callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${formatE(ctx.raw)}`
        }
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { size: 10 } }
      },
      y: {
        grid: { color: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' },
        ticks: { color: '#94a3b8', font: { size: 10 }, callback: (v) => `${v/1000}k` }
      },
    },
  };

  return (
    <div className="w-full h-[300px] relative">
      <Bar data={chartData} options={options} />
    </div>
  );
}
