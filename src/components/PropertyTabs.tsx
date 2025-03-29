import React from 'react';
import { MatterportViewer } from './MatterportViewer';

interface PropertyTabsProps {
  activeTab: 'photos' | '3d-tour' | 'floor-plan';
  setActiveTab: (tab: 'photos' | '3d-tour' | 'floor-plan') => void;
  imageUrl: string;
  matterportId?: string | null;
  floorPlanUrl?: string | null;
}

export function PropertyTabs({ 
  activeTab, 
  setActiveTab, 
  imageUrl, 
  matterportId, 
  floorPlanUrl 
}: PropertyTabsProps) {
  // Determine if tabs should be shown based on data availability
  const showMatterport = Boolean(matterportId);
  const showFloorPlan = Boolean(floorPlanUrl);

  return (
    <div>
      <div className="mb-4">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('photos')}
              className={`${
                activeTab === 'photos'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Photos
            </button>
            {showMatterport && (
              <button
                onClick={() => setActiveTab('3d-tour')}
                className={`${
                  activeTab === '3d-tour'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Visite Virtuelle 3D
              </button>
            )}
            {showFloorPlan && (
              <button
                onClick={() => setActiveTab('floor-plan')}
                className={`${
                  activeTab === 'floor-plan'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Plan 2D
              </button>
            )}
          </nav>
        </div>
      </div>

      <div className="relative h-[400px] rounded-lg overflow-hidden bg-gray-100">
        {activeTab === 'photos' && (
          <img
            src={imageUrl}
            alt="Property"
            className="w-full h-full object-cover"
          />
        )}
        {activeTab === '3d-tour' && showMatterport && matterportId && (
          <div className="w-full h-full">
            <MatterportViewer modelId={matterportId} height="400px" />
          </div>
        )}
        {activeTab === 'floor-plan' && showFloorPlan && floorPlanUrl && (
          <img
            src={floorPlanUrl}
            alt="Floor Plan"
            className="w-full h-full object-contain bg-white"
          />
        )}
      </div>
    </div>
  );
}
