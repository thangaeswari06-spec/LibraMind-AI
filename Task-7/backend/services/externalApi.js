/**
 * LibraMind AI - Task 7
 * External API Integration example (Open Library — no API key required).
 * Demonstrates calling a third-party service, plus basic OAuth notes for
 * services that require it.
 */
const fetch = require("node-fetch");

async function searchOpenLibrary(query) {
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=5`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Open Library request failed: ${res.status}`);
  const data = await res.json();
  return (data.docs || []).map((doc) => ({
    title: doc.title,
    author: (doc.author_name || [])[0] || "Unknown",
    firstPublishYear: doc.first_publish_year
  }));
}

/**
 * OAuth concept notes (for services that require it, e.g. Google Books write
 * access):
 * 1. Redirect the user to the provider's authorization URL with client_id,
 *    redirect_uri, scope, and a CSRF `state` value.
 * 2. Provider redirects back with an authorization `code`.
 * 3. Exchange the code (server-side, with client_secret) for an access_token.
 * 4. Use the access_token in the `Authorization: Bearer <token>` header for
 *    subsequent API calls, and refresh it using the refresh_token when it expires.
 */

module.exports = { searchOpenLibrary };
