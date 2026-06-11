import { SubjectDetail } from '../../templates/SubjectDetail';

const SubjectPage = () => <SubjectDetail />;

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking',
  };
}

export async function getStaticProps() {
  return { props: {} };
}

export default SubjectPage;
