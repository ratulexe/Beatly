import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Card } from '../ui/Card';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const TimeDistributionChart = ({ hourlyData }) => {
  if (!hourlyData || hourlyData.length === 0) return null;

  const labels = Array.from({ length: 24 }, (_, i) => {
    const ampm = i >= 12 ? 'PM' : 'AM';
    const hour = i % 12 || 12;
    return `${hour} ${ampm}`;
  });

  const data = {
    labels,
    datasets: [
      {
        label: 'Plays',
        data: hourlyData.map(d => d.playCount),
        backgroundColor: '#1ED760',
        borderRadius: 4,
      }
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#121212',
        titleFont: { family: 'Montserrat', size: 14 },
        bodyFont: { family: 'Montserrat', size: 14 },
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#a0a0a0',
          font: { family: 'Montserrat', size: 12 }
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#a0a0a0',
          font: { family: 'Montserrat', size: 10 },
          maxTicksLimit: 12
        }
      }
    },
  };

  return (
    <Card className="h-[400px] flex flex-col">
      <h3 className="text-lg font-bold mb-6">Listening Activity by Hour</h3>
      <div className="flex-1 relative w-full h-full">
        <Bar options={options} data={data} />
      </div>
    </Card>
  );
};
