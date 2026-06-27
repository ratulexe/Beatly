import { PageContainer } from '../../components/layout/PageContainer';
import { Avatar } from '../../components/ui/Avatar';
export default function Profile() { return <PageContainer><h1 className="text-3xl font-bold mb-6">Profile</h1><div className="flex items-center gap-4 mb-6"><Avatar /><div><h2 className="text-xl font-semibold">User Name</h2><p className="text-beatly-text-sec">user@example.com</p></div></div></PageContainer>; }
