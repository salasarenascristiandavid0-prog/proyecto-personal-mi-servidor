const express = require('express');
const axios = require('axios');
const fs = require('fs');
const template = require('./template');
const app = express();

const PORT = 3000;
const CACHE_FILE = './cache_tendencias.json';

app.get('/favicon.ico', (req, res) => res.status(204).end());

// Ruta para el despliegue de opciones (Imprescindible para el buscador)
app.get('/api/search', async (req, res) => {
    const q = req.query.q;
    if (!q || q.length < 3) return res.json([]);
    try {
        const response = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&limit=6`);
        res.json(response.data.data);
    } catch (e) { res.json([]); }
});

app.get('/', async (req, res) => {
    try {
        let tendencias;
        if (fs.existsSync(CACHE_FILE) && (Date.now() - JSON.parse(fs.readFileSync(CACHE_FILE)).lastUpdate < 600000)) {
            tendencias = JSON.parse(fs.readFileSync(CACHE_FILE)).data;
        } else {
            const resp = await axios.get('https://api.jikan.moe/v4/top/anime?limit=20');
            tendencias = resp.data.data;
            fs.writeFileSync(CACHE_FILE, JSON.stringify({ data: tendencias, lastUpdate: Date.now() }));
        }
        const hero = tendencias[Math.floor(Math.random() * tendencias.length)];
        res.send(template.renderHome(hero, tendencias));
    } catch (e) { res.send("Error al cargar."); }
});

app.get('/search', async (req, res) => {
    const q = req.query.q;
    try {
        const resp = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&limit=24`);
        res.send(template.renderSearchResults(q, resp.data.data));
    } catch (e) { res.send("Error."); }
});

app.get('/anime/:id', async (req, res) => {
    try {
        const resp = await axios.get(`https://api.jikan.moe/v4/anime/${req.params.id}`);
        const a = resp.data.data;
        const links = [{ name: '🟠 Crunchyroll', url: `https://www.crunchyroll.com/search?q=${encodeURIComponent(a.title)}` }];
        res.send(template.renderDetail(a, links));
    } catch (e) { res.send("No encontrado."); }
});

app.listen(PORT, () => console.log(`🚀 Premium App en http://localhost:${PORT}`));

