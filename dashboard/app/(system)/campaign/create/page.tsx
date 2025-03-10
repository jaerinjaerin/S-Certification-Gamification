import { defaultValues } from '../_type/formSchema';
import CampaignCreateForm from '../_components/campaign-create-form';

export default function CreateCampaignPage() {
  return <CampaignCreateForm initialData={defaultValues} />;
}
