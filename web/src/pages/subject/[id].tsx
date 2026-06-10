import { SubjectDetail } from '../../templates/SubjectDetail';

const SubjectPage = () => <SubjectDetail />;

export async function getStaticPaths() {
  const ids = Array.from({ length: 20 }, (_, i) => i + 1);
  return {
    paths: ids.map((id) => ({ params: { id: String(id) } })),
    fallback: false,
  };
}

export async function getStaticProps() {
  return { props: {} };
}

export default SubjectPage;
