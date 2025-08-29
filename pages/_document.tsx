// pages/_document.tsx
import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="es">
        <Head>
          {/* Aquí cargarás el script de tsParticles desde un CDN */}
          {/* Asegúrate de que la URL del CDN sea la correcta y estable */}
          <script
            src="https://cdn.jsdelivr.net/npm/@tsparticles/tsparticles@3.x.x/tsparticles.bundle.min.js"
            async // Carga asíncrona para no bloquear el renderizado
          ></script>
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;