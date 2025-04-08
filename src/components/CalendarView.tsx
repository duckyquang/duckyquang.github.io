import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CalendarEvent } from '../models/Calendar';
import { getUserEvents, syncWithGoogleCalendar } from '../services/calendarService';

const CalendarView: React.FC = () => {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const userEvents = await getUserEvents(currentUser.uid);
        setEvents(userEvents);
      } catch (err: any) {
        setError('Failed to fetch events: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [currentUser]);

  const handleSyncWithGoogle = async () => {
    if (!currentUser) return;
    
    try {
      setSyncing(true);
      const token = localStorage.getItem('googleAccessToken');
      
      if (!token) {
        throw new Error('Google access token not found. Please sign in with Google again.');
      }
      
      await syncWithGoogleCalendar(currentUser.uid, token);
      
      // Refresh events after sync
      const userEvents = await getUserEvents(currentUser.uid);
      setEvents(userEvents);
      
    } catch (err: any) {
      setError('Failed to sync with Google Calendar: ' + err.message);
    } finally {
      setSyncing(false);
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getWeekDays = () => {
    const date = new Date(currentDate);
    const day = date.getDay();
    const diff = date.getDate() - day;
    
    const weekDays = [];
    
    for (let i = 0; i < 7; i++) {
      const newDate = new Date(date);
      newDate.setDate(diff + i);
      weekDays.push(newDate);
    }
    
    return weekDays;
  };

  const getDayEvents = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.startTime);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const renderMonthView = () => {
    const days = getMonthDays();
    
    return (
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-medium py-2 border-b">
            {day}
          </div>
        ))}
        
        {days.map((day, index) => (
          <div 
            key={index} 
            className={`min-h-[100px] p-1 border ${
              day && day.getDate() === new Date().getDate() && 
              day.getMonth() === new Date().getMonth() && 
              day.getFullYear() === new Date().getFullYear()
                ? 'bg-blue-50 border-blue-200'
                : ''
            }`}
          >
            {day && (
              <>
                <div className="text-right text-sm">{day.getDate()}</div>
                <div className="mt-1">
                  {getDayEvents(day).map(event => (
                    <div 
                      key={event.id} 
                      className="text-xs p-1 mb-1 rounded bg-indigo-100 truncate"
                      title={event.title}
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDays = getWeekDays();
    
    return (
      <div className="flex flex-col">
        <div className="grid grid-cols-8 border-b">
          <div className="py-2 px-2 font-medium">Time</div>
          {weekDays.map((date, index) => (
            <div 
              key={index} 
              className={`py-2 px-2 text-center font-medium ${
                date.getDate() === new Date().getDate() && 
                date.getMonth() === new Date().getMonth() && 
                date.getFullYear() === new Date().getFullYear()
                  ? 'bg-blue-50'
                  : ''
              }`}
            >
              {date.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' })}
            </div>
          ))}
        </div>
        
        {Array.from({ length: 24 }).map((_, hour) => (
          <div key={hour} className="grid grid-cols-8 border-b">
            <div className="py-2 px-2 text-sm text-gray-500">
              {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
            </div>
            
            {weekDays.map((date, dayIndex) => {
              const eventsAtHour = events.filter(event => {
                const eventDate = new Date(event.startTime);
                return (
                  eventDate.getDate() === date.getDate() &&
                  eventDate.getMonth() === date.getMonth() &&
                  eventDate.getFullYear() === date.getFullYear() &&
                  eventDate.getHours() === hour
                );
              });
              
              return (
                <div key={dayIndex} className="py-2 px-1 min-h-[50px] border-l">
                  {eventsAtHour.map(event => (
                    <div 
                      key={event.id} 
                      className="text-xs p-1 mb-1 rounded bg-indigo-100"
                      title={event.title}
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  const renderDayView = () => {
    return (
      <div className="flex flex-col">
        <div className="py-4 text-center font-medium border-b">
          {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
        
        {Array.from({ length: 24 }).map((_, hour) => {
          const eventsAtHour = events.filter(event => {
            const eventDate = new Date(event.startTime);
            return (
              eventDate.getDate() === currentDate.getDate() &&
              eventDate.getMonth() === currentDate.getMonth() &&
              eventDate.getFullYear() === currentDate.getFullYear() &&
              eventDate.getHours() === hour
            );
          });
          
          return (
            <div key={hour} className="flex border-b">
              <div className="py-3 px-4 w-24 text-sm text-gray-500">
                {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
              </div>
              <div className="flex-1 py-2 px-4 min-h-[60px]">
                {eventsAtHour.map(event => (
                  <div 
                    key={event.id} 
                    className="p-2 mb-2 rounded bg-indigo-100"
                  >
                    <div className="font-medium">{event.title}</div>
                    {event.location && (
                      <div className="text-xs text-gray-500">{event.location}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const changeMonth = (increment: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setCurrentDate(newDate);
  };

  const changeWeek = (increment: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (increment * 7));
    setCurrentDate(newDate);
  };

  const changeDay = (increment: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + increment);
    setCurrentDate(newDate);
  };

  if (loading) {
    return <div className="text-center py-8">Loading calendar...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Calendar</h2>
          <p className="text-sm text-gray-500">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={handleSyncWithGoogle}
            disabled={syncing}
            className="px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {syncing ? 'Syncing...' : 'Sync with Google'}
          </button>
          
          <select
            value={view}
            onChange={(e) => setView(e.target.value as any)}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
          </select>
          
          <div className="flex space-x-1">
            <button
              onClick={() => {
                if (view === 'day') changeDay(-1);
                else if (view === 'week') changeWeek(-1);
                else changeMonth(-1);
              }}
              className="p-1 rounded hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              onClick={() => {
                setCurrentDate(new Date());
              }}
              className="px-2 py-1 text-sm border rounded hover:bg-gray-100"
            >
              Today
            </button>
            <button
              onClick={() => {
                if (view === 'day') changeDay(1);
                else if (view === 'week') changeWeek(1);
                else changeMonth(1);
              }}
              className="p-1 rounded hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3">
          {error}
        </div>
      )}
      
      <div className="p-4 overflow-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        {view === 'month' && renderMonthView()}
        {view === 'week' && renderWeekView()}
        {view === 'day' && renderDayView()}
      </div>
    </div>
  );
};

export default CalendarView; 