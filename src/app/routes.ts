import { createBrowserRouter } from 'react-router';
import Root from './layout/Root';
import Home from './pages/Home';
import Collection from './pages/Collection';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import Login from './pages/Login';
import Search from './pages/Search';
import Appointment from './pages/Appointment';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductForm from './pages/admin/AdminProductForm';
export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: 'collection', Component: Collection },
      { path: 'product/:id', Component: ProductDetail },
      { path: 'cart', Component: Cart },
      { path: 'checkout', Component: Checkout },
      { path: 'order-confirmation', Component: OrderConfirmation },
      { path: 'profile', Component: Profile },
      { path: 'wishlist', Component: Wishlist },
      { path: 'login', Component: Login },
      { path: 'search', Component: Search },
      { path: 'appointment', Component: Appointment },
    ],
  },
  { path: '/admin', Component: AdminLogin },
  {
    path: '/admin/products',
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminProducts },
      { path: 'new', Component: AdminProductForm },
      { path: ':id/edit', Component: AdminProductForm },
    ],
  },
]);
