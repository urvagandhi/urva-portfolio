import { verifyAdminSession } from './token.js';

/**
 * Server-side props resolver for the Outreach Telemetry Portal.
 * Enforces HTTP 404 status code cloaking for unauthenticated visitors.
 */
export async function getServerSideProps(context) {
  const { req, res } = context;
  const isAuth = verifyAdminSession(req);

  if (!isAuth && res) {
    res.statusCode = 404;
  }

  return {
    props: {
      initialAuth: Boolean(isAuth)
    }
  };
}
