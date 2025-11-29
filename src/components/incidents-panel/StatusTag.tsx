import type { IncidentStatus } from "../mockData/types";

interface StatusTagProps {
  status: IncidentStatus;
}

export function StatusTag({ status }: StatusTagProps) {
  let color = '';
  
  switch (status) {
    case 'Pending': color = 'bg-red-100 text-red-700'; break;
    case 'Ongoing': color = 'bg-yellow-100 text-yellow-700'; break;
    case 'Completed': color = 'bg-green-100 text-green-700'; break;
    case 'Cancelled': color = 'bg-gray-200 text-gray-600'; break;
  }

  return (
    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${color}`}>
      {status}
    </span>
  );
}