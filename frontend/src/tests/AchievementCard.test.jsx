import React from 'react';
import { render, screen } from '@testing-library/react';
import { AchievementCard } from '../components/achievements/AchievementCard';

describe('AchievementCard', () => {
  const mockAchievement = {
    id: 'first_blood',
    name: 'First Blood',
    description: 'Listen to your first track',
    icon: 'music',
    rarity: 'common'
  };

  it('renders locked state correctly', () => {
    render(
      <AchievementCard 
        achievement={mockAchievement} 
        isCompleted={false} 
        currentProg={0} 
        threshold={1} 
      />
    );
    expect(screen.getByText('First Blood')).toBeInTheDocument();
    // Locked text should be present since it's 0/1 progress and incomplete
    expect(screen.getByText(/0 \/ 1/)).toBeInTheDocument();
  });

  it('renders completed state correctly', () => {
    render(
      <AchievementCard 
        achievement={mockAchievement} 
        isCompleted={true} 
        currentProg={1} 
        threshold={1} 
      />
    );
    
    // Check for the completed state appearance
    expect(screen.getByText('First Blood')).toBeInTheDocument();
    // Description should be visible when completed
    expect(screen.getByText('Listen to your first track')).toBeInTheDocument();
  });
});
