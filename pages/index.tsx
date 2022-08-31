import Link from 'next/link'
import { useEffect } from 'react';

import { useProjects } from '../context/projects';
import {ProjectsAttributes} from '../db/types';
import Layout from '../components/Layout'
import { useRouter } from 'next/router'

const Projects = () => {

  const { getProjects, projects, setTheRightMonth } = useProjects();
  const router = useRouter();

  useEffect(() => {
    if(!projects.length) getProjects();
  }, [])

  const gotoProject = (e: any) => {
    e.preventDefault();
    setTheRightMonth(+e.target.value)
    sessionStorage.setItem("projectId", e.target.value);
    router.push(`/projects/${e.target.value}`)
  }

  return(
    <Layout title="وكالة المياه" withMenu={false}>
      <div className="container d-flex justify-content-center my-5">
      <select
        className="w-50 p-2 w-md-75 float-right mr-2 mr-md-5" id='select-project'
        style={{height: "40px"}}
        onChange={gotoProject}
      >
      <option disabled className='option-color'>اختر المشروع</option>
      {projects?.length > 0 && projects.map((p: ProjectsAttributes) => (
        <option key={`p-${p.id}`} value={p.id}>
          {p.name}
        </option>
      ))}
      </select>
      <Link href="/projects/new">
        <a className="btn btn-success ml-2 ml-md-5">
          أضف مشروعا جديدا
        </a>
      </Link>
      </div>
    </Layout>
  )
}

export default Projects
