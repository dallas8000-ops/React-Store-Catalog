// src/components/DebugPanel.jsx
import React, { useState, useEffect } from 'react';
import { getAvailableImages } from '../utils/imageScanner';
import { refreshItems, getItems } from '../services/itemService';

const DebugPanel = () => {
  const [images, setImages] = useState({});
  const [items, setItems] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Use getItems() to fetch items data
    getItems().then(itemsData => {
      setItems(itemsData);
    });
  }, []);

  useEffect(() => {
    // setImages should only be called after mount, not synchronously
    setTimeout(() => {
      setImages(getAvailableImages());
    }, 0);
  }, []);

  const handleRefresh = () => {
    refreshItems();
    const availableImages = getAvailableImages();
    setImages(availableImages);
    
    getItems().then(itemsData => {
      setItems(itemsData);
    });
  };

  return (
    <div className={`debug-panel ${isExpanded ? 'expanded' : ''}`}>
      <button 
        className="debug-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? '🔧 Hide Debug' : '🔧 Show Debug'}
      </button>
      
      {isExpanded && (
        <div className="debug-content">
          <button onClick={handleRefresh} className="refresh-button">
            🔄 Refresh Items
          </button>
          
          <h4>Available Images:</h4>
          <pre>{JSON.stringify(images, null, 2)}</pre>
          
          <h4>Items with Image Paths:</h4>
          <pre>{JSON.stringify(items.map(item => ({ 
            name: item.name, 
            image: item.image 
          })), null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default DebugPanel;

