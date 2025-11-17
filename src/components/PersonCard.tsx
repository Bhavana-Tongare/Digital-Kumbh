
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LostPersonReport } from '@/types';

interface PersonCardProps {
  person: LostPersonReport;
  isHighlighted?: boolean;
  onViewDetails: (id: string) => void;
}

const PersonCard: React.FC<PersonCardProps> = ({ 
  person, 
  isHighlighted = false,
  onViewDetails
}) => {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    under_review: 'bg-blue-100 text-blue-800 border-blue-200',
    found: 'bg-green-100 text-green-800 border-green-200',
    closed: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const categoryColors = {
    child: 'bg-red-100 text-red-800 border-red-200',
    elderly: 'bg-purple-100 text-purple-800 border-purple-200',
    disabled: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    adult: 'bg-teal-100 text-teal-800 border-teal-200',
  };

  const getTimeDifference = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) { // less than a day
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  return (
    <Card className={`overflow-hidden transition-all duration-300 ${
      isHighlighted ? 'animate-pulse-attention border-2 border-pilgrim-orange' : ''
    }`}>
      <div className="relative">
        {person.photo ? (
          <img 
            src={person.photo} 
            alt={person.name} 
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
        )}
        <div className="absolute top-2 right-2 flex flex-col gap-2">
          <Badge className={statusColors[person.status as keyof typeof statusColors]}>
            {person.status.replace('_', ' ')}
          </Badge>
          {person.category && (
            <Badge className={categoryColors[person.category as keyof typeof categoryColors]}>
              {person.category}
            </Badge>
          )}
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold text-pilgrim-brown">{person.name}</h3>
        <div className="mt-2 space-y-1 text-sm">
          <p><span className="font-medium">Age:</span> {person.age}</p>
          <p><span className="font-medium">Last seen:</span> {person.lastSeenLocation}</p>
          <p><span className="font-medium">Reported:</span> {getTimeDifference(person.createdAt)}</p>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button 
          onClick={() => onViewDetails(person.id)} 
          variant="outline" 
          className="w-full text-pilgrim-orange hover:bg-orange-50 hover:text-pilgrim-orangeDark"
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PersonCard;
