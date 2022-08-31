import { style } from 'd3';
import Link from 'next/link'
import { useState } from 'react';
type Props = {
  hasTerms?: boolean;
  id?: string | string[];
}

const List = ({ id, hasTerms }: Props) => {
  const [isActive, setIsActive] = useState(false)


  const handleToggle = () => {
    setIsActive(!isActive);
  };
const handelClassName = () => {
  setIsActive(!isActive);
  if (isActive){
    return 'list-link'
  } else {
    return 'list-group-item'
  }
}

  return (
    <ul className="list-group w-100 rtl p-0 ">
      <li className="list-group-item active" aria-current="true">شاشات ادخال البيانات</li>

      {hasTerms ? <>
        <li
          // onClick={handleToggle} className={handelClassName()}
          // onChange={()=>setIsActive(false)}
          className='list-group-item'
        >
          <Link href={`/projects/[id]/edit-terms`} as={`/projects/${id}/edit-terms`}>
            <a
            // onClick={handleToggle} className={isActive? 'list-link': ''}
            >تعديل بنود المشروع</a>
          </Link>
        </li>

        <li className='list-group-item'>
          <Link href={`/projects/[id]/terms-screen`} as={`/projects/${id}/terms-screen`}>
            <a>إدخال نسب الانجاز للبنود الرئيسية</a>
          </Link>
        </li>

        <li className='list-group-item'>
          <Link href={`/projects/[id]/monthly-screen`} as={`/projects/${id}/monthly-screen`}>
            <a>إدخال البيانات الشهرية</a>
          </Link>
        </li>

        <li className='list-group-item'>
          <Link href={`/projects/[id]/workers-screen`} as={`/projects/${id}/workers-screen`}>
            <a>إدخال أعداد العمالة المتواجدة بالموقع</a>
          </Link>
        </li>

        <li className='list-group-item'>
          <Link href={`/projects/[id]/achievement-screen`} as={`/projects/${id}/achievement-screen`}>
            <a>إدخال نسب الإنجاز التراكمية</a>
          </Link>
        </li>

        <li className='list-group-item'>
          <Link href={`/projects/[id]/executedvalues-screen`} as={`/projects/${id}/executedvalues-screen`}>
            <a>إدخال قيم الأعمال المنفذة</a>
          </Link>
        </li>
        <li className='list-group-item'>
          <Link href={`/projects/[id]/status-screen`} as={`/projects/${id}/status-screen`}>
            <a>إدخال حالة تحديث البيانات</a>
          </Link>
        </li>
        <li className='list-group-item'>
          <Link href={`/projects/[id]/weather-screen`} as={`/projects/${id}/weather-screen`}>
            <a>إدخال حالة الطقس</a>
          </Link>
        </li>

      </> :
        <li className="list-group-item">
          <Link href={`/projects/[id]/terms`} as={`/projects/${id}/terms`}>
            <a>اضافة بنود المشروع</a>
          </Link>
        </li>
      }


    </ul>
  )
}

export default List;
