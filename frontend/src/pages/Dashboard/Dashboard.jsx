import { PageContainer } from '../../components/layout/PageContainer';
import { StatCard } from '../../components/dashboard/StatCard';
export default function Dashboard() { return <PageContainer><h1 className="text-3xl font-bold mb-6">Dashboard</h1><div className="grid grid-cols-1 md:grid-cols-3 gap-6"><StatCard title="Total Plays" value="1,234" /><StatCard title="Top Artist" value="The Weeknd" /><StatCard title="Listening Time" value="45h" /></div></PageContainer>; }
