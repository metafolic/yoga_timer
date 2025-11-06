function handler(event) {
  var request = event.request;
  var host = request.headers.host.value;
  var uri = request.uri;

  // Redirect www to non-www
  if (host === "www.yogaclock.com") {
    return {
      statusCode: 301,
      statusDescription: "Moved Permanently",
      headers: {
        location: { value: "https://yogaclock.com" + uri },
      },
    };
  }

  // Handle old Netlify domain redirects (if someone accesses via CloudFront directly)
  if (host.includes("cloudfront.net") || host.includes("netlify.app")) {
    return {
      statusCode: 301,
      statusDescription: "Moved Permanently",
      headers: {
        location: { value: "https://yogaclock.com" + uri },
      },
    };
  }

  // Handle SPA routing - redirect all non-file requests to index.html
  // Check if the request is for a file (has an extension)
  if (!uri.includes(".") && uri !== "/") {
    request.uri = "/index.html";
  }

  return request;
}
