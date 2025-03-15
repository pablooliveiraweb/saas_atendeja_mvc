import React, { createContext, useContext, useState, useEffect } from 'react';

interface RestaurantContextData {
  isOpen: boolean;
  themeColor: string;
  setIsOpen: (isOpen: boolean) => void;
  setThemeColor: (color: string) => void;
}

const RestaurantContext = createContext<RestaurantContextData>({} as RestaurantContextData);

export const RestaurantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [themeColor, setThemeColor] = useState('#3182ce');

  return (
    <RestaurantContext.Provider
      value={{
        isOpen,
        themeColor,
        setIsOpen,
        setThemeColor,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
}; 