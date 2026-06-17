import React, { useState } from 'react';
import { cn } from '../../lib/utils';

interface TabsProps {
  tabs: { label: string; content: React.ReactNode }[];
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, className }) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className={cn("flex flex-col w-full", className)}>
      <div className="flex border-b border-border overflow-x-auto hide-scrollbar">
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={cn(
              "px-4 py-2 font-medium text-sm whitespace-nowrap transition-colors",
              activeTab === index
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            )}
            onClick={() => setActiveTab(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="p-4 bg-card mt-2 rounded-b-md">
        {tabs[activeTab].content}
      </div>
    </div>
  );
};
