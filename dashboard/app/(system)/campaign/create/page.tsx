import { defaultValues } from '../_type/formSchema';
import CampaignForm from '../_components/campaign-form';

export default function CreateCampaignPage() {
  return <CampaignForm initialData={defaultValues} isEditMode={false} />;
}
