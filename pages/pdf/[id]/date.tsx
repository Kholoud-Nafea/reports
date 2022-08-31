import Head from "next/head";
import { useRouter } from "next/router";

const Pdf = () => {
  const router = useRouter();
  const { id, month, year } = router.query;

  return (
    <>
      <Head>
        <title>Monthly Report · وكالة المياه</title>
      </Head>
      {id && month && year && (
        <iframe
          style={{ width: "100vw", height: "100vh", borderWidth: 0 }}
          src={`/api/pdf/${id}/date?month=${month}&year=${year}`}
        />
      )}
      <style global jsx>{`
        body {
          overflow: hidden;
        }
      `}</style>
    </>
  );
};

export default Pdf;
