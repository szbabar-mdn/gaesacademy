GAES Website
============
1. Extract this zip.
2. Upload ALL files/folders (index.html, css/, js/, images/) to your hosting's public_html (or www) folder.
3. Open your domain - done.

Structure
  index.html      page content
  css/style.css   all styling
  js/main.js      slider (10s auto-change), menu, animations, forms
  images/         favicon (put your own photos here if you want to self-host)

Change slider speed: js/main.js -> INTERVAL = 10000 (milliseconds).
Change photos: edit the background-image URLs in the .slide divs in index.html
(e.g. url('images/my-photo.jpg')).
Forms are demo-only (show a success message). Connect them to your email/backend to receive submissions.
