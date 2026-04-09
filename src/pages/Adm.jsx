import { useState } from 'react';
import '../styles/Admin.css';

import { IconUserShield } from '@tabler/icons-react';

function Adm() {
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState('');
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productImage, setProductImage] = useState('');
  const [coupons, setCoupons] = useState([]);
  const [products, setProducts] = useState([]);

  const handleAddCoupon = (e) => {
    e.preventDefault();
    if (couponCode && couponDiscount) {
      setCoupons([...coupons, { code: couponCode, discount: couponDiscount }]);
      setCouponCode('');
      setCouponDiscount('');
    }
  };
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (productName && productPrice && productCategory && productImage) {
      setProducts([...products, { name: productName, price: productPrice, category: productCategory, image: productImage }]);
      setProductName('');
      setProductPrice('');
      setProductCategory('');
      setProductImage('');
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    // Hardcoded credentials
    if (username === 'admin' && password === 'password') {
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('Invalid username or password');
    }
  };

  const handleDeleteCoupon = (index) => {
    setCoupons(coupons.filter((_, i) => i !== index));
  };

  const handleDeleteProduct = (index) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  if (!isLoggedIn) {
    return (
      <main className="admin-container">
        <section className="admin-header">
          <h1>Admin Login</h1>
        </section>
        <section className="admin-content">
          <form onSubmit={handleLogin} className="admin-form" style={{maxWidth: 400, margin: '0 auto'}}>
            <div className="form-group mb-3">
              <label htmlFor="username" className="form-label">Username</label>
              <input
                type="text"
                id="username"
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>
            <div className="form-group mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                id="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            {loginError && <div className="alert alert-danger">{loginError}</div>}
            <button type="submit" className="btn btn-primary w-100">Login</button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-container">
      <section className="admin-header">
        <h1>Admin Dashboard <IconUserShield size={32} color="#E94F37" style={{verticalAlign: 'middle', marginLeft: 8}} /></h1>
      </section>

      <section className="admin-content">
        <div className="d-flex gap-4">
          <section className="w-50">
            <div className="card mb-4">
              <div className="card-header bg-primary text-white">
                <h2 className="card-title mb-0">Manage Coupons</h2>
              </div>
              <div className="card-body">
                <form onSubmit={handleAddCoupon} className="admin-form">
                  <div className="form-group mb-3">
                    <label htmlFor="couponCode" className="form-label">Coupon Code</label>
                    <input 
                      type="text" 
                      id="couponCode"
                      className="form-control" 
                      placeholder="Enter coupon code (e.g., SAVE20)" 
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                  </div>
                  <div className="form-group mb-3">
                    <label htmlFor="couponDiscount" className="form-label">Discount (%)</label>
                    <input 
                      type="number" 
                      id="couponDiscount"
                      className="form-control" 
                      placeholder="Enter discount percentage" 
                      value={couponDiscount}
                      onChange={(e) => setCouponDiscount(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary">Add Coupon</button>
                </form>

                <div className="mt-4">
                  <h3>Active Coupons</h3>
                  {coupons.length > 0 ? (
                    <table className="table table-striped table-sm">
                      <thead>
                        <tr>
                          <th>Code</th>
                          <th>Discount</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {coupons.map((coupon, index) => (
                          <tr key={index}>
                            <td>{coupon.code}</td>
                            <td>{coupon.discount}%</td>
                            <td>
                              <button 
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDeleteCoupon(index)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-muted">No coupons added yet.</p>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="w-50">
            <div className="card mb-4">
              <div className="card-header bg-success text-white">
                <h2 className="card-title mb-0">Manage Products</h2>
              </div>
              <div className="card-body">
                <form onSubmit={handleAddProduct} className="admin-form">
                  <div className="form-group mb-3">
                    <label htmlFor="productName" className="form-label">Product Name</label>
                    <input 
                      type="text" 
                      id="productName"
                      className="form-control" 
                      placeholder="Enter product name" 
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                    />
                  </div>
                  <div className="form-group mb-3">
                    <label htmlFor="productPrice" className="form-label">Price ($)</label>
                    <input 
                      type="number" 
                      id="productPrice"
                      className="form-control" 
                      placeholder="Enter product price" 
                      value={productPrice}
                      onChange={(e) => setProductPrice(e.target.value)}
                    />
                  </div>
                  <div className="form-group mb-3">
                    <label htmlFor="productCategory" className="form-label">Category</label>
                    <input 
                      type="text" 
                      id="productCategory"
                      className="form-control" 
                      placeholder="Enter product category" 
                      value={productCategory}
                      onChange={(e) => setProductCategory(e.target.value)}
                    />
                  </div>
                  <div className="form-group mb-3">
                    <label htmlFor="productImage" className="form-label">Image (URL)</label>
                    <input 
                      type="text" 
                      id="productImage"
                      className="form-control" 
                      placeholder="Enter product image URL" 
                      value={productImage}
                      onChange={(e) => setProductImage(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn btn-success">Add Product</button>
                </form>

                <div className="mt-4">
                  <h3>Products</h3>
                  {products.length > 0 ? (
                    <table className="table table-striped table-sm">
                      <thead>
                        <tr>
                          <th>Image</th>
                          <th>Name</th>
                          <th>Price</th>
                          <th>Category</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product, index) => (
                          <tr key={index}>
                            <td>
                              <img src={product.image} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                            </td>
                            <td>{product.name}</td>
                            <td>${product.price}</td>
                            <td>{product.category}</td>
                            <td>
                              <button 
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDeleteProduct(index)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-muted">No products added yet.</p>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>

      </section>
    </main>
  );
}

export default Adm;
