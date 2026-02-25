import { getAllPackagesAPI, addPackageAPI, editPackageAPI, deletePackageAPI } from '@/api/gym';
import PlanListPage from './PlanListPage';

export default function PlansPage() {
  return (
    <PlanListPage
      title="Plan"
      breadcrumb="Membership Plans"
      fetchAPI={getAllPackagesAPI}
      addAPI={addPackageAPI}
      editAPI={editPackageAPI}
      deleteAPI={deletePackageAPI}
    />
  );
}
