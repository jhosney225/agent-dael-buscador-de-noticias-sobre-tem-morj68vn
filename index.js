import https from 'https';
import readline from 'readline';

const API_KEY = 'demo'; // Usando API pública sin key
const BASE_URL = 'https://newsapi.org/v2/everything';

// Crear interfaz para entrada de usuario
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Función para hacer request HTTPS
function fetchNews(query, sortBy = 'popularity') {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      q: query,
      sortBy: sortBy,
      language: 'es',
      pageSize: 10
    }).toString();

    const url = `${BASE_URL}?${params}&apiKey=${API_KEY}`;

    https.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          reject(new Error('Error parsing response'));
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Función para parsear y mostrar noticias
function displayNews(newsData) {
  if (!newsData.articles || newsData.articles.length === 0) {
    console.log('\n❌ No se encontraron noticias para esta búsqueda.\n');
    return;
  }

  console.log(`\n✅ Se encontraron ${newsData.articles.length} noticias:\n`);
  console.log('═'.repeat(80));

  newsData.articles.forEach((article, index) => {
    console.log(`\n📰 NOTICIA ${index + 1}`);
    console.log('─'.repeat(80));
    console.log(`Título: ${article.title}`);
    console.log(`Fuente: ${article.source.name}`);
    console.log(`Fecha: ${new Date(article.publishedAt).toLocaleDateString('es-ES')}`);
    console.log(`Descripción: ${article.description || 'No disponible'}`);
    console.log(`URL: ${article.url}`);
    console.log('─'.repeat(80));
  });

  console.log('\n' + '═'.repeat(80) + '\n');
}

// Función para mostrar estadísticas
function showStats(newsData) {
  if (!newsData.articles || newsData.articles.length === 0) return;

  const sources = {};
  newsData.articles.forEach(article => {
    const source = article.source.name;
    sources[source] = (sources[source] || 0) + 1;
  });

  console.log('\n📊 ESTADÍSTICAS:\n');
  console.log(`Total de noticias: ${newsData.articles.length}`);
  console.log(`Fuentes únicas: ${Object.keys(sources).length}`);
  console.log('\nNoticias por fuente:');
  Object.entries(sources)
    .sort((a, b) => b[1] - a[1])
    .forEach(([source, count]) => {
      console.log(`  • ${source}: ${count}`);
    });
  console.log();
}

// Función principal para buscar
async function searchNews(query) {
  try {
    console.log(`\n🔍 Buscando noticias sobre: "${query}"...\n`);
    const newsData = await fetchNews(query, 'publishedAt');
    displayNews(newsData);
    showStats(newsData);
  } catch (error) {
    console.log(`\n⚠️ Error al buscar noticias: ${error.message}\n`);
  }
}

// Función para mostrar menú
function showMenu() {
  console.log('\n' + '═'.repeat(80));
  console.log('📰 BUSCADOR DE NOTICIAS - VERSIÓN 1.0');
  console.log('═'.repeat(80));
  console.log('\nOpciones:');
  console.log('1. Buscar noticias por tema');
  console.log('2. Ver noticias populares (COVID-19)');
  console.log('3. Ver noticias de tecnología');
  console.log('4. Salir');
  console.log('\n' + '═'.repeat(80) + '\n');
}

// Función principal interactiva
function main() {
  showMenu();

  const askQuestion = () => {
    rl.question('Selecciona una opción (1-4): ', async (choice) => {
      switch (choice.trim()) {
        case '1':
          rl.question('\n¿Qué tema deseas buscar? ', async (topic) => {
            if (topic.trim()) {
              await searchNews(topic.trim());
            } else {
              console.log('Por favor ingresa un tema válido.');
            }
            askQuestion();
          });
          break;
        case '2':
          await searchNews('COVID-19');
          askQuestion();
          break;
        case '3':
          await searchNews('tecnología');
          askQuestion();
          break;
        case '4':
          console.log('\n👋 ¡Hasta luego!\n');
          rl.close();
          break;
        default:
          console.log('\n⚠️ Opción inválida. Intenta de nuevo.\n');
          askQuestion();
      }
    });
  };

  askQuestion();
}

// Iniciar aplicación
main();