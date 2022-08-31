import { useEffect } from 'react';
import { useRouter } from 'next/router'

import { useProjects } from '../../../context/projects';
import Layout from '../../../components/Layout'
import MonthsDropDown from '../../../components/MonthsDropDown';

const PDF = () => {

  const router = useRouter();
  const {
    projects, currentMonth,
    setCurrentMonth, getProjects, fetchProjectData,
  } = useProjects();
  const { id }  = router.query;

  useEffect(() => {
    projects.length ? fetchProjectData(+id) : getProjects()
  }, [projects, id]);


  const goToPdf = () => {
    const month = new Date(currentMonth).getMonth()+1;
    const year = new Date(currentMonth).getFullYear();
    window.open(
      `/pdf/${id}/date?month=${month}&year=${year}`,
      '_blank'
    );
  }

  return(
    <Layout title="وكالة المياه" id={id!}>
      <MonthsDropDown
        project={projects.find(p => p.id === +id)!} currentMonth={currentMonth}
        setCurrentMonth={setCurrentMonth}
        save={() => {}} viewBottomButtons={false}
      >
        <div className="h-100 d-flex justify-content-center align-items-center flex-column p-5">
          <img
            className="img-thumbnail rounded border" style={{maxHeight: "300px"}}
            src={"/images/image.YX2MX0.jpeg"} alt="التقرير الشهرى"
            onClick={goToPdf}
          />
        </div>
      </MonthsDropDown>
    </Layout>
  )
}

export default PDF;
