import React from 'react';
import Navigation from '../components/Navigation';
import CalendarView from '../components/CalendarView';

const CalendarPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />

      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              <CalendarView />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CalendarPage; 