import { type GetServerSidePropsContext } from 'next';

import { SubjectDetail } from '../../templates/SubjectDetail';

interface SubjectPageProps {
  id: string;
}

const SubjectPage = ({ id }: SubjectPageProps) => <SubjectDetail key={id} />;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const id = ctx.params?.id as string;
  if (!id) {
    return { notFound: true };
  }
  return { props: { id } };
}

export default SubjectPage;
