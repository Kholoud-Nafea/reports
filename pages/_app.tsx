import type { AppProps } from 'next/app'

import "bootstrap-v4-rtl/dist/css/bootstrap-rtl.min.css";
import 'react-datasheet/lib/react-datasheet.css';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/globals.css'

import ProjectsProvider from '../context/projects';

function MyApp({ Component, pageProps }: AppProps) {
  return(
    <ProjectsProvider>
      <Component {...pageProps} />
    </ProjectsProvider>
  )
}
export default MyApp
