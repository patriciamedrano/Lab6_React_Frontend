import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const [loggedIn, setLoggedIn] = useState(
    !!localStorage.getItem('access_token')
  )

  const [products, setProducts] = useState([])

  const [productName, setProductName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState('')

  const [editingId, setEditingId] = useState(null)

  const fetchProducts = async () => {
    const token = localStorage.getItem('access_token')

    try {
      const response = await fetch('https://lab6-medrano-lavalust-api.onrender.com/products', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (response.ok) {
        setProducts(data.data || [])
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    if (loggedIn) {
      fetchProducts()
    }
  }, [loggedIn])

  const handleLogin = async (e) => {
    e.preventDefault()

    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('https://lab6-medrano-lavalust-api.onrender.com/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.error || 'Login failed.')
        return
      }

      localStorage.setItem('access_token', data.tokens.access_token)
      localStorage.setItem('refresh_token', data.tokens.refresh_token)
      localStorage.setItem('user', JSON.stringify(data.user))

      setLoggedIn(true)
      setMessage('')
    } catch (error) {
      console.error(error)
      setMessage('Cannot connect to the API.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitProduct = async (e) => {
    e.preventDefault()

    const token = localStorage.getItem('access_token')

    const productData = {
      product_name: productName,
      description,
      price,
      quantity,
    }

    try {
      let response

      if (editingId) {
        response = await fetch(
          `https://lab6-medrano-lavalust-api.onrender.com/products/${editingId}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(productData),
          }
        )
      } else {
        response = await fetch(
          'https://lab6-medrano-lavalust-api.onrender.com/products',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(productData),
          }
        )
      }

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.error || 'Operation failed.')
        return
      }

      setMessage(
        editingId
          ? 'Product updated successfully!'
          : 'Product added successfully!'
      )

      setProductName('')
      setDescription('')
      setPrice('')
      setQuantity('')
      setEditingId(null)

      fetchProducts()
    } catch (error) {
      console.error(error)
      setMessage('Cannot connect to the API.')
    }
  }

  const handleEdit = (product) => {
    setEditingId(product.id)
    setProductName(product.product_name)
    setDescription(product.description)
    setPrice(product.price)
    setQuantity(product.quantity)

    document
      .getElementById('product-form')
      ?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this product?'
    )

    if (!confirmDelete) return

    const token = localStorage.getItem('access_token')

    try {
      const response = await fetch(
        `https://lab6-medrano-lavalust-api.onrender.com/products/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.error || 'Delete failed.')
        return
      }

      setMessage('Product deleted successfully!')
      fetchProducts()
    } catch (error) {
      console.error(error)
      setMessage('Cannot connect to the API.')
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setProductName('')
    setDescription('')
    setPrice('')
    setQuantity('')
  }

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refresh_token')

    try {
      await fetch('https://lab6-medrano-lavalust-api.onrender.com/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: refreshToken,
        }),
      })
    } catch (error) {
      console.error(error)
    }

    localStorage.clear()

    setLoggedIn(false)
    setProducts([])
    setMessage('')
  }

  const scrollToProducts = () => {
    document
      .getElementById('product-list')
      ?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToAddProduct = () => {
    document
      .getElementById('product-form')
      ?.scrollIntoView({ behavior: 'smooth' })
  }

  if (loggedIn) {
    return (
      <div className="app-layout">

        {/* SIDEBAR */}
        <aside className="sidebar">
          <div>
            <div className="sidebar-brand">
              <div className="brand-icon">♡</div>

              <div>
                <h2>Product</h2>
                <span>Manager</span>
              </div>
            </div>

            <nav className="sidebar-menu">
              <button
                className="menu-item active"
                onClick={() =>
                  window.scrollTo({
                    top: 0,
                    behavior: 'smooth',
                  })
                }
              >
                <span>⌂</span>
                Dashboard
              </button>

              <button
                className="menu-item"
                onClick={scrollToProducts}
              >
                <span>▦</span>
                Products
              </button>

              <button
                className="menu-item"
                onClick={scrollToAddProduct}
              >
                <span>＋</span>
                Add Product
              </button>
            </nav>
          </div>

          <button
            className="sidebar-logout"
            onClick={handleLogout}
          >
            <span>↪</span>
            Logout
          </button>
        </aside>

        {/* MAIN CONTENT */}
        <main className="main-content">

          <header className="top-header">
            <div>
              <p className="welcome-text">Welcome back ♡</p>
              <h1>Product Dashboard</h1>
              <p className="header-description">
                Manage and organize your products easily.
              </p>
            </div>

            <div className="profile-circle">
              PM
            </div>
          </header>

          {/* SUMMARY CARDS */}
          <section className="summary-grid">

          </section>

          {/* ADD / EDIT PRODUCT */}
          <section
            className="content-card"
            id="product-form"
          >
            <div className="section-title">
              <div>
                <span className="section-label">
                  PRODUCT FORM
                </span>

                <h2>
                  {editingId
                    ? 'Edit Product'
                    : 'Add New Product'}
                </h2>
              </div>

              <div className="title-decoration">
                ♡
              </div>
            </div>

            <form
              className="product-form"
              onSubmit={handleSubmitProduct}
            >
              <div className="input-group">
                <label>Product Name</label>

                <input
                  type="text"
                  placeholder="Enter product name"
                  value={productName}
                  onChange={(e) =>
                    setProductName(e.target.value)
                  }
                  required
                />
              </div>

              <div className="input-group">
                <label>Description</label>

                <input
                  type="text"
                  placeholder="Enter description"
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                />
              </div>

              <div className="input-group">
                <label>Price</label>

                <input
                  type="number"
                  step="0.01"
                  placeholder="₱ 0.00"
                  value={price}
                  onChange={(e) =>
                    setPrice(e.target.value)
                  }
                  required
                />
              </div>

              <div className="input-group">
                <label>Quantity</label>

                <input
                  type="number"
                  placeholder="0"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(e.target.value)
                  }
                  required
                />
              </div>

              <div className="form-actions">
                <button
                  className="primary-button"
                  type="submit"
                >
                  {editingId
                    ? 'Update Product'
                    : 'Add Product'}
                </button>

                {editingId && (
                  <button
                    className="cancel-button"
                    type="button"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            {message && (
              <div className="message">
                ♡ {message}
              </div>
            )}
          </section>

          {/* PRODUCT LIST */}
          <section
            className="content-card"
            id="product-list"
          >
            <div className="section-title">
              <div>
                <span className="section-label">
                  INVENTORY
                </span>

                <h2>Product List</h2>
              </div>

              <span className="product-badge">
                {products.length}{' '}
                {products.length === 1
                  ? 'Product'
                  : 'Products'}
              </span>
            </div>

            {products.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  ♡
                </div>

                <h3>No products yet</h3>

                <p>
                  Add your first product using the
                  form above.
                </p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Product Name</th>
                      <th>Description</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td>
                          <span className="id-badge">
                            #{product.id}
                          </span>
                        </td>

                        <td className="product-name">
                          {product.product_name}
                        </td>

                        <td>
                          {product.description}
                        </td>

                        <td className="price-text">
                          ₱{product.price}
                        </td>

                        <td>
                          <span className="quantity-badge">
                            {product.quantity}
                          </span>
                        </td>

                        <td>
                          <div className="action-buttons">
                            <button
                              className="edit-button"
                              onClick={() =>
                                handleEdit(product)
                              }
                            >
                              Edit
                            </button>

                            <button
                              className="delete-button"
                              onClick={() =>
                                handleDelete(product.id)
                              }
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

        </main>
      </div>
    )
  }

  return (
    <div className="login-page">

      <div className="login-card">

        <div className="login-icon">
          ♡
        </div>

        <h1>
          Product Management
          <br />
          System
        </h1>

        <p className="subtitle">
          Welcome! Please login to continue.
        </p>

        <form onSubmit={handleLogin}>

          <div className="form-group">
            <label>Username</label>

            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Logging in...'
              : 'Login'}
          </button>

        </form>

        {message && (
          <p className="message">
            {message}
          </p>
        )}

      </div>
    </div>
  )
}

export default App