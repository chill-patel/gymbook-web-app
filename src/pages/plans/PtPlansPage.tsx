import { getAllPtPlansAPI, addPtPlanAPI, editPtPlanAPI, deletePtPlanAPI } from '@/api/gym';
import PlanListPage from './PlanListPage';

export default function PtPlansPage() {
  return (
    <PlanListPage
      title="PT Plan"
      breadcrumb="PT Plans"
      fetchAPI={getAllPtPlansAPI}
      addAPI={addPtPlanAPI}
      editAPI={editPtPlanAPI}
      deleteAPI={deletePtPlanAPI}
      usePlanId
    />
  );
}
