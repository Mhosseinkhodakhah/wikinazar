import { SubjectDetail } from '../../templates/SubjectDetail';

const SubjectPage = () => <SubjectDetail />;

export default SubjectPage;

export async function getStaticPaths() {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api/v1';
  const limit = 100;
  try {
    const firstRes = await fetch(`${apiUrl}/subjects?limit=${limit}`);
    const firstJson = await firstRes.json();
    const { data: firstData } = firstJson;
    const total = firstData?.total || 0;
    const allSubjects = [...(firstData?.subjects || [])];
    const pages = Math.ceil(total / limit);
    const pageRequests = Array.from({ length: pages - 1 }, (_, i) => i + 2).map(
      (page) =>
        fetch(`${apiUrl}/subjects?limit=${limit}&page=${page}`).then((r) =>
          r.json().then((j) => j.data?.subjects || []),
        ),
    );
    const results = await Promise.all(pageRequests);
    results.forEach((subjects) => allSubjects.push(...subjects));
    const paths = allSubjects.map((s: { id: string | number }) => ({
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
