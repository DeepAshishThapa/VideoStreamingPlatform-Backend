<h1 align="center"> VideoTube API — Scalable Video Platform Backend</h1>

<p align="center">
  VideoTube API is a production-style backend for a video streaming and social interaction platform.
  <br>
  <strong>Designed to explore real-world backend architecture, authentication workflows, media handling, and scalable REST API design.</strong>
</p>

<hr>

<h2>🚀 Features</h2>

<h3>🎥 Video Management</h3>
<ul>
  <li>Upload videos with thumbnail support</li>
  <li>Video publishing and metadata management</li>
  <li>View count tracking</li>
  <li>Video listing with pagination and sorting</li>
</ul>

<h3>🔐 Authentication System</h3>
<ul>
  <li>Secure user registration and login</li>
  <li>JWT-based authentication</li>
  <li>Access & refresh token flow</li>
  <li>Cookie-based session management</li>
</ul>

<h3>💬 Comment System</h3>
<ul>
  <li>Users can comment on videos</li>
  <li>Supports full CRUD operations for comments</li>
</ul>

<h3>👍 Like System</h3>
<ul>
  <li>Users can like videos</li>
  <li>Toggle like functionality</li>
  <li>Like counts for videos</li>
</ul>

<h3>📺 Channel Subscriptions</h3>
<ul>
  <li>Subscribe / unsubscribe to channels</li>
  <li>Get subscriber list</li>
  <li>Get channels a user follows</li>
</ul>

<h3>📂 Playlist System</h3>
<ul>
  <li>Create playlists</li>
  <li>Add or remove videos</li>
  <li>Update and delete playlists</li>
  <li>Retrieve playlists by user</li>
</ul>

<h3>🐦 Tweet-Style Posts</h3>
<ul>
  <li>Users can create short text posts</li>
  <li>Supports CRUD operations</li>
  <li>Fetch tweets by user</li>
</ul>

<h3>📊 Creator Dashboard</h3>
<ul>
  <li>Channel statistics</li>
  <li>Total videos</li>
  <li>Total subscribers</li>
  <li>Total likes and views</li>
</ul>

<hr>

<h2>🔧 Engineering Decisions & Learnings</h2>

<ul>

<li>
Implemented <strong>JWT-based authentication</strong> with access and refresh tokens to ensure secure user sessions and scalable authentication workflows.
</li>

<li>
Designed a modular backend architecture using <strong>controllers, models, routes, and middlewares</strong> to maintain separation of concerns and scalability.
</li>

<li>
Integrated <strong>Cloudinary</strong> for handling video thumbnails and media uploads efficiently.
</li>

<li>
Used <strong>Mongoose aggregation pipelines</strong> to calculate metrics such as video views, subscriber counts, and likes for dashboard analytics.
</li>

<li>
Implemented reusable utilities such as <strong>ApiError and ApiResponse</strong> to standardize error handling and API responses across the application.
</li>

<li>
Structured APIs with pagination and filtering to ensure scalability for large datasets.
</li>

</ul>

<hr>

<h2>🧩 Tech Stack Used</h2>

<table>
<tr>
<td><strong>Backend Framework</strong></td>
<td>Node.js + Express.js</td>
</tr>

<tr>
<td><strong>Database</strong></td>
<td>MongoDB</td>
</tr>

<tr>
<td><strong>ODM</strong></td>
<td>Mongoose</td>
</tr>

<tr>
<td><strong>Authentication</strong></td>
<td>JWT (jsonwebtoken)</td>
</tr>

<tr>
<td><strong>Password Hashing</strong></td>
<td>bcrypt</td>
</tr>

<tr>
<td><strong>File Upload</strong></td>
<td>Multer</td>
</tr>

<tr>
<td><strong>Media Storage</strong></td>
<td>Cloudinary</td>
</tr>

<tr>
<td><strong>Pagination</strong></td>
<td>mongoose-aggregate-paginate-v2</td>
</tr>

<tr>
<td><strong>Other Tools</strong></td>
<td>dotenv, cors, cookie-parser</td>
</tr>

</table>

<hr>

<h2>📂 Project Architecture</h2>

<pre>
src
│
├── controllers
│   ├── user.controller.js
│   ├── video.controller.js
│   ├── comment.controller.js
│   ├── like.controller.js
│   ├── playlist.controller.js
│   ├── subscription.controller.js
│   ├── dashboard.controller.js
│   └── tweet.controller.js
│
├── models
│   ├── user.model.js
│   ├── video.model.js
│   ├── comment.model.js
│   ├── like.model.js
│   ├── playlist.model.js
│   ├── subscription.model.js
│   └── tweet.model.js
│
├── routes
│   ├── user.routes.js
│   ├── video.routes.js
│   ├── comment.routes.js
│   ├── like.routes.js
│   ├── playlist.routes.js
│   ├── subscription.routes.js
│   ├── dashboard.routes.js
│   └── tweet.routes.js
│
├── middlewares
│   ├── auth.middleware.js
│   ├── multer.middleware.js
│   └── error.middleware.js
│
├── utils
│   ├── ApiError.js
│   ├── ApiResponse.js
│ 
│
└── app.js
</pre>

<hr>

<h2>⚙️ Setup Instructions</h2>

<h3>1️⃣ Clone the repository</h3>

<pre>
git clone https://github.com/DeepAshishThapa/VideoStreamingPlatform-Backend.git
</pre>

<pre>
cd project1
</pre>

<h3>2️⃣ Install dependencies</h3>

<pre>
npm install
</pre>

<h3>3️⃣ Create environment variables</h3>

Create a <code>.env</code> file in the root directory.

<pre>
PORT=8000

MONGODB_URI=your_mongodb_connection_string

CORS_ORIGIN=*

ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d

REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=7d

CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_SECRET_KEY=your_cloudinary_secret
</pre>

<h3>4️⃣ Start development server</h3>

<pre>
npm run dev
</pre>

<hr>

<h2>📜 License</h2>

<p>This project is open source and available under the MIT License.</p>

<hr>

<h2>✨ Author</h2>

<p><strong>Deep Ashish</strong> — Software Developer</p>

<p>GitHub: <a href="https://github.com/DeepAshishThapa">DeepAshishThapa</a></p>