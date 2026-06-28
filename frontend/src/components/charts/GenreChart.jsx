import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { Card } from '../ui/Card';

ChartJS.register(ArcElement, Tooltip, Legend);

export const GenreChart = ({ genres }) => {
  if (!genres || genres.length === 0) return null;

  // Take top 5 for pie chart readability, group the rest as "Other"
  const topGenres = genres.slice(0, 5);
  const otherPlays = genres.slice(5).reduce((acc, curr) => acc + curr.playCount, 0);
  
  if (otherPlays > 0) {
    topGenres.push({ genre: 'other', playCount: otherPlays });
  }

  const data = {
    labels: topGenres.map(g => g.genre.replace(/\b\w/g, l => l.toUpperCase())), // capitalize
    datasets: [
      {
        data: topGenres.map(g => g.playCount),
        backgroundColor: [
          '#1ED760',
          '#1DB954',
          '#1AA34A',
          '#14833B',
          '#0E5C2A',
          '#333333'
        ],
        borderColor: '#090909',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#ffffff',
          font: { family: 'Montserrat', size: 12 },
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: '#121212',
        titleFont: { family: 'Montserrat', size: 14 },
        bodyFont: { family: 'Montserrat', size: 14 },
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
      }
    }
  };

  return (
    <Card className="h-[400px] flex flex-col">
      <h3 className="text-lg font-bold mb-4">Top Genres</h3>
      <div className="flex-1 relative w-full h-full flex justify-center items-center">
        <Doughnut data={data} options={options} />
      </div>
    </Card>
  );
};
