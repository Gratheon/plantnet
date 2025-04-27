// Plantnet rootHandler based on user-cycle

export function rootHandler(request, reply) {
    const endpoints = [
        { method: 'GET', path: '/', description: 'This documentation page' },
        { method: 'GET', path: '/health', description: 'Health check endpoint' },
        { method: 'GET', path: '/graphql', description: 'GraphQL playground' }
    ];

    // Logo SVG inline (copied from user-cycle)
    const logoSvg = `<?xml version="1.0" encoding="utf-8"?>
<svg viewBox="0 0 500 147" xmlns="http://www.w3.org/2000/svg">
  <rect x="23.544" y="53.731" width="456.888" height="76.722" style="stroke-linejoin: round; stroke-width: 25px; stroke-linecap: round; stroke: rgb(255, 255, 255); fill: rgb(255, 255, 255);"/>
  <g transform="matrix(1.0060189962387085, 0, 0, 1.0060189962387085, 107.0416259765625, -143.15232849121094)" style="">
    <title>TH</title>
    <g transform="matrix(0.212996, 0, 0, 0.212996, 63.309346, 176.961276)" style="">
      <title>background</title>
      <g display="none" overflow="visible" y="0" x="0" height="100%" width="100%" id="canvasGrid">
        <rect fill="url(#gridpattern)" stroke-width="0" y="0" x="0" height="100%" width="100%" style="stroke-linejoin: round; stroke-linecap: round;"/>
      </g>
    </g>
    <ellipse style="stroke-miterlimit: 4.63; stroke-linejoin: round; stroke: rgb(255, 255, 255); stroke-linecap: round; stroke-width: 0px; fill: rgb(255, 255, 255);" cx="138.961" cy="189.523" rx="44.673" ry="44.673">
      <title>sun-white</title>
    </ellipse>
    <rect x="125.389" y="197.236" width="29.466" height="45.922" style="stroke: rgb(255, 255, 255); stroke-width: 0px; fill: rgb(255, 255, 255);">
      <title>T</title>
    </rect>
    <ellipse style="fill: rgb(255, 217, 0); stroke-miterlimit: 4.63; stroke-linejoin: round; stroke: rgb(255, 255, 255); stroke-linecap: round; stroke-width: 0px;" cx="140.304" cy="189.503" rx="27.555" ry="27.555">
      <title>sun</title>
    </ellipse>
    <g transform="matrix(0.205751, 0, 0, 0.205751, 66.367868, 176.204364)" style="">
      <title>background</title>
      <g display="none" overflow="visible" y="0" x="0" height="100%" width="100%" id="g-1">
        <rect fill="url(#gridpattern)" stroke-width="0" y="0" x="0" height="100%" width="100%" style="stroke-linejoin: round; stroke-linecap: round;"/>
      </g>
    </g>
    <g transform="matrix(0.202842, 0, 0, 0.202842, 65.67714, 176.258807)" style="">
      <title>H</title>
      <line stroke-linecap="undefined" stroke-linejoin="undefined" id="svg_1" y2="444.19325" x2="261.99234" y1="155.15" x1="261.99234" stroke-width="60" fill="none" style="" stroke="#000">
        <title>H-left</title>
      </line>
      <line stroke-linecap="undefined" stroke-linejoin="undefined" id="svg_2" y2="444.69325" x2="472.22333" y1="155.65" x1="472.22333" stroke-width="60" fill="none" style="" stroke="#000">
        <title>H-right</title>
      </line>
      <line stroke-linecap="undefined" stroke-linejoin="undefined" id="svg_3" y2="367.8" x2="471.93503" y1="367.8" x1="261.4" fill-opacity="null" stroke-opacity="null" stroke-width="60" fill="none" style="" stroke="#000">
        <title>H-mid</title>
      </line>
    </g>
    <g style="" transform="matrix(1.044272, 0, 0, 0.590152, -151.248415, 156.969592)">
      <title>T-top</title>
      <rect x="273.694" y="68.839" width="11.729" height="62.841" style="stroke: rgb(255, 255, 255); stroke-width: 0px;">
        <title>T</title>
      </rect>
      <polygon style="stroke-linejoin: round; stroke-linecap: round; stroke: rgb(255, 255, 255); stroke-width: 0px;" points="241.445 52.589 317.147 52.589 306.342 71.902 252.26 71.589">
        <title>T-top</title>
      </polygon>
      <path style="stroke: rgb(255, 255, 255); stroke-width: 0px;" d="M 273.669 127.866 C 276.896 129.308 282.86 129.302 285.54 127.776 L 285.241 135.857 C 280.471 137.573 279.431 137.594 273.877 135.765 L 273.669 127.866 Z"/>
      <path style="fill: rgb(255, 217, 0); stroke: rgb(255, 255, 255); stroke-width: 0px;" d="M 273.587 99.916 C 276.843 101.358 282.865 101.352 285.57 99.826 L 285.568 108.01 C 281.328 109.889 277.859 109.572 273.587 108.21 L 273.587 99.916 Z"/>
      <path style="fill: rgb(255, 217, 0); stroke: rgb(255, 255, 255); stroke-width: 0px;" d="M 273.541 112.015 C 276.797 113.457 282.818 113.451 285.524 111.925 L 285.522 120.109 C 281.282 121.988 277.812 121.671 273.541 120.309 L 273.541 112.015 Z"/>
      <path style="fill: rgb(255, 217, 0); stroke: rgb(255, 255, 255); stroke-width: 0px;" d="M 273.564 124.108 C 276.821 125.55 282.842 125.544 285.547 124.018 L 285.545 132.202 C 281.305 134.081 277.837 133.764 273.564 132.402 L 273.564 124.108 Z"/>
    </g>
    <line style="fill: rgb(216, 216, 216); stroke-linecap: square; stroke: rgb(2, 72, 255); stroke-width: 2.98205px;" x1="114.257" y1="189.503" x2="166.34" y2="189.44"/>
  </g>
  <path d="M 72.769 94.434 L 96.866 94.409 L 96.861 97.886 C 96.804 100.354 96.595 103.36 95.747 106.483 C 95.297 108.141 94.37 110.928 93.155 112.825 C 91.428 115.522 89.632 117.561 87.967 119.027 C 86.454 120.359 84.257 122.294 80.723 123.811 C 77.743 125.09 73.73 126.097 69.212 126.109 C 65.465 126.119 61.047 125.205 57.282 123.539 C 53.23 121.746 49.892 119.108 47.705 116.573 C 43.75 111.989 39.533 105.919 39.466 95.813 C 39.43 90.404 40.711 85.215 42.999 81.098 C 45.937 75.811 50.331 72.107 53.226 70.026 C 57.959 66.625 64.677 64.986 69.932 65.017 C 75.199 65.048 79.24 66.082 83.362 67.938 C 87.531 69.819 90.642 73.152 94.197 76.975 L 87.867 82.925 C 87.236 81.374 83.764 78.247 82.168 77.009 C 80.572 75.771 77.42 74.578 75.748 74.014 C 73.58 73.282 70.081 73.056 66.998 73.51 C 62.01 74.245 58.542 76.144 55.648 78.855 C 52.442 81.858 48.262 87.177 48.262 95.999 C 48.262 104.922 53.816 111.022 56.827 113.133 C 60.007 115.362 64.094 117.786 69.331 117.786 C 74.129 117.786 76.064 116.929 78.579 115.364 C 81.099 113.796 81.702 113.637 84.807 109.695 C 84.807 109.695 86.42 107.116 86.988 104.741 C 87.086 104.33 87.327 102.649 87.327 102.649 L 72.745 102.653 L 72.769 94.434 Z" style="stroke: rgb(255, 255, 255); stroke-width: 0px;"/>
  <path d="M 108.691 66.144 L 121.025 66.19 C 125.347 66.19 131.357 67.497 133.839 69.09 C 137.995 71.757 141.072 76.004 141.423 81.485 C 141.706 85.903 141.769 89.196 137.94 94.055 C 134.111 98.914 130.943 99.162 128.325 99.772 L 146.727 124.957 L 135.884 124.94 L 119.094 100.916 L 117.563 100.731 L 117.368 125.024 L 108.691 125.024 L 108.691 66.144 Z M 117.468 93.184 C 120.544 93.184 121.829 93.499 126.312 92.374 C 130.795 91.249 133.001 87.249 133.001 83.868 C 133.001 82.037 132.876 80.175 131.408 78.255 C 129.94 76.335 127.951 75.622 126.558 75.132 C 125.165 74.642 123.889 74.572 122.444 74.439 C 120.999 74.306 120.369 74.376 119.123 74.376 L 117.462 74.349 L 117.468 93.184 Z" style="stroke: rgb(255, 255, 255); stroke-width: 0px;"/>
  <path d="M 178.495 62.421 L 206.478 125.12 L 196.709 125.089 L 190.651 110.544 L 165.442 110.474 L 158.572 125.072 L 149.406 124.989 L 178.495 62.421 Z M 187.205 102.333 C 187.205 102.333 181.305 89.045 178.315 82.223 C 175.491 88.862 169.149 102.245 169.149 102.245 L 187.205 102.333 Z" style="stroke: rgb(255, 255, 255); stroke-width: 0px;"/>
  <path d="M 297.688 66.304 L 330.142 66.304 L 330.142 74.494 L 306.504 74.494 L 306.504 88.722 L 329.504 88.722 L 329.504 97.012 L 306.504 97.012 L 306.504 116.78 L 330.108 116.78 L 330.108 125.045 L 297.688 125.045 L 297.688 66.304 Z" style="stroke: rgb(255, 255, 255); stroke-width: 0px;"/>
  <path d="M 400.653 96.948 C 400.678 107.346 395.099 114.542 390.058 118.695 C 385.017 122.848 380.947 125.923 370.299 125.923 C 359.105 125.923 352.808 121.733 348.232 117.03 C 343.703 112.428 339.049 104.04 339.575 94.016 C 339.972 86.451 343.022 79.1 349.287 73.395 C 355.811 67.454 361.438 65.098 370.226 65.235 C 379.876 65.385 383.834 68.09 388.378 71.169 C 393.004 74.304 394.727 76.966 396.982 80.739 C 400.136 86.015 400.633 88.519 400.653 96.948 Z M 392.137 97.284 C 392.429 87.093 388.224 82.028 385.545 79.358 C 382.113 75.937 376.225 73.372 370.703 73.372 C 365.18 73.372 359.644 74.894 355.627 79.022 C 351.61 83.15 348.077 86.433 348.077 95.789 C 348.077 104.408 352.954 110.182 355.884 112.649 C 359.081 115.341 364.723 118.023 370.048 118.023 C 375.271 118.023 381.502 115.436 383.657 113.385 C 386.199 110.967 391.874 106.471 392.137 97.284 Z" style="stroke: rgb(255, 255, 255); stroke-width: 0px;"/>
  <path d="M 412.585 62.353 L 455.59 107.297 L 455.68 66.226 L 464.378 66.279 L 464.349 128.492 C 464.349 128.492 421.335 83.531 421.382 83.862 L 421.342 125.014 L 412.524 124.947 L 412.585 62.353 Z" style="stroke: rgb(255, 255, 255); stroke-width: 0px;"/>
</svg>`;

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Plantnet Service API</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; line-height: 1.6; }
            h1 { color: #333; }
            table { border-collapse: collapse; width: 100%; margin-top: 20px; }
            th, td { text-align: left; padding: 12px; border-bottom: 1px solid #ddd; }
            th { background-color: #f2f2f2; }
            tr:hover { background-color: #f5f5f5; }
            .method { font-weight: bold; }
            .get { color: #4CAF50; }
            .post { color: #2196F3; }
            .header { display: flex; flex-direction: column; align-items: center; margin-bottom: 20px; }
        </style>
    </head>
    <body>
        <div class="header" style="display: flex; flex-direction: row; align-items: center;">
            <div style="width:130px; margin-right: 30px;">${logoSvg}</div>
            <h1>Plantnet microservice API</h1>
        </div>
        <p>This service provides plant recognition and related features for Gratheon.com</p>
        
        <h2>Available Endpoints</h2>
        <table>
            <tr>
                <th>Method</th>
                <th>Path</th>
                <th>Description</th>
            </tr>
            ${endpoints.map(endpoint => `
                <tr>
                    <td class="method ${endpoint.method.toLowerCase()}">${endpoint.method}</td>
                    <td><a href="${endpoint.path}">${endpoint.path}</a></td>
                    <td>${endpoint.description}</td>
                </tr>
            `).join('')}
        </table>
    </body>
    </html>
    `;

    reply.type('text/html').send(html);
}
