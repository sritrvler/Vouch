import { redirect } from 'next/navigation';

export default function ViaPage() {
  redirect('/?ref=powered-by');
}
