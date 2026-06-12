import { SubjectDetail } from '../../templates/SubjectDetail';

const SubjectPage = () => <SubjectDetail />;

export default SubjectPage;

export async function getStaticPaths() {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api/v1';
  try {
    const res = await fetch(`${apiUrl}/subjects?limit=10000`);
    const json = await res.json();
    const { data } = json;
    const subjects = data?.subjects || [];
    const paths = subjects.map((s: { id: string | number }) => ({
      params: { id: String(s.id) },
    }));
    return { paths, fallback: false };
  } catch {
    return { paths: [], fallback: false };
  }
}

export async function getStaticProps() {
  return { props: {} };
}
