const express = require('express');
const path = require('path');
const axios = require('axios');
const app = express();

// 정적 파일(HTML, CSS, JS 등)을 제공하기 위해 express.static 미들웨어를 사용합니다.
// 이 예에서는 루트 디렉토리에 있는 'public' 폴더에 정적 파일을 넣으시면 됩니다.

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'public', 'design.html'));
});

app.get('/api', async (req, res) => {
    try {
        console.log(req.query.url)
      const response = await axios.get(req.query.url);
      res.send(response.data);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error occurred while fetching data from external API');
    }
  });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));