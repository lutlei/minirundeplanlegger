import { redirect } from 'next/navigation';

export default function Home() {
  // In the App Router, this is the root page (/)
  // We want to use the Pages Router's index page instead
  redirect('/planner');
} 