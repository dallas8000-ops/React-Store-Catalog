import React, { useEffect, useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconDeviceImac } from '@tabler/icons-react';
import { getItems } from '../services/itemService';
import ItemCard from './ItemCard';
import ProductModal from './ProductModal';
import '../styles/Catalog.css';

import GlobalContext from '../state/globalContext';

const Catalog = ({ setItems: setParentItems, items: _parentItems }) => {
  const { cart, addProductToCart, removeProductFromCart } = useContext(GlobalContext);
  const [items, setItems] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [modalProduct, setModalProduct] = useState(null);
  const [modalIndex, setModalIndex] = useState(null);

  // Open modal with index
  const openModal = (item, idx) => {
    setModalProduct(item);
    setModalIndex(idx);
  };

  // Keyboard navigation for modal
  React.useEffect(() => {
    if (modalProduct == null) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setModalProduct(null);
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line
  }, [modalProduct, modalIndex, items]);

  // Flat list of all products for modal navigation
  const flatItems = React.useMemo(() => items, [items]);
  const handlePrev = () => {
    if (modalIndex == null || flatItems.length < 2) return;
    const prevIdx = (modalIndex - 1 + flatItems.length) % flatItems.length;
    setModalProduct(flatItems[prevIdx]);
    setModalIndex(prevIdx);
  };
  const handleNext = () => {
    if (modalIndex == null || flatItems.length < 2) return;
    const nextIdx = (modalIndex + 1) % flatItems.length;
    setModalProduct(flatItems[nextIdx]);
    setModalIndex(nextIdx);
  };

  useEffect(() => {
    getItems().then((data) => {
      console.log('Catalog received items:', data);
      setItems(data);
      if (setParentItems) {
        setParentItems(data);
      }
    }).catch(err => console.error('Error loading items:', err));
  }, [setParentItems]);

  const handleEditItem = (item) => {
    setEditingItem({ ...item });
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    const updatedItems = items.map((item) =>
      item.id === editingItem.id ? editingItem : item
    );
    setItems(updatedItems);
    setParentItems(updatedItems);
    setIsEditing(false);
    setEditingItem(null);
  };

  const handleDeleteItem = (id) => {
    const updatedItems = items.filter((item) => item.id !== id);
    setItems(updatedItems);
    setParentItems(updatedItems);
  };

  return (
    <main className="catalog">
      <div className="catalog-header">
        <h2>Our Products <IconDeviceImac size={28} color="#43AA8B" style={{verticalAlign: 'middle', marginLeft: 8}} /></h2>
        <button
          className="edit-mode-toggle"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? '✓ Done Editing' : '✎ Edit Catalog'}
        </button>
      </div>

      {isEditing && editingItem && (
        <div className="edit-panel">
          <h3>Edit Item: {editingItem.name}</h3>
          <div className="edit-form">
            <label>
              Name:
              <input
                type="text"
                value={editingItem.name}
                onChange={(e) =>
                  setEditingItem({ ...editingItem, name: e.target.value })
                }
              />
            </label>
            <label>
              Description:
              <input
                type="text"
                value={editingItem.description}
                onChange={(e) =>
                  setEditingItem({ ...editingItem, description: e.target.value })
                }
              />
            </label>
            <label>
              Price:
              <input
                type="number"
                step="0.01"
                value={editingItem.price}
                onChange={(e) =>
                  setEditingItem({
                    ...editingItem,
                    price: parseFloat(e.target.value),
                  })
                }
              />
            </label>
            <label>
              Old Price (for discounts):
              <input
                type="number"
                step="0.01"
                value={editingItem.oldPrice || ''}
                onChange={(e) =>
                  setEditingItem({
                    ...editingItem,
                    oldPrice: e.target.value ? parseFloat(e.target.value) : null,
                  })
                }
              />
            </label>
            <label>
              Discount (%):
              <input
                type="number"
                value={editingItem.discount || ''}
                onChange={(e) =>
                  setEditingItem({
                    ...editingItem,
                    discount: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
              />
            </label>
            <div className="edit-buttons">
              <button className="save-btn" onClick={handleSaveEdit}>
                Save Changes
              </button>
              <button
                className="cancel-btn"
                onClick={() => {
                  setEditingItem(null);
                  setIsEditing(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid">
        {items.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
            <p>Loading products...</p>
          </div>
        ) : (
          // Group items by date
          Object.entries(
            items.reduce((acc, item) => {
              acc[item.date] = acc[item.date] || [];
              acc[item.date].push(item);
              return acc;
            }, {})
          ).map(([date, group]) => (
            <div key={date} className="catalog-date-group">
              <div className="catalog-date-header">
                <span className="catalog-date">{date}</span>
                <span className="catalog-badge">{group.length}</span>
              </div>
              <motion.div
                className="catalog-date-grid"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.13,
                    },
                  },
                }}
              >
                <AnimatePresence>
                  {group.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      className="item-card-wrapper"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 30 }}
                      transition={{ duration: 0.45, delay: idx * 0.07 }}
                    >
                      <div onClick={() => openModal(item, flatItems.findIndex(i => i.id === item.id))} style={{cursor: 'pointer'}}>
                        <ItemCard item={item} cart={cart} addProductToCart={addProductToCart} removeProductFromCart={removeProductFromCart} />
                      </div>
                      {isEditing && (
                        <div className="item-edit-controls">
                          <button
                            className="edit-btn"
                            onClick={() => handleEditItem(item)}
                          >
                            Edit
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </div>
          ))
        )}
      </div>
    <ProductModal product={modalProduct} onClose={() => setModalProduct(null)} onPrev={flatItems.length > 1 ? handlePrev : undefined} onNext={flatItems.length > 1 ? handleNext : undefined} />
  </main>
  );
};

export default Catalog;