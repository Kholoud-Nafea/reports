import Document, { DocumentContext, Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {

    /*
    const originalRenderPage = ctx.renderPage
    ctx.renderPage = () =>
      originalRenderPage({
        // useful for wrapping the whole react tree
        enhanceApp: (App) => App,
        // useful for wrapping in a per-page basis
        enhanceComponent: (Component) => Component,
      })
    */

    const initialProps = await Document.getInitialProps(ctx)
    return initialProps
  }

  render = () => (
    <Html dir={'rtl'} lang={'ar'}>
      <Head />
      <body className="rtl">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

export default MyDocument