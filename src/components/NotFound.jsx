

import { Link } from 'react-router-dom';
import NotFoundIllustration from './NotFoundIllustration';

function NotFound() {
  return (
    <div className="pb-4">
      <div style={{ maxWidth: 220, margin: '0 auto' }}>
        <NotFoundIllustration />
      </div>
      <h1>404 – Page Not Found</h1>
        <p className="text-secondary fs-5">Oops! The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link className="btn btn-dark" to="/">Go Home</Link>
    </div>
  )
}

export default NotFound
