import React, { ReactNode, useEffect, useState } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import { ToastContainer, toast } from 'react-toastify';

import List from './List';
import { useProjects } from '../context/projects';

type Props = {
  children?: ReactNode;
  title?: string;
  id?: string | string[];
  withMenu?: boolean;
}

const Layout = ({ children, id, withMenu=true, title = 'وكالة المياه' }: Props) => {

  const [hasTerms, setHasTerms] = useState<boolean>(false);
  const { terms, error, success } = useProjects();
  const notifyError = (error: string) =>
    toast.error(
      error as string,
      {autoClose: 3000}
    );
  const notifySuccess = () => toast.success("تم بنجاح", {autoClose: 3000});

  useEffect(() => {
    let err : any = error;
    if(error) notifyError(err.table ? err.table : "حدث خطأ ما");
    if(success) notifySuccess();
  }, [success, error])

  useEffect(() => {
    if(terms.length) terms
      .filter(t => t.projectId === +id!).length ?
        setHasTerms(true) :
        setHasTerms(false) ;
  }, [terms]);

  return(
  <>
    <Head>
      <title>{title}</title>
      <meta charSet="utf-8" />
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
    </Head>
    <ToastContainer />
    <div className="container-fluid px-0 rtl h-100">
      <header>
        <nav className="navbar navbar-light bg-light" id='navbar' >
          <div className="container-fluid">
            <div className='logo'>
            <Link href="/">
              <a className="navbar-brand" href="/" >
                <img  src="/images/vara.png" alt="" height="70%" className="d-inline-block align-top" id='vara'/>
                <span className='nav-logo-span'></span>
                <img src="/images/logo.png" alt="" className="d-inline-block align-top" id='logo'/>
              </a>
            </Link>

            </div>

            <div></div>
            <div style={{color:'white', marginBottom:'20px', cursor:'pointer'}}>
            <Link href="/" className='nav-home'>
            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-house-fill" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="m8 3.293 6 6V13.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13.5V9.293l6-6zm5-.793V6l-2-2V2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5z"/>
              <path fill-rule="evenodd" d="M7.293 1.5a1 1 0 0 1 1.414 0l6.647 6.646a.5.5 0 0 1-.708.708L8 2.207 1.354 8.854a.5.5 0 1 1-.708-.708L7.293 1.5z"/>
            </svg>
            </Link>
            </div>
          </div>
        </nav>
      </header>
      <div className="container-fluid my-2 px-0 text-right">
        <div className="row no-gutters">
          <div className="col-11 mx-auto">

            <div className="container-fluid px-0 mt-4">
              <div className="row no-gutters">
                {withMenu && <div className="col-12 col-md-3 mb-3 pr-0 pr-md-5" id='side-menu'>
                  <List id={id} hasTerms={hasTerms} />
                  {hasTerms && <Link href={`/projects/[id]/pdf`} as={`/projects/${id}/pdf`}>
                    <a className="btn btn-primary mt-3 w-100" style={{color: '#fff', backgroundColor: '#5abe6a', border: '1px solid #5abe6a'}}>
                      التقرير الشهرى
                    </a>
                  </Link>}
                </div>}
                <div className="col-12 col-md-9 mx-auto">
                  {children}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
  )
}

export default Layout
