import { Routes, Route, BrowserRouter, Link } from 'react-router-dom';
import { PublicLayout } from '../components/layout/public/PublicLayout';
import { Login } from '../components/user/Login';
import { Register } from '../components/user/Register';
import { PrivateLayout } from '../components/layout/private/PrivateLayout';
import { Feed } from '../components/publication/Feed';
import { AuthProvider } from '../context/AuthProvider';
import { Logout } from '../components/user/Logout';
import { People } from '../components/user/People';
import { Settings } from '../components/user/Settings';
import { Following } from '../components/follow/Following';
import { Followers } from '../components/follow/Followers';
import { Profile } from '../components/user/Profile';

export const Routing = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<PublicLayout />}>
            <Route element={<Login />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
          </Route>
          <Route path="/social" element={<PrivateLayout />}>
            <Route element={Feed} />
            <Route path="feed" element={<Feed />} />
            <Route path="logout" element={<Logout />} />
            <Route path="people" element={<People />} />
            <Route path="settings" element={<Settings />} />
            <Route path="following/:userId" element={<Following />} />
            <Route path="followers/:userId" element={<Followers />} />
            <Route path="profile/:userId" element={<Profile />} />
          </Route>
          <Route path="*" element={
            <div>
              <h1>Error 404</h1>
              <p><Link to="/">Return to login</Link></p>
            </div>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};
